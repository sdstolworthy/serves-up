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

function resolvePluginPath(pluginPath) {
  try {

    let resolvedPath;
    if (path.isAbsolute(pluginPath) || pluginPath.includes('./')) {
      resolvedPath = path.join(process.cwd(), pluginPath);
    }
    else {
      resolvedPath = require.resolve(pluginPath);
    }
    return resolvedPath;
  } catch (e) {
    console.error(e);
    return null;
  }

}

function requirePluginFromPath(pluginPath) {
  try {
    const resolvedPath = resolvePluginPath(pluginPath);
    const loadedPlugin = require(require.resolve(resolvedPath));
    loadedPlugin.__plugin_name = pluginPath;
    return loadedPlugin;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function createPlugin(registerablePlugin) {
  let plugin;
  if (typeof registerablePlugin === 'object') {
    plugin = registerablePlugin;
  } else {
    plugin = requirePluginFromPath(registerablePlugin);
  }

  Plugins.registerGlobalPlugin(plugin);
  return plugin;
}

function createDefinitionFromFile({ inputFile }, handleLoadFixture) {
  const filePath = getTruePath(inputFile);
  if (!checkIfFileExists(filePath)) {
    throw new Error('The server definition file does not exist');
  }
  const parsedDefinition = parseServerDefinitionFile(loadFile(filePath));
  return new ServerDefinition({
    port: parsedDefinition.port || 3000,
    plugins: (parsedDefinition.plugins || []).map(createPlugin),
    routes: (parsedDefinition && parsedDefinition.routes ? parsedDefinition.routes : []).map(route => new Route({
      path: route.path,
      fixture: createFixture(route.fixture, handleLoadFixture),
      headers: route.headers,
      method: route.methods,
      statusCode: route.statusCode || 200
    }))
  });
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

  plugins.forEach(createPlugin);

  const fixture = createFixture(unparsedFixture, handleLoadFixture);

  const headers = createHeaders(unparsedHeaders);

  return new ServerDefinition({
    port: port || 3000, routes: [new Route({
      path: routePath, method: !!method && Array.isArray(method)
        ? method.map((m) => m.toLowerCase())
        : undefined, statusCode, fixture, headers
    })],
  });
}

/**
 * @typedef {Object} Route
 * @property {string} path
 * @property {string[]} method
 * @property {number} statusCode
 * @property {Object} fixture
 * @property {Object} headers
 */

class Route {
  constructor({ path: routePath, method, statusCode, fixture, headers }) {
    this.path = routePath;
    this.methods =
      !!method && Array.isArray(method)
        ? method.map((m) => m.toLowerCase())
        : undefined;
    this.statusCode = statusCode;
    this.fixture = fixture;
    this.headers = headers;
  }
}


/**
 * @typedef {Object} ServerDefinition
 * @property {number} port
 * @property {Route[]} routes
 * @property {any[]} plugins
 */

class ServerDefinition {
  /**
   * 
   * @param {ServerDefinition} serverDefinitionParams definition params 
   */
  constructor({ port, routes, plugins }) {
    this.port = port;
    this.routes = routes;
    this.plugins = plugins;
  }

}

/**
 * @typedef {Object} DefinitionFactoryParameters
 * @property {string} inputFile
 * @property {string} routePath
 * @property {string[]} method
 * @property {Object} fixture
 * @property {number} port
 * @property {Object} headers
 * @property {any[]} plugins
 */

/**
 * 
 * @param {DefinitionFactoryParameters} parameters 
 * @param {Function} handleLoadFixture 
 * @returns {ServerDefinition} a server definition
 */
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
