export const errorFormatter = ({ location, msg, param }) =>
  `${location}[${param}]: ${msg}`;

export const formatErrorValidator = (result) => {
  if (!result) return null;

  const firstError = result.array({ onlyFirstError: true })[0];

  return firstError;
};

export const formatResponse = (data, errors) => ({
  errors: errors,
  dataInfo: data,
});

export const formatErrorResponse = (error) => {
  if (typeof error === "string") {
    const errorMsg = `[SERVER_ERROR_500]: ${error}`;
    return formatResponse({}, errorMsg);
  } else {
    if (error.code) {
      const errorMsg = `[MYSQL_ERROR_${error.code}]: ${error.sqlMessage}`;
      return formatResponse({}, errorMsg);
    } else {
      const errorMsg = `[SERVER_ERROR_500]: Ocurrio un error inesperado en el servidor`;
      return formatResponse({}, errorMsg);
    }
  }
};
