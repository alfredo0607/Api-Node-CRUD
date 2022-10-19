import express from "express";
import {
  errorFormatter,
  formatErrorResponse,
  formatErrorValidator,
  formatResponse,
} from "../helpers/errorFormatter.js";
import { body, validationResult } from "express-validator";
import { pool } from "../config/db.js";

const routerPlans = express.Router();

routerPlans.get("/get-plans", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const dbConnection = await pool.awaitGetConnection();

  try {
    const response = await dbConnection.awaitQuery(`SELECT * FROM planes`, []);

    if (!response[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(formatResponse({}, `No se encontró planes registrados`));
    }

    dbConnection.release();

    return res.status(201).json(
      formatResponse(
        {
          txt: `Numero de planes encontrados ${response.length}`,
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

routerPlans.post(
  "/add-plans",
  [
    body("nombre").notEmpty().withMessage("El nombre es un campo obligatorio"),
    body("descripcion")
      .notEmpty()
      .withMessage("La descripcion es un campo obligatorio"),
    body("fechainicio")
      .notEmpty()
      .withMessage("La fecha de inicio es un campo obligatorio"),
    body("fechafinal")
      .notEmpty()
      .withMessage("La fecha final es un campo obligatorio"),
    body("precio")
      .notEmpty()
      .withMessage("La fecha final es un campo obligatorio"),
  ],
  async (req, res) => {
    const resultErrors = validationResult(req).formatWith(errorFormatter);
    if (!resultErrors.isEmpty()) {
      const errorResponse = formatErrorValidator(resultErrors);
      return res.status(422).json(formatResponse({}, errorResponse));
    }

    const dbConnection = await pool.awaitGetConnection();

    try {
      const { nombre, descripcion, fechainicio, fechafinal, precio } = req.body;

      await dbConnection.awaitQuery(
        `INSERT INTO planes (nombre, descripcion, fechainicio, fechafinal, precio) VALUES (?, ?, ?, ?, ?)`,
        [nombre, descripcion, fechainicio, fechafinal, precio]
      );

      dbConnection.release();

      return res.status(201).json(
        formatResponse(
          {
            message: "Plan registrado con exito",
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

routerPlans.put(
  "/update-plans/:id",
  [
    body("nombre").notEmpty().withMessage("El nombre es un campo obligatorio"),
    body("descripcion")
      .notEmpty()
      .withMessage("La descripcion es un campo obligatorio"),
    body("fechainicio")
      .notEmpty()
      .withMessage("La fecha de inicio es un campo obligatorio"),
    body("fechafinal")
      .notEmpty()
      .withMessage("La fecha final es un campo obligatorio"),
    body("precio")
      .notEmpty()
      .withMessage("La fecha final es un campo obligatorio"),
  ],
  async (req, res) => {
    const resultErrors = validationResult(req).formatWith(errorFormatter);
    if (!resultErrors.isEmpty()) {
      const errorResponse = formatErrorValidator(resultErrors);
      return res.status(422).json(formatResponse({}, errorResponse));
    }

    const dbConnection = await pool.awaitGetConnection();

    try {
      const { nombre, descripcion, fechainicio, fechafinal, precio } = req.body;
      const { id } = req.params;

      const existPlanes = await dbConnection.awaitQuery(
        `SELECT * FROM planes WHERE id= ? `,
        [id]
      );

      if (!existPlanes[0]) {
        dbConnection.release();
        return res
          .status(422)
          .json(
            formatResponse(
              {},
              `No se encontró plan registrado con el ID : ${id}`
            )
          );
      }

      await dbConnection.awaitQuery(
        `UPDATE planes SET nombre= ?, descripcion= ?, fechainicio= ?, fechafinal= ?, precio= ? WHERE id= ?`,
        [nombre, descripcion, fechainicio, fechafinal, precio, id]
      );

      dbConnection.release();

      return res.status(201).json(
        formatResponse(
          {
            message: "Plan actualizado con exito",
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

routerPlans.delete("/delete-plans/:id", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const dbConnection = await pool.awaitGetConnection();

  try {
    const { id } = req.params;

    const existAsesor = await dbConnection.awaitQuery(
      `SELECT * FROM planes WHERE id= ? `,
      [id]
    );

    if (!existAsesor[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(
          formatResponse(
            {},
            `No se encontró planes registrado con el ID : ${id}`
          )
        );
    }

    const existRelations = await dbConnection.awaitQuery(
      `SELECT * FROM factura WHERE planes_id= ? `,
      [id]
    );

    if (existRelations[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(
          formatResponse(
            {},
            `El plan  registrado con el ID : ${id} no se puede eliminar ya que esta relacionado con la tabla factura`
          )
        );
    }

    await dbConnection.awaitQuery(`DELETE FROM planes WHERE id= ?`, [id]);

    dbConnection.release();

    return res.status(201).json(
      formatResponse(
        {
          message: "Plan eliminado con exito",
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

routerPlans.get("/search-plans/:id", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const dbConnection = await pool.awaitGetConnection();

  try {
    const { id } = req.params;

    const existAsesor = await dbConnection.awaitQuery(
      `SELECT * FROM planes WHERE id= ? `,
      [id]
    );

    if (!existAsesor[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(
          formatResponse({}, `No se encontró plan registrado con el ID : ${id}`)
        );
    }

    dbConnection.release();

    return res.status(201).json(
      formatResponse(
        {
          existAsesor,
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

export default routerPlans;
