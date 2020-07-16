import path from 'path';
export class Plugins {
  static get plugins() {
    if (!Plugins.prototype.__plugins) {
      Plugins.prototype.__plugins = [];
    }
    return Plugins.prototype.__plugins;
  }
  static registerGlobalPlugin(registerablePlugin)  {
    let plugin;
    if (typeof registerablePlugin === 'object') {
      plugin = registerablePlugin;
    } else {
      plugin = requirePluginFromPath(registerablePlugin);
    }
    if (validatePlugin(plugin)) {
      Plugins.plugins.push(plugin);
    } else {
      console.warn('Plugin is not a valid Serves Up plugin:', registerablePlugin);
    }
  }
}

function resolvePluginPath(pluginPath) {
  if (path.isAbsolute(pluginPath) || pluginPath.includes('./')) {
    return path.join(process.cwd(),pluginPath);
  }
  try {
    return require.resolve(pluginPath);
  } catch(e) {
    console.error(e);
    return null;
  }
}

function requirePluginFromPath(pluginPath) {
  try {
    console.log(pluginPath);
    const resolvedPath = resolvePluginPath(pluginPath);
    const loadedPlugin = require(require.resolve(resolvedPath));
    loadedPlugin.__plugin_name = pluginPath;
    return loadedPlugin;
  }catch(e) {
    console.error(e);
    return null;
  }
}

function validatePlugin(plugin) {
  if (!plugin) {
    return false;
  }
  if (!RECOGNIZED_PLUGIN_METHODS.every(method => !plugin[method]  || typeof plugin[method] === 'function')) {
    return false;
  }
  if (RECOGNIZED_PLUGIN_METHODS.every(method => !plugin[method] )) {
    return false;
  }
  return true;
}

export function makeMiddlewareFailproof(plugin, name) {
  return function(req, res, next) {
    try {
      plugin(req,res,next);
    } catch (e) {
      console.warn(e);
      console.warn('WARNING: A plugin threw an error during execution. The error log is included above for reference.\nPlugin path:',name);
      next();
    }
  };
}

Plugins.prototype.__plugins = [];

const RECOGNIZED_PLUGIN_METHODS = [
  'requestInterceptor',
  'responseInterceptor'
];
