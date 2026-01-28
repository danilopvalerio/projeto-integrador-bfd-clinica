import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

export const setupAutoSwagger = () => {
  const options: swaggerJSDoc.Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "🏥 API de Gestão de Clínica",
        version: "1.0.0",
        description: "Documentação automática da API",
      },
      servers: [
        {
          url: "http://localhost:3333/api",
          description: "Servidor de Desenvolvimento",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },

    // 🔥 AQUI ESTÁ O PODER
    apis: ["src/modules/**/*.ts"],
  };

  return swaggerJSDoc(options);
};

export { swaggerUi };
