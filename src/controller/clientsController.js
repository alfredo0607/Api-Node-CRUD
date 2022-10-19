import express from "express";
import {
  errorFormatter,
  formatErrorResponse,
  formatErrorValidator,
  formatResponse,
} from "../helpers/errorFormatter.js";
import { body, validationResult } from "express-validator";
import { pool } from "../config/db.js";

const routerClients = express.Router();

routerClients.get("/get-clients", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const dbConnection = await pool.awaitGetConnection();

  try {
    const response = await dbConnection.awaitQuery(`SELECT * FROM cliente`, []);

    if (!response[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(formatResponse({}, `No se encontró clientes registrados`));
    }

    dbConnection.release();

    return res.status(201).json(
      formatResponse(
        {
          txt: `Numero de clientes encontrados ${response.length}`,
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

routerClients.post(
  "/add-clients",
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
  ],
  async (req, res) => {
    const resultErrors = validationResult(req).formatWith(errorFormatter);
    if (!resultErrors.isEmpty()) {
      const errorResponse = formatErrorValidator(resultErrors);
      return res.status(422).json(formatResponse({}, errorResponse));
    }

    const dbConnection = await pool.awaitGetConnection();

    try {
      const { name, surname, address, phone, email } = req.body;

      await dbConnection.awaitQuery(
        `INSERT INTO cliente (nombres, apellidos, direccion, telefono, correo) VALUES (?, ?, ?, ?, ?)`,
        [name, surname, address, phone, email]
      );

      dbConnection.release();

      return res.status(201).json(
        formatResponse(
          {
            message: "Cliente registrado con exito",
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

routerClients.put(
  "/update-clients/:id",
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
  ],
  async (req, res) => {
    const resultErrors = validationResult(req).formatWith(errorFormatter);
    if (!resultErrors.isEmpty()) {
      const errorResponse = formatErrorValidator(resultErrors);
      return res.status(422).json(formatResponse({}, errorResponse));
    }

    const dbConnection = await pool.awaitGetConnection();

    try {
      const { name, surname, address, phone, email } = req.body;
      const { id } = req.params;

      const existClients = await dbConnection.awaitQuery(
        `SELECT * FROM cliente WHERE id= ? `,
        [id]
      );

      if (!existClients[0]) {
        dbConnection.release();
        return res
          .status(422)
          .json(
            formatResponse(
              {},
              `No se encontró cliente registrado con el ID : ${id}`
            )
          );
      }

      await dbConnection.awaitQuery(
        `UPDATE cliente SET nombres= ?, apellidos= ?, direccion= ?, telefono= ?, correo= ? WHERE id= ?`,
        [name, surname, address, phone, email, id]
      );

      dbConnection.release();

      return res.status(201).json(
        formatResponse(
          {
            message: "Cliente actualizado con exito",
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

routerClients.delete("/delete-clients/:id", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const dbConnection = await pool.awaitGetConnection();

  try {
   
    const { id } = req.params;

    const existClients = await dbConnection.awaitQuery(
      `SELECT * FROM cliente WHERE id= ? `,
      [id]
    );

    if (!existClients[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(
          formatResponse(
            {},
            `No se encontró cliente registrado con el ID : ${id}`
          )
        );
    }

    const existRelations = await dbConnection.awaitQuery(
      `SELECT * FROM factura WHERE cliente_id= ? `,
      [id]
    );


    
  if (existRelations[0]) {
      dbConnection.release();
      return res
        .status(422)
        .json(
          formatResponse(
            {},
            `El cliente  registrado con el ID : ${id} no se puede eliminar ya que esta relacionado con la tabla factura`
          )
        );
    }

    await dbConnection.awaitQuery(`DELETE FROM cliente WHERE id= ?`, [id]);

    dbConnection.release();

    return res.status(201).json(
      formatResponse(
        {
          message: "Cliente eliminado con exito",
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

export default routerClients;
