const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Dokumentasi API menggunakan Swagger',
    },
    servers: [
      {
        url: 'http://localhost:5000', // Sesuaikan dengan base URL API Anda
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'], // Sesuaikan dengan lokasi file route Anda
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};

module.exports = setupSwagger;
