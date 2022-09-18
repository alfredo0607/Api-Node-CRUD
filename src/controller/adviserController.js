import express from "express";
import {
  errorFormatter,
  formatErrorResponse,
  formatErrorValidator,
  formatResponse,
} from "../helpers/errorFormatter.js";
import { body, validationResult } from "express-validator";
import { pool } from "../config/db.js";

const routerAdviser = express.Router();

routerAdviser.get("/get-adviser", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const dbConnection = await pool.awaitGetConnection();

  try {
    const response = await dbConnection.awaitQuery(`SELECT * FROM asesor`, []);

    if (!response[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(formatResponse({}, `No se encontró asesores registrados`));
    }

    dbConnection.release();

    return res.status(201).json(
      formatResponse(
        {
          txt: `Numero de asesores encontrados ${response.length}`,
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

routerAdviser.post(
  "/add-adviser",
  [
    body("name").notEmpty().withMessage("El nombre es un campo obligatorio"),
    body("surname")
      .notEmpty()
      .withMessage("El apellido es un campo obligatorio"),
    body("address")
      .notEmpty()
      .withMessage("La direccion es un campo obligatorio"),
    body("phone")
      .notEmpty()
      .withMessage("El numero de celular es un campo obligatorio"),
    body("email").isEmail().withMessage("Por favor ingrese un correo valido"),
    body("salary").isNumeric().withMessage("Por favor ingrese un valor valido"),
  ],
  async (req, res) => {
    const resultErrors = validationResult(req).formatWith(errorFormatter);
    if (!resultErrors.isEmpty()) {
      const errorResponse = formatErrorValidator(resultErrors);
      return res.status(422).json(formatResponse({}, errorResponse));
    }

    const dbConnection = await pool.awaitGetConnection();

    try {
      const { name, surname, address, phone, email, salary } = req.body;

      await dbConnection.awaitQuery(
        `INSERT INTO asesor (nombres, apellidos, direccion, telefono, correo, salario) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, surname, address, phone, email, salary]
      );

      dbConnection.release();

      return res.status(201).json(
        formatResponse(
          {
            message: "Asesor registrado con exito",
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
  }
);

routerAdviser.put(
  "/update-adviser/:id",
  [
    body("name").notEmpty().withMessage("El nombre es un campo obligatorio"),
    body("surname")
      .notEmpty()
      .withMessage("El apellido es un campo obligatorio"),
    body("address")
      .notEmpty()
      .withMessage("La direccion es un campo obligatorio"),
    body("phone")
      .notEmpty()
      .withMessage("El numero de celular es un campo obligatorio"),
    body("email").isEmail().withMessage("Por favor ingrese un correo valido"),
    body("salary").isNumeric().withMessage("Por favor ingrese un valor valido"),
  ],
  async (req, res) => {
    const resultErrors = validationResult(req).formatWith(errorFormatter);
    if (!resultErrors.isEmpty()) {
      const errorResponse = formatErrorValidator(resultErrors);
      return res.status(422).json(formatResponse({}, errorResponse));
    }

    const dbConnection = await pool.awaitGetConnection();

    try {
      const { name, surname, address, phone, email, salary } = req.body;
      const { id } = req.params;

      const existAsesor = await dbConnection.awaitQuery(
        `SELECT * FROM asesor WHERE id= ? `,
        [id]
      );

      if (!existAsesor[0]) {
        dbConnection.release();
        return res
          .status(422)
          .json(
            formatResponse(
              {},
              `No se encontró asesor registrado con el ID : ${id}`
            )
          );
      }

      await dbConnection.awaitQuery(
        `UPDATE asesor SET nombres= ?, apellidos= ?, direccion= ?, telefono= ?, correo= ?, salario= ?  WHERE id= ?`,
        [name, surname, address, phone, email, salary, id]
      );

      dbConnection.release();

      return res.status(201).json(
        formatResponse(
          {
            message: "Asesor actualizado con exito",
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
  }
);

routerAdviser.delete("/delete-adviser/:id", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const dbConnection = await pool.awaitGetConnection();

  try {
    const { id } = req.params;

    const existAsesor = await dbConnection.awaitQuery(
      `SELECT * FROM asesor WHERE id= ? `,
      [id]
    );

    if (!existAsesor[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(
          formatResponse(
            {},
            `No se encontró Asesor registrado con el ID : ${id}`
          )
        );
    }

    await dbConnection.awaitQuery(`DELETE FROM asesor WHERE id= ?`, [id]);

    dbConnection.release();

    return res.status(201).json(
      formatResponse(
        {
          message: "Asesor eliminado con exito",
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

export default routerAdviser;
