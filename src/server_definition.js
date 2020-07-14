import Express from "express";
import chalk from "chalk";
import { addRouteToApp } from "./route";
import { loadFile, checkIfFileExists, getTruePath } from "./files";
import path from "path";
const cors = require("cors");

const morgan = require("morgan");

function createDefinitionFromFile({ inputFile }) {
  const filePath = getTruePath(inputFile);
  if (!checkIfFileExists(filePath)) {
    throw Error("The server definition file does not exist");
  }
  return parseServerDefinitionFile(loadFile(filePath));
}

function createDefinitionFromArguments({
  routePath,
  port,
  method,
  fixture,
  statusCode,
}) {
  let response;
  try {
    if (typeof fixture === "string") {
      response = JSON.parse(fixture);
    }
  } catch (e) {
    throw new Error("fixture must be a stringified JSON object or undefined");
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
        fixture: response,
      },
    ],
  };
}

function createDefinition({
  inputFile,
  routePath,
  method,
  fixture,
  port,
  statusCode,
}) {
  let serverDefinition;
  if (!!routePath) {
    serverDefinition = createDefinitionFromArguments({
      routePath,
      method,
      fixture,
      port,
      statusCode,
    });
  } else if (!!inputFile) {
    serverDefinition = createDefinitionFromFile(inputFile);
  } else {
    throw Error("Either route path or input file must be specified");
  }

  const isValidDefinition = validateServerDefinition(serverDefinition);
  if (!isValidDefinition) {
    throw Error("The server definition is not valid");
  }
  return serverDefinition;
}

export function runServer(serverOptions) {
  const serverDefinition = createDefinition(serverOptions);
  let app = Express();
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
  app.listen(schemaPort);
}

function validateServerDefinition(serverDefinition) {
  if (!!serverDefinition) {
    return true;
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
    try {
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
    } catch (e) {
      console.error(e);
      throw Error(`There was an error while loading a fixture: ${fixturePath}`);
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
