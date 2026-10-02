const OpenAI = require('openai');
const AIConversation = require('../models/AIConversation');
const AIMessage = require('../models/AIMessage');
const { AI_TOOLS_DEFINITIONS, getStoofiSystemPrompt, executeTool } = require('../services/aiTools.service');
const { generateIntelligentFallbackResponse } = require('../services/aiFallback.service');

// Initialize OpenAI client lazily or safely
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new OpenAI({ apiKey: apiKey.trim() });
}

// ─────────────────────────────────────────────────────────────
// POST /api/ai/chat
// ─────────────────────────────────────────────────────────────
exports.chat = async (req, res) => {
  try {
    const { message, conversationId, pageContext } = req.body;
    const user = req.user;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    // 1. Find or create conversation
    let conversation;
    if (conversationId && conversationId !== 'new') {
      conversation = await AIConversation.findOne({ _id: conversationId, userId: user._id });
    }

    if (!conversation) {
      const autoTitle = message.trim().slice(0, 32) + (message.length > 32 ? '...' : '');
      conversation = await AIConversation.create({
        userId: user._id,
        title: autoTitle,
        role: user.role || 'User'
      });
    }

    // 2. Save user message to database
    const userMsgDoc = await AIMessage.create({
      conversationId: conversation._id,
      userId: user._id,
      role: 'user',
      content: message.trim()
    });

    // 3. Load recent conversation history
    const recentMessages = await AIMessage.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    let replyContent = '';
    let navAction = null;
    let executedToolsData = [];
    const openai = getOpenAIClient();

    // 4. Try calling OpenAI
    let openAiSucceeded = false;
    if (openai) {
      try {
        const systemPrompt = getStoofiSystemPrompt(user);
        const contextualSystemMsg = pageContext?.pathname
          ? `${systemPrompt}\n\nCURRENT BROWSER PAGE CONTEXT:\nThe user is currently viewing the page: "${pageContext.pathname}".`
          : systemPrompt;

        const messagesPayload = [
          { role: 'system', content: contextualSystemMsg }
        ];

        for (const msg of recentMessages) {
          messagesPayload.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        }

        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

        let completion = await openai.chat.completions.create({
          model,
          messages: messagesPayload,
          tools: AI_TOOLS_DEFINITIONS,
          tool_choice: 'auto',
          max_tokens: 1200,
          temperature: 0.7
        });

        let assistantMsg = completion.choices[0].message;

        // Handle tool calls loop
        if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
          messagesPayload.push(assistantMsg);

          for (const toolCall of assistantMsg.tool_calls) {
            const functionName = toolCall.function.name;
            let functionArgs = {};
            try {
              functionArgs = JSON.parse(toolCall.function.arguments || '{}');
            } catch (e) {
              functionArgs = {};
            }

            const toolResult = await executeTool(functionName, functionArgs, user);
            executedToolsData.push({ tool: functionName, result: toolResult });

            if (toolResult?.action === 'navigate') {
              navAction = {
                route: toolResult.route,
                label: toolResult.label
              };
            }

            messagesPayload.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              name: functionName,
              content: JSON.stringify(toolResult)
            });
          }

          const secondCompletion = await openai.chat.completions.create({
            model,
            messages: messagesPayload,
            max_tokens: 1200,
            temperature: 0.7
          });

          assistantMsg = secondCompletion.choices[0].message;
        }

        replyContent = assistantMsg.content || 'I processed your request.';
        openAiSucceeded = true;
      } catch (openAiError) {
        console.warn('OpenAI API call failed (Falling back to Stoofi Intelligent Engine):', openAiError?.message);
        openAiSucceeded = false;
      }
    }

    // 5. If OpenAI failed or had 429 quota limit, run Stoofi Intelligent NLP & Live Data Engine
    if (!openAiSucceeded) {
      const fallbackResult = await generateIntelligentFallbackResponse(message, user, pageContext);
      replyContent = fallbackResult.content;
      navAction = fallbackResult.navAction || navAction;
    }

    // 6. Save assistant message to database
    const assistantMsgDoc = await AIMessage.create({
      conversationId: conversation._id,
      userId: user._id,
      role: 'assistant',
      content: replyContent,
      navAction: navAction || undefined,
      dataCard: executedToolsData.length > 0 ? { type: 'tool_results', data: executedToolsData } : undefined
    });

    // Update conversation timestamp
    conversation.updatedAt = new Date();
    await conversation.save();

    return res.json({
      success: true,
      conversationId: conversation._id,
      conversationTitle: conversation.title,
      message: {
        id: assistantMsgDoc._id,
        role: 'assistant',
        content: replyContent,
        navAction: assistantMsgDoc.navAction,
        createdAt: assistantMsgDoc.createdAt
      }
    });

  } catch (error) {
    console.error('Stoofi AI Chat Fatal Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Stoofi AI encountered an issue. Please try again.'
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/ai/conversations
// ─────────────────────────────────────────────────────────────
exports.getConversations = async (req, res) => {
  try {
    const conversations = await AIConversation.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(30)
      .lean();

    return res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/ai/conversations/:id
// ─────────────────────────────────────────────────────────────
exports.getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await AIConversation.findOne({ _id: id, userId: req.user._id }).lean();

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const messages = await AIMessage.find({ conversationId: id, userId: req.user._id })
      .sort({ createdAt: 1 })
      .lean();

    return res.json({
      success: true,
      conversation,
      messages: messages.map(m => ({
        id: m._id,
        role: m.role,
        content: m.content,
        navAction: m.navAction,
        createdAt: m.createdAt
      }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/ai/conversations/:id
// ─────────────────────────────────────────────────────────────
exports.updateConversation = async (req, res) => {
  try {
    const { title } = req.body;
    const conversation = await AIConversation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title: title.trim() },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    return res.json({ success: true, data: conversation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/ai/conversations/:id
// ─────────────────────────────────────────────────────────────
exports.deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    await AIConversation.findOneAndDelete({ _id: id, userId: req.user._id });
    await AIMessage.deleteMany({ conversationId: id, userId: req.user._id });

    return res.json({ success: true, message: 'Conversation deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/ai/conversations/:id/messages
// ─────────────────────────────────────────────────────────────
exports.clearConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;
    await AIMessage.deleteMany({ conversationId: id, userId: req.user._id });

    return res.json({ success: true, message: 'Messages cleared.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/ai/status
// ─────────────────────────────────────────────────────────────
exports.getStatus = async (req, res) => {
  const hasKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '');
  return res.json({
    success: true,
    status: hasKey ? 'online' : 'fallback_engine',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    version: '1.0.0'
  });
};
