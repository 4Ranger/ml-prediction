const { db } = require('../config/config');

async function getPredictionHistory(req, res) {
  try {
    const predictions = [];
    const snapshot = await db.collection('predictions').orderBy('timestamp', 'desc').get();

    snapshot.forEach(doc => {
      predictions.push({ id: doc.id, ...doc.data() });
    });

    res.json(predictions);
  } catch (error) {
    res.status(500).send(error.toString());
  }
}

module.exports = { getPredictionHistory };
