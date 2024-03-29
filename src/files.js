import fs from 'fs';
import path from 'path';
import process from 'process';

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
  return typeof inputPath === 'string' && fs.existsSync(inputPath);
}

export function isValidJson(input) {
  try {
    JSON.parse(input);
    return true;
  } catch (e) {
    return false;
  }
}
