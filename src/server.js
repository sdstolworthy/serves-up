import Express from 'express';
import chalk from 'chalk';
import { addRouteToApp } from './route';
import {createDefinition, onLoadFixture, getReferenceFilePath} from './server_definition';
import cors from 'cors';
import morgan from 'morgan';

let app = Express();
let server;

export function runServer(serverOptions) {
  const serverDefinition = createDefinition(
    serverOptions,
    onLoadFixture(getReferenceFilePath(serverOptions.inputFile))
  );
  app.use(morgan('combined'));
  app.use(cors());
  const { port: schemaPort, routes } = serverDefinition;

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
