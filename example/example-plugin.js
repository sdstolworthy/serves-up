function requestInterceptor(req, res, next) {
  console.log('I am a request interceptor');
  if (next && typeof next === 'function') {
    next();
  }
}
function responseInterceptor(req,res,next) {
  console.log('I am a response interceptor');
  next();
}
module.exports = { requestInterceptor, responseInterceptor };