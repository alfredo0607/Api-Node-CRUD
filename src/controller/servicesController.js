import express from "express";
import {
  errorFormatter,
  formatErrorResponse,
  formatErrorValidator,
  formatResponse,
} from "../helpers/errorFormatter.js";
import { body, validationResult } from "express-validator";
import { pool } from "../config/db.js";

const routerServices = express.Router();

routerServices.get("/get-services", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const dbConnection = await pool.awaitGetConnection();

  try {
    const response = await dbConnection.awaitQuery(
      `SELECT * FROM servicios`,
      []
    );

    if (!response[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(formatResponse({}, `No se encontró servicios registrados`));
    }

    dbConnection.release();

    return res.status(201).json(
      formatResponse(
        {
          txt: `Numero de servicios encontrados ${response.length}`,
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

routerServices.post(
  "/add-services",
  [
    body("descripcion")
      .notEmpty()
      .withMessage("La descripcion es un campo obligatorio"),
    body("valor").notEmpty().withMessage("El valor es un campo obligatorio"),
  ],
  async (req, res) => {
    const resultErrors = validationResult(req).formatWith(errorFormatter);
    if (!resultErrors.isEmpty()) {
      const errorResponse = formatErrorValidator(resultErrors);
      return res.status(422).json(formatResponse({}, errorResponse));
    }

    const dbConnection = await pool.awaitGetConnection();

    try {
      const { descripcion, valor } = req.body;

      await dbConnection.awaitQuery(
        `INSERT INTO servicios (descripcion, valor) VALUES (?, ?)`,
        [descripcion, valor]
      );

      dbConnection.release();

      return res.status(201).json(
        formatResponse(
          {
            message: "servicios registrado con exito",
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

routerServices.put(
  "/update-services/:id",
  [
    body("descripcion")
      .notEmpty()
      .withMessage("La descripcion es un campo obligatorio"),
    body("valor").notEmpty().withMessage("El valor es un campo obligatorio"),
  ],
  async (req, res) => {
    const resultErrors = validationResult(req).formatWith(errorFormatter);
    if (!resultErrors.isEmpty()) {
      const errorResponse = formatErrorValidator(resultErrors);
      return res.status(422).json(formatResponse({}, errorResponse));
    }

    const dbConnection = await pool.awaitGetConnection();

    try {
      const { descripcion, valor } = req.body;
      const { id } = req.params;

      const existServices = await dbConnection.awaitQuery(
        `SELECT * FROM servicios WHERE id= ? `,
        [id]
      );

      if (!existServices[0]) {
        dbConnection.release();
        return res
          .status(422)
          .json(
            formatResponse(
              {},
              `No se encontró un servicio registrado con el ID : ${id}`
            )
          );
      }

      await dbConnection.awaitQuery(
        `UPDATE servicios SET descripcion= ?, valor= ? WHERE id= ?`,
        [descripcion, valor, id]
      );

      dbConnection.release();

      return res.status(201).json(
        formatResponse(
          {
            message: "Servicio actualizado con exito",
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

routerServices.delete("/delete-services/:id", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const dbConnection = await pool.awaitGetConnection();

  try {
    const { id } = req.params;

    const existServices = await dbConnection.awaitQuery(
      `SELECT * FROM servicios WHERE id= ? `,
      [id]
    );

    if (!existServices[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(
          formatResponse(
            {},
            `No se encontró Services registrado con el ID : ${id}`
          )
        );
    }

    const existRelations = await dbConnection.awaitQuery(
      `SELECT * FROM detalle WHERE servicios_id= ? `,
      [id]
    );

    if (existRelations[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(
          formatResponse(
            {},
            `Services registrado con el ID : ${id} no se puede eliminar ya que esta relacionado con la tabla detalle`
          )
        );
    }

    await dbConnection.awaitQuery(`DELETE FROM servicios WHERE id= ?`, [id]);

    dbConnection.release();

    return res.status(201).json(
      formatResponse(
        {
          message: "Servicio eliminado con exito",
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

routerServices.get("/search-services/:id", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const dbConnection = await pool.awaitGetConnection();

  try {
    const { id } = req.params;

    const existServices = await dbConnection.awaitQuery(
      `SELECT * FROM servicios WHERE id= ? `,
      [id]
    );

    if (!existServices[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(
          formatResponse(
            {},
            `No se encontró Services registrado con el ID : ${id}`
          )
        );
    }

    dbConnection.release();

    return res.status(201).json(
      formatResponse(
        {
          existServices,
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

export default routerServices;
