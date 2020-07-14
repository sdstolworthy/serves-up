import Express from "express";
import chalk from "chalk";
import { createRoute } from "./route";
export function runServer(serverDefinition) {
  const app = Express();
  const { port = 3000, routes = {} } = serverDefinition;
  for (let key in routes) {
    app.use(key, createRoute(routes[key]));
  }
  console.info(chalk.green(`🚀 Server is listening on port ${port}`));
  app.listen(port);
}

export function validateServerDefinition(serverDefinition) {
  if (!!serverDefinition) {
    return true;
  }
}
