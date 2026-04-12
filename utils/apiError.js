export const errorHandler = async (err, _req, res, _next) => {
  let error = { ...err };
  error.message = err.message;

  // Never leak stack traces or tokens in production
  const statusCode = error.statusCode || 500;
  const errorCode = error.code || 'INTERNAL_SERVER_ERROR';
  const errorMessage =
    statusCode === 500
      ? 'Server Error. Please try again later.'
      : error.message || 'An error occurred';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
    },
  });
};
