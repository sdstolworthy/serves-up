import Express from "express";
import chalk from "chalk";
import { addRouteToApp } from "./route";
import { loadFile, checkIfFileExists } from "./files";
import path from "path";
export function runServer(filePath) {
  const serverDefinition = parseServerDefinitionFile(loadFile(filePath));
  const isValidDefinition = validateServerDefinition(serverDefinition);
  if (!isValidDefinition) {
    throw Error("The server definition is not valid");
  }
  let app = Express();
  const { port = 3000, routes = {} } = serverDefinition;
  for (let route of routes) {
    app = addRouteToApp(app, route, loadFixture(filePath));
  }
  console.info(chalk.green(`🚀 Server is listening on port ${port}`));
  app.listen(port);
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
