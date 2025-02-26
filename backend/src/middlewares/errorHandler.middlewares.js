import ApiError from "../utils/ApiError.utils.js";
import ErrorLog from "../models/errorLog.models.js";

const errorHandler = async (err, _req, res, _next) => {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const isHighPriority = isApiError ? err.isHighPriority : false;

  const response = {
    name: err.name || "UnknownError",
    message: err.message,
    errors: isApiError ? err.errors : [],
    success: false,
    data: null,
  };

  console.log({
    ...response,
    stack: err.stack,
    rawError: isApiError ? undefined : err,
  });

  if (statusCode === 500 || isHighPriority) {
    try {
      await ErrorLog.create({
        message: err.message,
        stack: err.stack,
        name: err.name || "UnknownError",
        statusCode,
        isInternalServerError: statusCode === 500,
        isHighPriority,
        rawError: isApiError ? undefined : err,
        additionalInfo: {
          path: _req.path,
          method: _req.method,
          query: _req.query,
          body: _req.body,
          timestamp: new Date()
        }
      });
    } catch (logError) {
      console.error("Error logging failed:", logError);
    }
  }

  res.status(statusCode).json(response);
};

export default errorHandler;