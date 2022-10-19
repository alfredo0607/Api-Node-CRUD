import express from "express";
import dotenv from "dotenv";
import http from "http";
import docs from "./docs/index.js";
import swaggerUI from "swagger-ui-express";
import routerApp from "./controller/index.js";
import { logger } from "./configNode.js";
import cors from "cors";
import morgan from "morgan";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: "*" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const httpServer = http.createServer(app);

app.use("/api/v1/", routerApp);
app.use("/", swaggerUI.serve, swaggerUI.setup(docs));

httpServer.listen(process.env.PORT || 3006, () => {
  logger.info(`Server is running on port: ${3006}`);
  console.log(`Sever HTTP corriendo en el puerto : ${3006}`);
});

app.get("*", function (req, res) {
  res.status(404).send("Error 404 - Recurso no encontrado");
});
