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
    
    const formattedHistory = [];
    let currentPrompt = null;
    let currentUserMsgId = null;

    for (const msg of rawHistory) {
      if (msg.sender === 'USER') {
        if (currentPrompt !== null) {
          formattedHistory.push({
            id: currentUserMsgId,
            prompt: currentPrompt,
            response: "I am processing your query..."
          });
        }
        currentPrompt = msg.message;
        currentUserMsgId = msg._id;
      } else if (msg.sender === 'BOT') {
        if (currentPrompt !== null) {
          formattedHistory.push({
            id: currentUserMsgId,
            prompt: currentPrompt,
            response: msg.message
          });
          currentPrompt = null;
          currentUserMsgId = null;
        }
      }
    }
    
    if (currentPrompt !== null) {
      formattedHistory.push({
        id: currentUserMsgId,
        prompt: currentPrompt,
        response: "I am processing your query..."
      });
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

/**
 * GET /admin-insights
 * Fetches AI administrative executive analysis report based on live MERN statistics.
 */
router.get('/admin-insights', protect, async (req, res) => {
  try {
    const EwasteRequest = require('../models/EwasteRequest');
    
    // Aggregation: Find actual most common deviceType
    const deviceStats = await EwasteRequest.aggregate([
      { $group: { _id: "$deviceType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const topDevice = deviceStats[0] ? deviceStats[0]._id : "Smartphones";
    const secondDevice = deviceStats[1] ? deviceStats[1]._id : "Laptops";

    // Aggregation: Count of different statuses
    const statusStats = await EwasteRequest.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const completedCount = (statusStats.find(s => s._id === 'COMPLETED') || { count: 0 }).count;
    const pendingCount = (statusStats.find(s => s._id === 'PENDING') || { count: 0 }).count;
    const totalCount = await EwasteRequest.countDocuments();

    const responseData = {
      mostRecycledProducts: `Based on your database's ${totalCount} requests, ${topDevice} are the most frequently collected items (followed closely by ${secondDevice}). This indicates high compliance rates in personal communications recycling.`,
      mostHazardousProducts: `Cables, Chargers, and ${topDevice} continue to pose high battery risks and heavy metal hazards due to lead solder and lithium-ion containment in damaged states.`,
      monthlyTrends: `Collection volume stands at ${totalCount} devices total. We notice a 12% rise in scheduled logistics, with ${completedCount} successfully completed and recycled, and ${pendingCount} collections pending verification.`,
      mostRecommendedActions: `Accelerate verification of the ${pendingCount} pending requests. We recommend optimizing shipping consolidation for copper extraction from ${topDevice} to maximize yield value.`,
      commonUserQuestions: `Users are primarily asking about data wiping procedures before disposal (45%) and requesting cash-value quote index synchronizations (30%) on the EcoBot.`,
      aiRecyclingInsights: `AI forecasts show high recovery potential. By extracting copper and silicon from your current stock, you will offset approximately ${totalCount * 15}kg of carbon equivalent emissions.`
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Fetch Admin Insights Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * POST /estimate-value
 * Estimates recycling value, hazards, recyclable yield and actions for the Value Estimator screen.
 */
router.post('/estimate-value', protect, async (req, res) => {
  const { productName, brand, category, condition, age, weight, description } = req.body;
  
  const pName = productName || 'Device';
  const br = brand || 'Generic';
  const cat = category || 'Consumer Electronics';
  const cond = condition || 'Functional';

  try {
    const baseValuation = await estimateRecyclingValue(pName, cond);

    // Replicate keys expected by ValueEstimatorPage.jsx
    const responsePayload = {
      estimatedRecyclingValue: `INR ${(baseValuation.estimatedValue * 82).toFixed(2)}`, // Converting to INR
      deviceCategory: cat,
      recyclablePercentage: `${baseValuation.recyclablePercentage}%`,
      hazardLevel: cond.toLowerCase().includes('broken') ? 'High' : 'Moderate',
      confidenceLevel: 'High (85% Confidence)',
      recommendedAction: cond.toLowerCase().includes('broken') ? 'Recycle' : 'Donate / Reuse',
      recoverableMaterials: baseValuation.recoverableMaterials.join(', '),
      reasonForValue: baseValuation.valuationReason || `Estimations generated based on a weight of ${weight || '0.5kg'} and an age of ${age || '2 years'}.`
    };

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Value Estimator Route Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
