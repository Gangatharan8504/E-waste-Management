const express = require('express');
const router = express.Router();
const ChatHistory = require('../models/ChatHistory');
const { protect } = require('../middleware/auth');
const { chatWithEcoBot, estimateRecyclingValue } = require('../services/aiService');

/**
 * GET /chat/history
 * Replicates history schema format for React frontend: [{ prompt, response, id }]
 */
router.get('/chat/history', protect, async (req, res) => {
  try {
    const rawHistory = await ChatHistory.find({ user: req.user._id }).sort({ createdAt: 1 });
    
    // Group adjacent User messages and Bot messages into prompt/response pairs
    const formattedHistory = [];
    for (let i = 0; i < rawHistory.length; i += 2) {
      const userMsg = rawHistory[i];
      const botMsg = rawHistory[i + 1];
      if (userMsg && userMsg.sender === 'USER') {
        formattedHistory.push({
          id: userMsg._id,
          prompt: userMsg.message,
          response: botMsg ? botMsg.message : "I am processing your query..."
        });
      }
    }
    return res.status(200).json(formattedHistory);
  } catch (error) {
    console.error('Fetch Chat History Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * POST /chat
 * Replicates prompt -> response mapping for EcoBot.
 */
router.post('/chat', protect, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: 'Prompt content is required' });
  }

  try {
    // 1. Fetch context history
    const rawHistory = await ChatHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    const historyContext = rawHistory.reverse();

    // 2. Query EcoBot AI
    const answer = await chatWithEcoBot(prompt, historyContext);

    // 3. Save User Message
    const userMsg = new ChatHistory({
      user: req.user._id,
      message: prompt,
      sender: 'USER'
    });
    await userMsg.save();

    // 4. Save Bot Response
    const botMsg = new ChatHistory({
      user: req.user._id,
      message: answer,
      sender: 'BOT'
    });
    await botMsg.save();

    return res.status(200).json({
      id: botMsg._id,
      prompt,
      response: answer
    });
  } catch (error) {
    console.error('EcoBot Chat Route Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * POST /identify
 * Mock/AI helper for device classification
 */
router.post('/identify', protect, async (req, res) => {
  const { productName, brand, productDescription, condition } = req.body;
  return res.status(200).json({
    category: "Consumer Electronics",
    recyclable: true,
    estimatedWeightKgs: 2.5,
    hazards: ["Lead in solder", "Mercury in screen backlight", "Lithium battery risk"],
    primaryMaterials: ["Aluminum", "Copper", "Fiberglass", "Silica"]
  });
});

/**
 * POST /decision
 * Mock/AI helper for recycling decision recommendation
 */
router.post('/decision', protect, async (req, res) => {
  const { productName, brand, condition } = req.body;
  const isWorking = (condition || '').toLowerCase().includes('working');
  return res.status(200).json({
    action: isWorking ? "DONATE / REUSE" : "RECYCLE",
    score: isWorking ? 85 : 95,
    reason: isWorking 
      ? `Since the ${productName} is in working condition, donating it extends its lifecycle and yields positive educational impact.`
      : `Since the ${productName} is damaged, recycling recovers metals and prevents chemical leaching in landfills.`,
    nextStep: "Submit a pickup request on our dashboard to schedule safe logistics."
  });
});

/**
 * POST /disposal
 * Mock/AI helper for safe disposal guides
 */
router.post('/disposal', protect, async (req, res) => {
  const { deviceType } = req.body;
  return res.status(200).json({
    steps: [
      "1. Back up all personal files and data.",
      "2. Perform a factory reset to securely wipe personal settings.",
      "3. Remove external storage devices and SIM cards.",
      "4. Wrap the device carefully to avoid cracking the screen.",
      "5. Schedule a pickup or drop off at an authorized collection center."
    ]
  });
});

/**
 * POST /value
 * Mock/AI helper for fast scrap estimates
 */
router.post('/value', protect, async (req, res) => {
  const { deviceType, quantity } = req.body;
  const val = await estimateRecyclingValue(deviceType, 'damaged');
  return res.status(200).json({
    priceRange: `$${val.estimatedValue * 0.8} - $${val.estimatedValue * 1.2}`,
    estimatedValue: val.estimatedValue * (quantity || 1),
    confidence: "High (Market Index Sync)"
  });
});

/**
 * POST /impact
 * Mock/AI helper for environmental calculations
 */
router.post('/impact', protect, async (req, res) => {
  const { deviceType, quantity } = req.body;
  const qty = quantity || 1;
  return res.status(200).json({
    carbonSavedKgs: qty * 15,
    leadDivertedGrams: qty * 45,
    landfillDivertedKgs: qty * 2.8,
    equivalentTreesPlanted: qty * 0.8
  });
});

module.exports = router;
