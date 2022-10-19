import express from "express";
import routerAdviser from "./adviserController.js";
import routerCity from "./cityController.js";
import routerClients from "./clientsController.js";
import routerPayments from "./PaymentsController.js";
import routerPlans from "./plansController.js";
import routerServices from "./servicesController.js";

const routerApp = express.Router();

routerApp.use("/clients", routerClients);
routerApp.use("/adviser", routerAdviser);
routerApp.use("/payments", routerPayments);
routerApp.use("/plans", routerPlans);
routerApp.use("/services", routerServices);
routerApp.use("/city", routerCity);





export default routerApp;
