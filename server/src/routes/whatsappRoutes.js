const express = require('express');
const router = express.Router();
const axios = require('axios');
const WhatsappContact = require('../models/WhatsappContact');
const WhatsappMessage = require('../models/WhatsappMessage');
const { protect } = require('../middleware/auth.middleware');

// --- CONTACTS ---

// GET all contacts
router.get('/contacts', protect, async (req, res) => {
  try {
    const query = req.user.schoolId ? { schoolId: req.user.schoolId } : {};
    const contacts = await WhatsappContact.find(query).sort({ lastMessageAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching contacts' });
  }
});

// POST new contact
router.post('/contacts', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    let phoneNumber = phone.replace(/\s+/g, '');
    if (!phoneNumber.startsWith('+')) phoneNumber = '+' + phoneNumber;

    const query = req.user.schoolId ? { phoneNumber, schoolId: req.user.schoolId } : { phoneNumber };
    let contact = await WhatsappContact.findOne(query);
    if (contact) {
      return res.status(400).json({ message: 'Contact with this number already exists' });
    }
    
    contact = new WhatsappContact({ 
      name, 
      phoneNumber, 
      lastMessageAt: new Date(),
      schoolId: req.user.schoolId || undefined,
      createdBy: req.user._id
    });
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET messages for a contact
router.get('/contacts/:id/messages', protect, async (req, res) => {
  try {
    const messages = await WhatsappMessage.find({ contactId: req.params.id }).sort({ timestamp: 1 });
    
    // Reset unread count
    await WhatsappContact.findByIdAndUpdate(req.params.id, { unreadCount: 0 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// --- MESSAGES (SEND) ---

router.post('/messages', protect, async (req, res) => {
  try {
    const { contactId, text } = req.body;
    const contact = await WhatsappContact.findById(contactId);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });

    // Ensure tenant matches
    if (req.user.schoolId && contact.schoolId && contact.schoolId.toString() !== req.user.schoolId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to contact' });
    }

    const newMessage = new WhatsappMessage({
      contactId: contact._id,
      direction: 'outgoing',
      messageType: 'text',
      text,
      status: 'pending',
      timestamp: new Date(),
      schoolId: req.user.schoolId || undefined
    });
    await newMessage.save();

    contact.lastMessageAt = new Date();
    await contact.save();

    const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const VERSION = process.env.WHATSAPP_API_VERSION || 'v17.0';

    if (TOKEN && PHONE_ID) {
      try {
        const metaRes = await axios.post(
          `https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`,
          {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: contact.phoneNumber.replace('+', ''),
            type: "text",
            text: { preview_url: false, body: text }
          },
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        );

        if (metaRes.data?.messages?.[0]?.id) {
          newMessage.whatsappMessageId = metaRes.data.messages[0].id;
          newMessage.status = 'sent';
          await newMessage.save();
        }
      } catch (metaErr) {
        newMessage.status = 'failed';
        newMessage.errorMessage = metaErr.response?.data?.error?.message || metaErr.message;
        await newMessage.save();
      }
    } else {
      console.log(`[MOCK WHATSAPP] Sent to ${contact.phoneNumber}: ${text}`);
      newMessage.status = 'sent';
      newMessage.whatsappMessageId = 'mock_id_' + Date.now();
      await newMessage.save();
    }

    res.status(200).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});


// UPDATE contact
router.put('/contacts/:id', protect, async (req, res) => {
  try {
    const contact = await WhatsappContact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    if (req.user.schoolId && contact.schoolId && contact.schoolId.toString() !== req.user.schoolId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    if (req.body.name) contact.name = req.body.name;
    if (req.body.phone) {
      let phoneNumber = req.body.phone.replace(/\s+/g, '');
      if (!phoneNumber.startsWith('+')) phoneNumber = '+' + phoneNumber;
      contact.phoneNumber = phoneNumber;
    }
    await contact.save();
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE contact
router.delete('/contacts/:id', protect, async (req, res) => {
  try {
    const contact = await WhatsappContact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    if (req.user.schoolId && contact.schoolId && contact.schoolId.toString() !== req.user.schoolId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await WhatsappMessage.deleteMany({ contactId: contact._id });
    await contact.deleteOne();
    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE message
router.delete('/messages/:id', protect, async (req, res) => {
  try {
    const msg = await WhatsappMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    if (req.user.schoolId && msg.schoolId && msg.schoolId.toString() !== req.user.schoolId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await msg.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- WEBHOOKS ---

router.get('/webhook', (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;

          if (value.messages && value.messages.length > 0) {
            const msg = value.messages[0];
            const senderPhone = '+' + msg.from;
            const waMsgId = msg.id;

            const exists = await WhatsappMessage.findOne({ whatsappMessageId: waMsgId });
            if (!exists) {
              let contact = await WhatsappContact.findOne({ phoneNumber: senderPhone });
              if (!contact) {
                const contactName = value.contacts?.[0]?.profile?.name || senderPhone;
                // Here, a real system might use a default tenant or deduce it from the receiving phone number
                contact = new WhatsappContact({ name: contactName, phoneNumber: senderPhone });
              }

              contact.unreadCount = (contact.unreadCount || 0) + 1;
              contact.lastMessageAt = new Date(msg.timestamp * 1000);
              await contact.save();

              const textContent = msg.type === 'text' ? msg.text.body : `[Received ${msg.type}]`;
              const newMsg = new WhatsappMessage({
                contactId: contact._id,
                direction: 'incoming',
                messageType: msg.type,
                text: textContent,
                whatsappMessageId: waMsgId,
                status: 'delivered',
                timestamp: new Date(msg.timestamp * 1000),
                schoolId: contact.schoolId
              });
              await newMsg.save();
            }
          }

          if (value.statuses && value.statuses.length > 0) {
            const statusObj = value.statuses[0];
            const waMsgId = statusObj.id;
            const newStatus = statusObj.status; 
            
            await WhatsappMessage.updateOne(
              { whatsappMessageId: waMsgId },
              { $set: { status: newStatus } }
            );
          }
        }
      }
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Webhook Error:', error);
    res.sendStatus(500);
  }
});

module.exports = router;

