function asyncHandler(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(function (err) {
      next(err);
    });
  };
}

export default asyncHandler;

// arrow function
// const asyncHandler = (fn) => (req, res, next) => {
//   fn(req, res, next).catch((err) => next(err));
// };
