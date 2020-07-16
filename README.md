![Test Status](https://github.com/sdstolworthy/serves-up/workflows/Test/badge.svg)

[![Coverage Status](https://coveralls.io/repos/github/sdstolworthy/serves-up/badge.svg?branch=master)](https://coveralls.io/github/sdstolworthy/serves-up?branch=master)

# 🏄🏼‍♂️ Serves Up 🏄🏿‍♂️

Serves Up is a simple application for quickly mocking an API with a simple JSON file.

## About

Serves Up is intended to solve common pain points in development in testing. For example, a mobile application developer or frontend developer may want to quickly mock status codes that are cumbersome to emulate otherwise.
Additionally, Serves Up can be useful as a network log when a network inspector is unavailable.

In testing, Serves Up can be used to stub APIs for integration tests where using the real API is not necessary or not practical.
Additionally, Serves Up can be used in testing to ensure correct handling of common status codes.

Serves Up uses [Express](https://expressjs.com/) under the hood to create the server. 

## Usage 🦈

Serves Up requires the server definition to be passed in as the first positional argument to the command. For example:

``` bash
npx serves-up ./my-server-definition.json
```

Optionally, you can pass a port parameter that will override the port defined in the server definition:

``` bash
npx serves-up ./my-server-definition.json -p 3001
```

Alternatively, you can forego writing a schema definition file altogether and instead use the `route` command to build a one-liner to listen to a single route:

``` bash
npx serves-up route  "/*" --statusCode 200 --method get --method post --fixture '{"hello":"world"}' --headers '{"X-Custom-Header":"custom header"}'
```

## Server Definition File 🎣

The server definition file is a simple JSON file that defines the server's configuration and routes.

A minimal server config would look like this:

``` json
{
  "port": 3000,
  "routes": [
    {
      "path": "*"
    }
  ]
}
```

_Note that `port` is an optional field. It defaults to `3000` _

This would return a `200` response on all routes with an empty json object: `{}` .

### Customizing Routes 🏝️

Routes definitions support custom status codes, methods, and fixtures for the response.

For example, a server definition could have the same path specified multiple times that responds to different methods.

The following server config has two route definitions for the same path, and a wildcard definition for all other paths.

``` json
{
  "port": 3000,
  "routes": [
    {
      "path": "/app",
      "statusCode": 403,
      "methods": ["get", "post"]
    },
    {
      "path": "/app",
      "statusCode": 200,
      "methods": ["delete", "head"]
    },
    {
      "path": "*",
      "statusCode": 200
    }
  ]
}
```

### Adding fixtures 🌊

Route responses can be customized with fixtures. Fixtures can be inline JSON objects or strings with relative or absolute paths to fixtures.

Let's add fixtures to the route definition specified above.

``` json
{
  "port": 3000,
  "routes": [
    {
      "path": "/app",
      "statusCode": 401,
      "fixture": "./example-fixture.json",
      "methods": ["get", "post"]
    },
    {
      "path": "/app",
      "statusCode": 200,
      "fixture": { "john": "doe" },
      "methods": ["delete", "head"]
    },
    {
      "path": "*",
      "statusCode": 301
    }
  ]
}
```

### Custom headers 🐢

You can add headers to a response by specifying the headers key in the route definition. Headers should be of type Map<String, String>.

For example, the above definition with a custom header for the wildcard route would look like this:

``` json
{
  "port": 3000,
  "routes": [
    {
      "path": "/app",
      "statusCode": 401,
      "fixture": "./example-fixture.json",
      "methods": ["get", "post"]
    },
    {
      "path": "/app",
      "statusCode": 200,
      "fixture": { "john": "doe" },
      "methods": ["delete", "head"]
    },
    {
      "path": "*",
      "statusCode": 301,
      "headers": {
        "X-My-Custom-Header": "custom header"
      }
    }
  ]
}
```

### One and Done 🐠

If you're into one-liners, we've got you covered. You can run a single route definition with a single line command:

``` bash
npx serves-up route  "/*" --statusCode 200 --method get --method post --fixture '{"hello":"world"}' --headers '{"X-Custom-Header":"custom header"}' --port 3001
```

or, if typing words isn't your thing:

``` bash
npx serves-up route  "/*" -c 200 -m get -m post -f '{"hello":"world"}' -d '{"X-Custom-Header":"custom header"}' -p 3001
```

## Plugins 🐙 

Serves Up is pluggable. Plugins are simply modules that export at least one of the following functions:

* `requestInterceptor(request, response, next)`
These functions comply with the [Express middleware](https://expressjs.com/en/guide/using-middleware.html) interface. 

`requestInterceptors` are called before the request is responded to.

## Development ⛱️

Clone the repository and run `npm install` .
ESLint is used to ensure code conformity. In order to lint your code, run `npm run lint` .
All Pull Requests must have complete code coverage. Run `npm run test` to see code coverage reports.

Rollup is used to transpile the code. Run `npm run build` in order to build the project. The code will be output to `dist/servesup.js` .
Once the code has been built, it can be installed with `npm install -g .` (note the period) , and subsequently run with `serves-up` .
