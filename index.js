// const express = require('express');
// const tf = require('@tensorflow/tfjs-node');
// const admin = require('firebase-admin');
// const multer = require('multer');
// const sharp = require('sharp');
// const path = require('path');

// // Inisialisasi aplikasi Express
// const app = express();
// const PORT = process.env.PORT || 3000;

// // Inisialisasi Firebase Admin SDK
// const serviceAccount = require('./serviceAccountKey.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// const db = admin.firestore();

// // Fungsi untuk memuat model TensorFlow.js
// async function loadModel() {
//   try {
//     const model = await tf.loadLayersModel(`file://${path.join(__dirname, 'model/model.json')}`);
//     console.log('Model loaded successfully');
//     return model;
//   } catch (error) {
//     console.error('Error loading model:', error);
//     process.exit(1);  // Keluar dari proses jika model gagal dimuat
//   }
// }

// // Konfigurasi multer untuk unggah file
// const upload = multer({ storage: multer.memoryStorage() });

// (async () => {
//   // Muat model sebelum server mulai
//   const model = await loadModel();

//   // Endpoint untuk prediksi
//   app.post('/predict', upload.single('image'), async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).send('No file uploaded.');
//       }

//       // Proses gambar menggunakan sharp
//       const imageBuffer = req.file.buffer;
//       const imageTensor = tf.node.decodeImage(imageBuffer);

//       // Preprocess image sesuai dengan kebutuhan model
//       const resizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]); // Sesuaikan ukuran gambar sesuai dengan input model
//       const normalizedImage = resizedImage.div(tf.scalar(255.0)).expandDims();

//       // Prediksi menggunakan model
//       const prediction = model.predict(normalizedImage).dataSync();

//       // Prediksi kelas (asumsi 6 kelas)
//       const classes = ['kardus','kaca','logam','kertas','plastik','organik'];
//       const predictedClass = classes[prediction.indexOf(Math.max(...prediction))];

//       // Konversi prediksi ke objek JavaScript biasa
//       const predictionObject = {};
//       prediction.forEach((value, index) => {
//         predictionObject[`class_${index}`] = value;
//       });

//       // Menyimpan prediksi ke Firestore
//       const docRef = db.collection('predictions').doc();
//       await docRef.set({ prediction: predictionObject, predictedClass });

//       res.json({ prediction: predictionObject, predictedClass });
//     } catch (error) {
//       res.status(500).send(error.toString());
//     }
//   });

//   // Jalankan server setelah model berhasil dimuat
//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
// })();


///////////////////////////////


const express = require('express');
const tf = require('@tensorflow/tfjs-node');
const admin = require('firebase-admin');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 3000;

// Inisialisasi Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Fungsi untuk memuat model TensorFlow.js
async function loadModel() {
  try {
    const model = await tf.loadLayersModel(`file://${path.join(__dirname, 'model/model.json')}`);
    console.log('Model loaded successfully');
    return model;
  } catch (error) {
    console.error('Error loading model:', error);
    process.exit(1);  // Keluar dari proses jika model gagal dimuat
  }
}

// Konfigurasi multer untuk unggah file
const upload = multer({ storage: multer.memoryStorage() });

(async () => {
  // Muat model sebelum server mulai
  const model = await loadModel();

  // Endpoint untuk prediksi
  app.post('/predict', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }

      // Proses gambar menggunakan sharp
      const imageBuffer = req.file.buffer;
      const imageTensor = tf.node.decodeImage(imageBuffer);

      // Preprocess image sesuai dengan kebutuhan model
      const resizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]); // Sesuaikan ukuran gambar sesuai dengan input model
      const normalizedImage = resizedImage.div(tf.scalar(255.0)).expandDims();

      // Prediksi menggunakan model
      const rawPrediction = model.predict(normalizedImage);
      const prediction = rawPrediction.softmax().dataSync();

      // Prediksi kelas (asumsi 6 kelas)
      const classes = ['kardus','kaca','logam','kertas','plastik','organik'];
      const predictedClass = classes[prediction.indexOf(Math.max(...prediction))];

      // Konversi prediksi ke objek JavaScript biasa
      const predictionObject = {};
      prediction.forEach((value, index) => {
        predictionObject[`class_${index}`] = value;
      });

      // Menyimpan prediksi ke Firestore
      const docRef = db.collection('predictions').doc();
      await docRef.set({ prediction: predictionObject, predictedClass });

      res.json({ prediction: predictionObject, predictedClass });
    } catch (error) {
      res.status(500).send(error.toString());
    }
  });

  // Jalankan server setelah model berhasil dimuat
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
