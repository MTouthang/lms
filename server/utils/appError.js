// extending the Error class and adding the statusCode to it.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // by passing this and this.constructor as argument, it ensures that the stack trace omits the constructor call itself
    // making it clear where the error originated successfully.
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
