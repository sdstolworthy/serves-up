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
});
