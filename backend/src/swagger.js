const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Inventory API",
      version: "1.0.0",
      description: "API documentation for the authentication system",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1", // Change based on your API base URL
      },
    ],
  },
  apis: [__dirname + "/v1/auth/auth.routes.js"], // Adjust path to your auth routes file
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
