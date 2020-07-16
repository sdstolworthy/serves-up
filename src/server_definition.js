import { loadFile, checkIfFileExists, getTruePath, isValidJson } from './files';
import path from 'path';
import process from 'process';
import { Plugins } from './plugin_handler';

function createFixture(fixture, handleLoadFixture) {
  if (typeof fixture === 'object') {
    return fixture;
  } else if (isValidJson(fixture)) {
    return JSON.parse(fixture);
  } else if (!fixture) {
    return undefined;
  } else if (typeof fixture === 'string') {
    return handleLoadFixture(fixture);
  } else {
    throw new Error('fixture must be a stringified JSON object or undefined');
  }
}

function createHeaders(headers) {
  if (typeof headers === 'object') {
    return headers;
  } else if (isValidJson(headers)) {
    return JSON.parse(headers);
  } else if (!headers) {
    return undefined;
  } else {
    throw new Error('headers must be a stringified JSON object or undefined');
  }
}

function createDefinitionFromFile({ inputFile }, handleLoadFixture) {
  const filePath = getTruePath(inputFile);
  if (!checkIfFileExists(filePath)) {
    throw new Error('The server definition file does not exist');
  }
  const parsedDefinition = parseServerDefinitionFile(loadFile(filePath));
  return {
    port: parsedDefinition.port || 3000,
    plugins: (parsedDefinition.plugins || []).forEach(Plugins.registerGlobalPlugin),
    routes: (parsedDefinition && parsedDefinition.routes
      ? parsedDefinition.routes
      : []
    ).map((route) => {
      return {
        ...route,
        statusCode: route.statusCode || 200,
        fixture: createFixture(route.fixture, handleLoadFixture),
      };
    }),
  };
}
function createDefinitionFromArguments(
  {
    routePath,
    port,
    plugins = [],
    method,
    fixture: unparsedFixture,
    headers: unparsedHeaders,
    statusCode = 200,
  },
  handleLoadFixture
) {

  plugins.forEach(Plugins.registerGlobalPlugin);
  
  const fixture = createFixture(unparsedFixture, handleLoadFixture);

  const headers = createHeaders(unparsedHeaders);

  return {
    port: port || 3000,
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

export function createDefinition(
  { inputFile, routePath, method, fixture, port, headers, statusCode, plugins },
  handleLoadFixture
) {
  let serverDefinition;
  if (routePath) {
    serverDefinition = createDefinitionFromArguments(
      {
        routePath,
        method,
        fixture,
        headers,
        port,
        plugins,
        statusCode,
      },
      handleLoadFixture
    );
  } else if (inputFile) {
    serverDefinition = createDefinitionFromFile(
      { inputFile },
      handleLoadFixture
    );
  } else {
    throw Error('Either route path or input file must be specified');
  }

  return serverDefinition;
}
export function getReferenceFilePath(inputFile) {
  return inputFile ? getTruePath(inputFile) : process.cwd();
}

function getFixturePath(fixturePath, serverDefinitionPath) {
  if (path.isAbsolute(fixturePath)) {
    return fixturePath;
  } else {
    return path.join(path.dirname(serverDefinitionPath), fixturePath);
  }
}

export function onLoadFixture(serverDefinitionPath) {
  return function (fixturePath) {
    const truePath = getFixturePath(fixturePath, serverDefinitionPath);
    if (checkIfFileExists(truePath)) {
      const fixtureBuffer = loadFile(truePath);
      try {
        return JSON.parse(fixtureBuffer);
      } catch (e) {
        throw Error('Fixture could not be parsed to JSON');
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
      'Something went wrong while parsing the input file. Is your file a JSON file?'
    );
  }
}
