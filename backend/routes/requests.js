const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const EwasteRequest = require('../models/EwasteRequest');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { analyzeDeviceImage, estimateRecyclingValue } = require('../services/aiService');
const { uploadImage } = require('../services/cloudinaryService');

// Multer Storage Setup
const uploadsFolder = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsFolder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * POST /analyze-image
 * Runs AI vision analysis and estimate valuation for uploaded file.
 */
router.post('/analyze-image', protect, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded' });
  }

  const deviceHint = req.body.deviceHint || 'Electronic Device';
  const filePath = req.file.path;

  try {
    // 1. Analyze device photo
    const analysis = await analyzeDeviceImage(filePath, deviceHint);

    // 2. Upload to Cloudinary (falls back to local file name if Cloudinary keys missing)
    const storageUrl = await uploadImage(req.file);

    // 3. Estimate valuation details if device is electronic
    let valuation = {
      estimatedValue: 0,
      recoverableMaterials: [],
      recyclablePercentage: 0,
      environmentalImpact: "",
      valuationReason: ""
    };

    if (analysis.isElectronicDevice) {
      valuation = await estimateRecyclingValue(
        analysis.deviceType || deviceHint, 
        analysis.aiDamageLevel || 'Moderate'
      );
    }

    // Prepare combined report
    const responsePayload = {
      imageUrl: storageUrl, // this is either the Cloudinary URL or local filename
      isElectronicDevice: analysis.isElectronicDevice,
      isSuitableForRecycling: analysis.isSuitableForRecycling,
      aiDamageLevel: analysis.aiDamageLevel || 'Minor',
      aiConfidenceScore: analysis.aiConfidenceScore || 90,
      aiSafetyRisks: analysis.aiSafetyRisks || '',
      aiRepairRecommendation: analysis.aiRepairRecommendation || '',
      aiReuseRecommendation: analysis.aiReuseRecommendation || '',
      aiRecyclingRecommendation: analysis.aiRecyclingRecommendation || '',
      aiSafeHandlingInstructions: analysis.aiSafeHandlingInstructions || '',
      aiSummary: analysis.aiSummary || '',
      rejectedReason: analysis.rejectedReason || '',
      estimatedValue: valuation.estimatedValue,
      recoverableMaterials: valuation.recoverableMaterials,
      recyclablePercentage: valuation.recyclablePercentage,
      environmentalImpact: valuation.environmentalImpact,
      valuationReason: valuation.valuationReason
    };

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Image Analysis Error:', error.message);
    return res.status(500).json({ message: 'Failed to complete AI verification analysis' });
  }
});

/**
 * POST /
 * Submits a new pickup request.
 */
router.post('/', protect, async (req, res) => {
  const {
    deviceType, brand, model, condition, quantity, pickupAddress,
    pickupLat, pickupLng, remarks, imageUrls,
    isElectronicDevice, isSuitableForRecycling, aiDamageLevel,
    aiConfidenceScore, aiSafetyRisks, aiRepairRecommendation,
    aiReuseRecommendation, aiRecyclingRecommendation,
    aiSafeHandlingInstructions, aiSummary, rejectedReason,
    estimatedValue, recoverableMaterials, recyclablePercentage,
    environmentalImpact, valuationReason
  } = req.body;

  // Strict check constraint: submit disabled if AI rejects device suitability
  if (isElectronicDevice === false) {
    return res.status(400).json({ 
      message: 'Cannot submit pickup request: AI analysis determined the uploaded item is not a valid electronic device.' 
    });
  }

  try {
    const pickupRequest = new EwasteRequest({
      user: req.user._id,
      deviceType,
      brand,
      model,
      condition,
      quantity: quantity || 1,
      pickupAddress,
      pickupLat,
      pickupLng,
      remarks,
      imageUrls: imageUrls || [],
      status: 'PENDING',
      isElectronicDevice,
      isSuitableForRecycling,
      aiDamageLevel,
      aiConfidenceScore,
      aiSafetyRisks,
      aiRepairRecommendation,
      aiReuseRecommendation,
      aiRecyclingRecommendation,
      aiSafeHandlingInstructions,
      aiSummary,
      rejectedReason,
      estimatedValue,
      recoverableMaterials,
      recyclablePercentage,
      environmentalImpact,
      valuationReason
    });

    await pickupRequest.save();

    // Generate Notifications
    const n1 = new Notification({
      user: req.user._id,
      title: 'AI Analysis Completed',
      message: `AI has successfully analyzed the device photos for your request #${pickupRequest._id}.`,
      requestId: pickupRequest._id
    });
    await n1.save();

    const n2 = new Notification({
      user: req.user._id,
      title: 'Pickup Request Submitted',
      message: `Your pickup request for the ${brand} ${deviceType} was successfully submitted.`,
      requestId: pickupRequest._id
    });
    await n2.save();

    return res.status(201).json(pickupRequest);
  } catch (error) {
    console.error('Submit Request Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * GET /my
 * Lists all requests for logged in user.
 */
router.get('/my', protect, async (req, res) => {
  try {
    const requests = await EwasteRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(requests);
  } catch (error) {
    console.error('Fetch User Requests Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * GET /:id
 * Fetch request by ID.
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await EwasteRequest.findById(req.params.id).populate('user', 'firstName lastName email phone');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Verify ownership or admin role
    if (request.user._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.status(200).json(request);
  } catch (error) {
    console.error('Fetch Single Request Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
