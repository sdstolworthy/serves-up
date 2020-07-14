import yargs from "yargs";
import { getTruePath, checkIfFileExists } from "./files";
import { runServer } from "./server_definition";
function initializeApp() {
  try {
    const { inputFile } = parseArguments();
    const filePath = getTruePath(inputFile);
    if (!checkIfFileExists(filePath)) {
      throw Error("The server definition file does not exist");
    }
    runServer(filePath);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

function parseArguments() {
  const options = yargs.option("input", {
    alias: "i",
    describe: "file to parse for the server",
    type: "string",
  }).argv;
  return {
    inputFile: options.input,
  };
}

initializeApp();
