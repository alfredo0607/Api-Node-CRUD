import express from "express";
import {
  errorFormatter,
  formatErrorResponse,
  formatErrorValidator,
  formatResponse,
} from "../helpers/errorFormatter.js";
import { body, validationResult } from "express-validator";
import { pool } from "../config/db.js";

const routerCity = express.Router();

routerCity.get("/get-city", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const dbConnection = await pool.awaitGetConnection();

  try {
    const response = await dbConnection.awaitQuery(`SELECT * FROM ciudad`, []);

    if (!response[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(formatResponse({}, `No se encontró ciudades registrados`));
    }

    dbConnection.release();

    return res.status(201).json(
      formatResponse(
        {
          txt: `Numero de ciudades encontrados ${response.length}`,
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

routerCity.post(
  "/add-city",
  [body("nombre").notEmpty().withMessage("El nombre es un campo obligatorio")],
  async (req, res) => {
    const resultErrors = validationResult(req).formatWith(errorFormatter);
    if (!resultErrors.isEmpty()) {
      const errorResponse = formatErrorValidator(resultErrors);
      return res.status(422).json(formatResponse({}, errorResponse));
    }

    const dbConnection = await pool.awaitGetConnection();

    try {
      const { nombre } = req.body;

      await dbConnection.awaitQuery(`INSERT INTO ciudad (nombre) VALUES (?)`, [
        nombre,
      ]);

      dbConnection.release();

      return res.status(201).json(
        formatResponse(
          {
            message: "ciudad registrado con exito",
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

routerCity.put(
  "/update-city/:id",
  [body("nombre").notEmpty().withMessage("El nombre es un campo obligatorio")],
  async (req, res) => {
    const resultErrors = validationResult(req).formatWith(errorFormatter);
    if (!resultErrors.isEmpty()) {
      const errorResponse = formatErrorValidator(resultErrors);
      return res.status(422).json(formatResponse({}, errorResponse));
    }

    const dbConnection = await pool.awaitGetConnection();

    try {
      const { nombre } = req.body;
      const { id } = req.params;

      const existCiudad = await dbConnection.awaitQuery(
        `SELECT * FROM ciudad WHERE id= ? `,
        [id]
      );

      if (!existCiudad[0]) {
        dbConnection.release();
        return res
          .status(422)
          .json(
            formatResponse(
              {},
              `No se encontró una Ciudad registrado con el ID : ${id}`
            )
          );
      }

      await dbConnection.awaitQuery(`UPDATE ciudad SET nombre= ? WHERE id= ?`, [
        nombre,
        id,
      ]);

      dbConnection.release();

      return res.status(201).json(
        formatResponse(
          {
            message: "Ciudad actualizado con exito",
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

routerCity.delete("/delete-city/:id", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const dbConnection = await pool.awaitGetConnection();

  try {
    const { id } = req.params;

    const existPagos = await dbConnection.awaitQuery(
      `SELECT * FROM ciudad WHERE id= ? `,
      [id]
    );

    if (!existPagos[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(
          formatResponse(
            {},
            `No se encontró Ciudad registrado con el ID : ${id}`
          )
        );
    }

    const existRelations = await dbConnection.awaitQuery(
      `SELECT * FROM detalle WHERE ciudad_id= ? `,
      [id]
    );

    if (existRelations[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(
          formatResponse(
            {},
            `La ciudad registrado con el ID : ${id} no se puede eliminar ya que esta registrada con la `
          )
        );
    }

    await dbConnection.awaitQuery(`DELETE FROM ciudad WHERE id= ?`, [id]);

    dbConnection.release();

    return res.status(201).json(
      formatResponse(
        {
          message: "ciudad eliminado con exito",
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

routerCity.get("/search-city/:id", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const dbConnection = await pool.awaitGetConnection();

  try {
    const { id } = req.params;

    const ciudad = await dbConnection.awaitQuery(
      `SELECT * FROM ciudad WHERE id= ? `,
      [id]
    );

    if (!ciudad[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(
          formatResponse(
            {},
            `No se encontró Ciudad registrado con el ID : ${id}`
          )
        );
    }

    dbConnection.release();

    return res.status(201).json(formatResponse({ ciudad }, ""));
  } catch (error) {
    dbConnection.release();
    console.log(error);
    const errorFormated = formatErrorResponse(error);
    return res.status(500).json(errorFormated);
  }
});

export default routerCity;
