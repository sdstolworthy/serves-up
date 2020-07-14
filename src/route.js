export function addRouteToApp(app, route, handleFixtureLoad) {
  const requestHandler = createRequestHandler(route, handleFixtureLoad);
  if (!("path" in route)) {
    throw Error("`path` is a required key in every route");
  }
  if (route && route.methods && !Array.isArray(route.methods)) {
    throw Error(
      "A route's methods must be a list of HTTP methods or undefined"
    );
  }
  if (!route.methods.length) {
    app.all(route.path, requestHandler);
  }
  for (let method of route.methods) {
    if (typeof method !== "string") {
      throw Error(`invalid method specified: ${JSON.stringify(method)}`);
    }
    let cleanedMethod = method.toLowerCase().trim();
    if (validateHttpMethod(cleanedMethod)) {
      app[cleanedMethod](route.path, requestHandler);
    }
  }
  return app;
}

function createRequestHandler(route, handleFixtureLoad) {
  console.log(route);
  return (request, response) => {
    response
      .status(typeof route.statusCode === "number" ? route.statusCode : 200)
      .json(createFixture(route.fixture, handleFixtureLoad));
  };
}

function createFixture(fixture, handleFixtureLoad) {
  if (typeof fixture === "object") {
    return fixture;
  } else if (typeof fixture === "string") {
    return handleFixtureLoad(fixture);
  } else {
    return { hello: "world" };
  }
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
