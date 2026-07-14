const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://carrier-pilot:admin123@cluster0.kkdvuh4.mongodb.net/ewaste_db?retryWrites=true&w=majority';

async function inspect() {
  try {
    await mongoose.connect(MONGODB_URI);
    const reqId = process.argv[2] || '6a55d471b7b94ae9798a9e14';
    console.log(`Inspecting request ID: ${reqId}`);
    
    // Fetch directly from raw mongodb collection to bypass Mongoose Schema cast fallbacks
    const rawDoc = await mongoose.connection.db.collection('ewasterequests').findOne({ _id: new mongoose.Types.ObjectId(reqId) });
    
    if (!rawDoc) {
      console.log('Document not found in database.');
      process.exit(0);
    }
    
    console.log('RAW MONGODB DOCUMENT KEY VALUES:');
    console.log(JSON.stringify(rawDoc, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Inspection failed:', err.message);
    process.exit(1);
  }
}

inspect();
