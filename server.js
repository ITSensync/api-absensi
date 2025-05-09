const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const absensiRoutes = require('./routes/absensiRoutes');
const swaggerUi = require('swagger-ui-express');
const setupSwagger = require("./config/swagger"); // Import Swagger
// const swaggerDocument = require('./swagger.json');
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3001;

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(
  cors({
    origin: "*", // Bisa disesuaikan dengan domain tertentu jika perlu
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());

// Inisialisasi Swagger
setupSwagger(app);


// Routes
app.use('/api/login', authRoutes);       // Untuk login/registrasi
app.use('/api/absensi', absensiRoutes); // Untuk data dari scanner

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
