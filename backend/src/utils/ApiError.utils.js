class ApiError extends Error {
  constructor(
    statusCode = 500,
    message = "something went wrong",
    errors = [],
    stack
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    this.data = null;
    if (stack) this.stack = stack;
    else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
