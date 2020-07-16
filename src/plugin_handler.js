import path from 'path';
export class Plugins {
  static get plugins() {
    if (!Plugins.prototype.__plugins) {
      return [];
    }
    return Plugins.prototype.__plugins;
  }
  static registerGlobalPlugin(pluginPath)  {
    if (typeof pluginPath !== 'string') {
      return;
    }
    const plugin = requirePluginFromPath(pluginPath);
    if (validatePlugin(plugin)) {
      Plugins.plugins.push(plugin);
    }
  }
}

function requirePluginFromPath(pluginPath) {
  try {
    const resolvedPath = path.join(process.cwd(),pluginPath);
    const loadedPlugin = require(resolvedPath);
    loadedPlugin.__plugin_name = resolvedPath;
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
  if (!RECOGNIZED_PLUGIN_METHODS.every(method => plugin[method] == null || typeof plugin[method] === 'function')) {
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
