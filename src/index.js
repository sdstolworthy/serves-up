import yargs from "yargs";
import { getTruePath, checkIfFileExists, loadFile } from "./files";
import { validateServerDefinition, runServer } from "./server_definition";
function initialize() {
  try {
    const { inputFile } = parseArguments();
    const filePath = getTruePath(inputFile);
    if (!checkIfFileExists(filePath)) {
      throw Error("The server definition file does not exist");
    }
    const serverDefintion = parseServerDefinitionFile(loadFile(filePath));
    const isValidDefinition = validateServerDefinition(serverDefintion);
    if (!isValidDefinition) {
      throw Error("The server definition is not valid");
    }
    runServer(serverDefintion);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

function parseServerDefinitionFile(fileStream) {
  try {
    return JSON.parse(fileStream);
  } catch (e) {
    throw Error(
      "Something went wrong while parsing the input file. Is your file a JSON file?"
    );
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

initialize();
