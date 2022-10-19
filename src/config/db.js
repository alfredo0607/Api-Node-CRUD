import mysql from "mysql-await";
import { logger } from "../configNode.js";

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "turismo",
});

pool.on(`acquire`, (connection) => {
  logger.info(`Connection %d acquired`, connection.threadId);
});

pool.on(`connection`, (connection) => {
  logger.info(`Connection %d connected`, connection.threadId);
});

pool.on(`enqueue`, () => {
  logger.info(`Waiting for available connection slot`);
});

pool.on(`release`, (connection) => {
  logger.info(`Connection %d released`, connection.threadId);
});

export { pool };
