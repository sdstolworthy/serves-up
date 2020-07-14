const fs = require("fs");
const path = require("path");
export function getTruePath(input) {
  if (path.isAbsolute(input)) {
    return input;
  } else {
    return path.resolve(process.cwd(), input);
  }
}

export function loadFile(inputPath) {
  return fs.readFileSync(inputPath);
}

export function checkIfFileExists(inputPath) {
  const fs = require("fs");
  return typeof inputPath === "string" && fs.existsSync(inputPath);
}
