import express from "express";
import {
  errorFormatter,
  formatErrorResponse,
  formatErrorValidator,
  formatResponse,
} from "../helpers/errorFormatter.js";
import { body, validationResult } from "express-validator";
import { pool } from "../config/db.js";

const routerPayments = express.Router();

routerPayments.get("/get-payments", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const dbConnection = await pool.awaitGetConnection();

  try {
    const response = await dbConnection.awaitQuery(`SELECT * FROM pagos`, []);

    if (!response[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(formatResponse({}, `No se encontró pagos registrados`));
    }

    dbConnection.release();

    return res.status(201).json(
      formatResponse(
        {
          txt: `Numero de pagos encontrados ${response.length}`,
          response,
        },
        ""
      )
    );
  } catch (error) {
    dbConnection.release();
    console.log(error);
    const errorFormated = formatErrorResponse(error);
    return res.status(500).json(errorFormated);
  }
});

routerPayments.post(
  "/add-payments",
  [
    body("fecha").notEmpty().withMessage("La fecha es un campo obligatorio"),
    body("valor").notEmpty().withMessage("El valor es un campo obligatorio"),
    body("tipo").notEmpty().withMessage("El tipo es un campo obligatorio"),
    body("factura_id")
      .notEmpty()
      .withMessage("La factura_id es un campo obligatorio"),
  ],
  async (req, res) => {
    const resultErrors = validationResult(req).formatWith(errorFormatter);
    if (!resultErrors.isEmpty()) {
      const errorResponse = formatErrorValidator(resultErrors);
      return res.status(422).json(formatResponse({}, errorResponse));
    }

    const dbConnection = await pool.awaitGetConnection();

    try {
      const { fecha, valor, tipo, observacion, factura_id } = req.body;

      await dbConnection.awaitQuery(
        `INSERT INTO pagos (fecha, valor, tipo, observacion, factura_id ) VALUES (?, ?, ?, ?, ?)`,
        [fecha, valor, tipo, observacion, factura_id]
      );

      dbConnection.release();

      return res.status(201).json(
        formatResponse(
          {
            message: "Pagos registrado con exito",
          },
          ""
        )
      );
    } catch (error) {
      console.log(error);
      dbConnection.release();
      console.log(error);
      const errorFormated = formatErrorResponse(error);
      return res.status(500).json(errorFormated);
    }
  }
);

routerPayments.put(
  "/update-payments/:id",
  [
    body("fecha").notEmpty().withMessage("La fecha es un campo obligatorio"),
    body("valor").notEmpty().withMessage("El valor es un campo obligatorio"),
    body("tipo").notEmpty().withMessage("El tipo es un campo obligatorio"),
    body("factura_id")
      .notEmpty()
      .withMessage("La factura_id es un campo obligatorio"),
  ],
  async (req, res) => {
    const resultErrors = validationResult(req).formatWith(errorFormatter);
    if (!resultErrors.isEmpty()) {
      const errorResponse = formatErrorValidator(resultErrors);
      return res.status(422).json(formatResponse({}, errorResponse));
    }

    const dbConnection = await pool.awaitGetConnection();

    try {
      const { fecha, valor, tipo, observacion, factura_id } = req.body;
      const { id } = req.params;

      const existPagos = await dbConnection.awaitQuery(
        `SELECT * FROM pagos WHERE id= ? `,
        [id]
      );

      if (!existPagos[0]) {
        dbConnection.release();
        return res
          .status(422)
          .json(
            formatResponse(
              {},
              `No se encontró un pago registrado con el ID : ${id}`
            )
          );
      }

      await dbConnection.awaitQuery(
        `UPDATE pagos SET fecha= ?, valor= ?, tipo= ?, observacion= ?, factura_id= ? WHERE id= ?`,
        [fecha, valor, tipo, observacion, factura_id, id]
      );

      dbConnection.release();

      return res.status(201).json(
        formatResponse(
          {
            message: "Pago actualizado con exito",
          },
          ""
        )
      );
    } catch (error) {
      console.log(error);
      dbConnection.release();
      console.log(error);
      const errorFormated = formatErrorResponse(error);
      return res.status(500).json(errorFormated);
    }
  }
);

routerPayments.delete("/delete-payments/:id", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const dbConnection = await pool.awaitGetConnection();

  try {
    const { id } = req.params;

    const existPagos = await dbConnection.awaitQuery(
      `SELECT * FROM pagos WHERE id= ? `,
      [id]
    );

    if (!existPagos[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(
          formatResponse({}, `No se encontró Pago registrado con el ID : ${id}`)
        );
    }

    await dbConnection.awaitQuery(`DELETE FROM pagos WHERE id= ?`, [id]);

    dbConnection.release();

    return res.status(201).json(
      formatResponse(
        {
          message: "Pago eliminado con exito",
        },
        ""
      )
    );
  } catch (error) {
    dbConnection.release();
    console.log(error);
    const errorFormated = formatErrorResponse(error);
    return res.status(500).json(errorFormated);
  }
});

routerPayments.get("/search-payments/:id", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const dbConnection = await pool.awaitGetConnection();

  try {
    const { id } = req.params;

    const existPagos = await dbConnection.awaitQuery(
      `SELECT * FROM pagos WHERE id= ? `,
      [id]
    );

    if (!existPagos[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(
          formatResponse({}, `No se encontró Pago registrado con el ID : ${id}`)
        );
    }

    dbConnection.release();

    return res.status(201).json(
      formatResponse(
        {
          existPagos,
        },
        ""
      )
    );
  } catch (error) {
    dbConnection.release();
    console.log(error);
    const errorFormated = formatErrorResponse(error);
    return res.status(500).json(errorFormated);
  }
});

export default routerPayments;
