import ApiError from "../utils/ApiError.utils.js";

const errorHandler = (err, _req, res, _next) => {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;

  const response = {
    message: err.message,
    errors: isApiError ? err.errors : [],
    success: false,
    data: null,
  };

  // if (process.env.NODE_ENV == "devlopment") {
  //   response.debug = {
  //     stack: err.stack,
  //     name: err.name || "UnkownError",
  //     rawError: isApiError ? undefined : err,
  //   };
  // }

  response.debug = {
    stack: err.stack,
    name: err.name || "UnkownError",
    rawError: isApiError ? undefined : err,
  };
  // console.log(response);
  res.status(statusCode).json(response);
};

export default errorHandler;
