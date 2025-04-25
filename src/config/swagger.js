const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Photobooth API Documentation",
      version: "1.0.0",
      description: "API documentation for the Photobooth application",
      contact: {
        name: "API Support",
        url: "https://akbtrans.web.id/photobooth-api"
      }
    },
    servers: [
      {
        url: "https://akbtrans.web.id/photobooth-api",
        description: "Production server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./src/routes/*.js"]
};

module.exports = swaggerJsDoc(options);
