const files = require("../src/files");
const fs = require("fs");
const path = require("path");
const { expect } = require("chai");

const TEST_FILE_PATH = "./__test_file";
const QUALIFIED_FILE_PATH = path.join(process.cwd(), "/tests", TEST_FILE_PATH);
describe("Files", () => {
  before(() => {
    fs.writeFileSync(QUALIFIED_FILE_PATH, JSON.stringify({ hello: "world" }));
  });
  after(() => {
    fs.unlinkSync(QUALIFIED_FILE_PATH);
  });
  it("getTruePath returns the correct path", () => {
    expect(QUALIFIED_FILE_PATH).equals(
      files.getTruePath(path.join("tests/", TEST_FILE_PATH))
    );
  });
  it("getTruePath gets absolute path", () => {
    expect(QUALIFIED_FILE_PATH).equals(files.getTruePath(QUALIFIED_FILE_PATH));
  });
  it("loadFile should read file and return buffer", () => {
    expect(JSON.parse(files.loadFile(QUALIFIED_FILE_PATH))).to.deep.equal({
      hello: "world",
    });
  });
  it("checkIfFileExists should return true if a file exists", () => {
    expect(files.checkIfFileExists(QUALIFIED_FILE_PATH)).to.equal(true);
  });
  it("checkIfFileExists should return false if it does not exist", () => {
    expect(files.checkIfFileExists("./made-up-file")).to.equal(false);
  });
  it("isValidJson should return true for valid json", () => {
    expect(files.isValidJson('{"hello":"world"}')).to.equal(true);
  });
  it("isValidJson should return false if JSON is invalid", () => {
    expect(files.isValidJson(QUALIFIED_FILE_PATH)).to.equal(false);
  });
});
