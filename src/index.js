import yargs from "yargs";
import { runServer } from "./server_definition";

function initializeApp() {
  try {
    const serverOptions = parseArguments();
    runServer(serverOptions);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

function parseArguments() {
  const {
    routePath,
    method,
    fixture,
    statusCode,
    definition_file,
    port,
  } = yargs
    .command("$0 <definition_file> [options]", "", (yargs) =>
      yargs.positional("definition_file", {
        describe: "schema definition file",
        type: "string",
        demandOption: true,
      })
    )
    .command("$0 route <routePath> [options]", "route", (yargs) =>
      yargs
        .positional("routePath", {
          type: "string",
          demandOption: true,
          description: "The path the server should listen on",
        })
        .option("statusCode", {
          type: "number",
          alias: "c",
          description: "The status code the server should respond with",
        })
        .option("method", {
          type: "array",
          alias: "m",
          description:
            "The methods the server should listen for (e.g. -m get -m post -m delete)",
        })
        .option("fixture", {
          type: "string",
          alias: "f",
          description:
            'A stringified JSON object that will be sent as the response payload, e.g. "{"hello":"world"}"',
        })
        .help("h")
    )
    .option("port", {
      alias: "p",
      description:
        "The port the server will listen on (this overrides the server port defined in the schema)",
      type: "number",
    })
    .help("h").argv;
  return {
    inputFile: definition_file,
    port,
    routePath,
    method,
    fixture,
    statusCode,
  };
}

initializeApp();
