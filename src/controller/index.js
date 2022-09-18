import express from "express";
import routerAdviser from "./adviserController.js";
import routerClients from "./clientsController.js";

const routerApp = express.Router();

routerApp.use("/clients", routerClients);
routerApp.use("/adviser", routerAdviser);

export default routerApp;
