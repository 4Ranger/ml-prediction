const express = require('express');
const dotenv = require('dotenv');
const router = require('./routers/router');
const loadModel = require('./models/modelLoader');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
  // Muat model sebelum server mulai
  const model = await loadModel();
  app.locals.model = model; // Simpan model di app.locals

  // Gunakan router prediksi
  app.use('/', router);

  // Jalankan server setelah model berhasil dimuat
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
