export class Plugins {
  static get plugins() {
    if (!Plugins.prototype.__plugins) {
      Plugins.prototype.__plugins = [];
    }
    return Plugins.prototype.__plugins;
  }
  static registerGlobalPlugin(plugin)  {
    if (validatePlugin(plugin)) {
      Plugins.plugins.push(plugin);
    } else {
      console.warn('Plugin is not a valid Serves Up plugin');
    }
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
