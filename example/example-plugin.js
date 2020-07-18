function requestInterceptor(req, res, next) {
  console.log('I am a request interceptor');
  if (next && typeof next === 'function') {
    next();
  }
}
module.exports = { requestInterceptor };