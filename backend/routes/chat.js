const express = require('express');
const router = express.Router();
const ChatHistory = require('../models/ChatHistory');
const { protect } = require('../middleware/auth');
const { chatWithEcoBot } = require('../services/aiService');

/**
 * GET /history
 * Fetches user chat history with EcoBot.
 */
router.get('/history', protect, async (req, res) => {
  try {
    const history = await ChatHistory.find({ user: req.user._id }).sort({ createdAt: 1 });
    return res.status(200).json(history);
  } catch (error) {
    console.error('Fetch Chat History Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * POST /ecobot
 * Sends a chat message to EcoBot and returns response.
 */
router.post('/ecobot', protect, async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'Message content is required' });
  }

  try {
    // 1. Fetch recent chat history context for context window
    const rawHistory = await ChatHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // reverse to keep in chronological order for AI
    const historyContext = rawHistory.reverse();

    // 2. Query EcoBot AI responder
    const responseText = await chatWithEcoBot(message, historyContext);

    // 3. Save User Message
    const userMsg = new ChatHistory({
      user: req.user._id,
      message,
      sender: 'USER'
    });
    await userMsg.save();

    // 4. Save Bot Response
    const botMsg = new ChatHistory({
      user: req.user._id,
      message: responseText,
      sender: 'BOT'
    });
    await botMsg.save();

    return res.status(200).json(botMsg);
  } catch (error) {
    console.error('EcoBot Query Error:', error.message);
    return res.status(500).json({ message: 'Failed to chat with EcoBot' });
  }
});

module.exports = router;
