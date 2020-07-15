export function addRouteToApp(app, route) {
  const requestHandler = createRequestHandler(route);
  if (!("path" in route)) {
    throw Error("`path` is a required key in every route");
  }
  if (!!route && !!route.methods && !Array.isArray(route.methods)) {
    throw Error(
      "A route's methods must be a list of HTTP methods or undefined"
    );
  }
  if (!route.methods || !route.methods.length) {
    app.all(route.path, requestHandler);
  } else {
    for (let method of route.methods) {
      if (typeof method !== "string") {
        throw Error(`invalid method specified: ${JSON.stringify(method)}`);
      }
      let cleanedMethod = method.toLowerCase().trim();
      if (validateHttpMethod(cleanedMethod)) {
        app[cleanedMethod](route.path, requestHandler);
      }
    }
  }
  return app;
}

function createRequestHandler(route) {
  if (route.statusCode && typeof route.statusCode !== "number") {
    throw Error(`Status code must be a number: ${route.path}`);
  }
  const responseHeaders = !!route.headers ? route.headers : {};
  return (request, response) => {
    response
      .set(responseHeaders)
      .status(typeof route.statusCode === "number" ? route.statusCode : 200)
      .json(route.fixture);
  };
}

function validateHttpMethod(method) {
  const VALID_METHODS = [
    "head",
    "get",
    "options",
    "post",
    "put",
    "patch",
    "delete",
  ];

  return VALID_METHODS.includes(method);
}
