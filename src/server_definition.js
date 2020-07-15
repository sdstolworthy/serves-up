import Express from "express";
import chalk from "chalk";
import { addRouteToApp } from "./route";
import { loadFile, checkIfFileExists, getTruePath, isValidJson } from "./files";
import path from "path";
const cors = require("cors");

const morgan = require("morgan");
let app = Express();
let server;

function createDefinitionFromFile({ inputFile }) {
  const filePath = getTruePath(inputFile);
  if (!checkIfFileExists(filePath)) {
    throw new Error("The server definition file does not exist");
  }
  return parseServerDefinitionFile(loadFile(filePath));
}

function createDefinitionFromArguments({
  routePath,
  port,
  method,
  fixture: unparsedFixture,
  headers: unparsedHeaders,
  statusCode,
}) {
  let fixture;
  if (typeof unparsedFixture === "object") {
    fixture = unparsedFixture;
  } else if (isValidJson(unparsedFixture)) {
    fixture = JSON.parse(unparsedFixture);
  } else if (!unparsedFixture) {
  } else {
    throw new Error("fixture must be a stringified JSON object or undefined");
  }
  let headers;
  if (typeof unparsedHeaders === "object") {
    headers = unparsedHeaders;
  } else if (isValidJson(unparsedHeaders)) {
    headers = JSON.parse(unparsedHeaders);
  } else if (!unparsedHeaders) {
  } else {
    throw new Error("headers must be a stringified JSON object or undefined");
  }

  return {
    port,
    routes: [
      {
        path: routePath,
        methods:
          !!method && Array.isArray(method)
            ? method.map((m) => m.toLowerCase())
            : undefined,
        statusCode,
        fixture,
        headers,
      },
    ],
  };
}

export function createDefinition({
  inputFile,
  routePath,
  method,
  fixture,
  port,
  headers,
  statusCode,
}) {
  let serverDefinition;
  if (!!routePath) {
    serverDefinition = createDefinitionFromArguments({
      routePath,
      method,
      fixture,
      headers,
      port,
      statusCode,
    });
  } else if (!!inputFile) {
    serverDefinition = createDefinitionFromFile({ inputFile });
  } else {
    throw Error("Either route path or input file must be specified");
  }

  return serverDefinition;
}

export function runServer(serverOptions) {
  const serverDefinition = createDefinition(serverOptions);
  app.use(morgan("combined"));
  app.use(cors());
  const { port: schemaPort = 3000, routes = {} } = serverDefinition;
  const filePath = !!serverOptions.inputFile
    ? getTruePath(serverOptions.inputFile)
    : process.cwd();
  for (let route of routes) {
    app = addRouteToApp(app, route, loadFixture(filePath));
  }
  console.info(chalk.green(`🚀 Server is listening on port ${schemaPort}`));
  server = app.listen(schemaPort);
  return app;
}

export function close() {
  if (!!server && typeof server.close === "function") {
    server.close();
  }
}

function getFixturePath(fixturePath, serverDefinitionPath) {
  if (path.isAbsolute(fixturePath)) {
    return fixturePath;
  } else {
    return path.join(path.dirname(serverDefinitionPath), fixturePath);
  }
}

function loadFixture(serverDefinitionPath) {
  return function (fixturePath) {
    const truePath = getFixturePath(fixturePath, serverDefinitionPath);
    if (checkIfFileExists(truePath)) {
      const fixtureBuffer = loadFile(truePath);
      try {
        return JSON.parse(fixtureBuffer);
      } catch (e) {
        throw Error("Fixture could not be parsed to JSON");
      }
    } else {
      throw Error(`Fixture does not exist at path ${fixturePath}`);
    }
  };
}

function parseServerDefinitionFile(fileStream) {
  try {
    return JSON.parse(fileStream);
  } catch (e) {
    throw Error(
      "Something went wrong while parsing the input file. Is your file a JSON file?"
    );
  }
}
