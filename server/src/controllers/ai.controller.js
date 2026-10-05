const OpenAI = require('openai');
const axios = require('axios');
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

function getGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  return key && key.trim() !== '' ? key.trim() : null;
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

    // 3. Load recent conversation history (last 10 messages)
    const recentMessages = await AIMessage.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    let replyContent = '';
    let navAction = null;
    let executedToolsData = [];
    let providerSucceeded = false;

    const openai = getOpenAIClient();
    const geminiKey = getGeminiApiKey();
    const systemPrompt = getStoofiSystemPrompt(user);
    const contextualSystemMsg = pageContext?.pathname
      ? `${systemPrompt}\n\nCURRENT BROWSER PAGE CONTEXT:\nThe user is currently viewing the page: "${pageContext.pathname}".`
      : systemPrompt;

    // 4. Try OpenAI if configured
    if (openai && !providerSucceeded) {
      try {
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

        // Handle OpenAI tool calls loop
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
        providerSucceeded = true;
      } catch (openAiError) {
        console.warn('OpenAI API call failed:', openAiError?.message);
        providerSucceeded = false;
      }
    }

    // 5. Try Gemini API if OpenAI failed/not configured and Gemini Key is available
    if (geminiKey && !providerSucceeded) {
      try {
        const geminiContents = [];
        for (const msg of recentMessages) {
          geminiContents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          });
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const geminiResponse = await axios.post(
          geminiUrl,
          {
            contents: geminiContents,
            systemInstruction: { parts: [{ text: contextualSystemMsg }] },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1200
            }
          },
          { timeout: 12000 }
        );

        const cand = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (cand && cand.trim()) {
          replyContent = cand.trim();
          providerSucceeded = true;
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed:', geminiError?.message);
        providerSucceeded = false;
      }
    }

    // 6. If external LLMs failed or not configured, use Stoofi Intelligent Natural NLP Engine with Full Memory
    if (!providerSucceeded) {
      const fallbackResult = await generateIntelligentFallbackResponse(message, user, pageContext, recentMessages);
      replyContent = fallbackResult.content;
      navAction = fallbackResult.navAction || navAction;
    }

    // 7. Save assistant message to database
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
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '');
  const hasGemini = Boolean(getGeminiApiKey());
  return res.json({
    success: true,
    status: (hasOpenAI || hasGemini) ? 'online' : 'intelligent_nlp_engine',
    provider: hasOpenAI ? 'OpenAI' : hasGemini ? 'Google Gemini' : 'Stoofi NLP Live Engine',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    version: '2.0.0'
  });
};
