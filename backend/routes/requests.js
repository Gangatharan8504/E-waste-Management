const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const EwasteRequest = require('../models/EwasteRequest');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { sendPickupSubmitted } = require('../services/emailService');
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
 * POST /
 * Submits a new pickup request.
 */
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  const {
    deviceType, brand, model, condition, quantity, pickupAddress,
    pickupLat, pickupLng, remarks
  } = req.body;

  try {
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImage(file);
        if (url) imageUrls.push(url);
      }
    }

    const qty = parseInt(quantity) || 1;

    const pickupRequest = new EwasteRequest({
      user: req.user._id,
      deviceType,
      brand,
      model,
      condition,
      quantity: qty,
      pickupAddress,
      pickupLat: pickupLat ? parseFloat(pickupLat) : undefined,
      pickupLng: pickupLng ? parseFloat(pickupLng) : undefined,
      remarks,
      imageUrls,
      status: 'PENDING'
    });

    await pickupRequest.save();

    // Generate Notifications
    const n = new Notification({
      user: req.user._id,
      title: 'Pickup Request Submitted',
      message: `Your pickup request for the ${brand || ''} ${deviceType || ''} was successfully submitted.`,
      requestId: pickupRequest._id
    });
    await n.save();

    // Send confirmation email
    await sendPickupSubmitted(req.user.email, deviceType, qty, pickupAddress, req.user.firstName);

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
    const mapped = requests.map(r => {
      const obj = r.toObject();
      obj.id = obj._id.toString();
      return obj;
    });
    return res.status(200).json(mapped);
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

    const obj = request.toObject();
    obj.id = obj._id.toString();
    if (obj.user) {
      obj.userName = `${obj.user.firstName} ${obj.user.lastName}`;
      obj.userEmail = obj.user.email;
      obj.userPhone = obj.user.phone;
    }

    return res.status(200).json(obj);
  } catch (error) {
    console.error('Fetch Single Request Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
