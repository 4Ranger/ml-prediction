const express = require('express');
const multer = require('multer');
const { predictImage } = require('../controllers/predictionController');
const { getPredictionHistory } = require('../controllers/historyController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/predict', upload.single('image'), predictImage);
router.get('/history', getPredictionHistory);

module.exports = router;
