import Express from 'express';
import chalk from 'chalk';
import { addRouteToApp } from './route';
import { createDefinition, onLoadFixture, getReferenceFilePath } from './server_definition';
import cors from 'cors';
import morgan from 'morgan';
import { Plugins, makeMiddlewareFailproof } from './plugin_handler';

let app = Express();
let server;

export function runServer(serverOptions) {
  const serverDefinition = createDefinition(
    serverOptions,
    onLoadFixture(getReferenceFilePath(serverOptions.inputFile))
  );

  const { port: schemaPort, routes } = serverDefinition;

  app.use(cors());
  app.use((req, res, next) => {
    getPluginMethodByMethodName('requestInterceptor').forEach(p => typeof p === 'function' && p(req, res, next));
    next();
  });
  app.use(morgan('combined'));

  for (let route of routes) {
    app = addRouteToApp(app, route);
  }

  console.info(chalk.green(`🚀 Server is listening on port ${schemaPort}`));
  server = app.listen(schemaPort);
  return app;
}

export function close() {
  if (!!server && typeof server.close === 'function') {
    server.close();
  }
}

function getPluginMethodByMethodName(methodName) {
  return Plugins.plugins.filter(p => !!p && !!p[methodName] && typeof p[methodName] === 'function').map(p => makeMiddlewareFailproof(p[methodName], p.__plugin_name));
}