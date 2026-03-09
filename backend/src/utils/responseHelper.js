export const successResponse = (res, data, status = 200, message = 'Success') => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};
