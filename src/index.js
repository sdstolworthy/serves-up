import yargs from "yargs";
import { getTruePath, checkIfFileExists } from "./files";
import { runServer } from "./server_definition";

function initializeApp() {
  try {
    const { inputFile, port } = parseArguments();
    const filePath = getTruePath(inputFile);
    if (!checkIfFileExists(filePath)) {
      throw Error("The server definition file does not exist");
    }
    runServer(filePath, { port });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

function parseArguments() {
  const options = yargs
    .command("$0 <definition_file> [options]", "", (yargs) =>
      yargs.positional("definition_file", {
        describe: "schema definition file",
        type: "string",
        demandOption: true,
      })
    )
    .option("port", {
      alias: "p",
      description:
        "The port the server will listen on (this overrides the server port defined in the schema)",
      type: "number",
    })
    .help("h").argv;
  return {
    inputFile: options.definition_file,
    port: options.port,
  };
}

initializeApp();
