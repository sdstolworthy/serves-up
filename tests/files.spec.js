import * as files from '../src/files';
import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import process from 'process';

const TEST_FILE_PATH = './__test_file';
const QUALIFIED_FILE_PATH = path.join(process.cwd(), '/tests', TEST_FILE_PATH);
describe('Files', function () {
  before(function () {
    fs.writeFileSync(QUALIFIED_FILE_PATH, JSON.stringify({ hello: 'world' }));
  });
  after(function () {
    fs.unlinkSync(QUALIFIED_FILE_PATH);
  });
  it('getTruePath returns the correct path', function () {
    expect(QUALIFIED_FILE_PATH).equals(
      files.getTruePath(path.join('tests/', TEST_FILE_PATH))
    );
  });
  it('getTruePath gets absolute path', function () {
    expect(QUALIFIED_FILE_PATH).equals(files.getTruePath(QUALIFIED_FILE_PATH));
  });
  it('loadFile should read file and return buffer', function () {
    expect(JSON.parse(files.loadFile(QUALIFIED_FILE_PATH))).to.deep.equal({
      hello: 'world',
    });
  });
  it('checkIfFileExists should return true if a file exists', function () {
    expect(files.checkIfFileExists(QUALIFIED_FILE_PATH)).to.equal(true);
  });
  it('checkIfFileExists should return false if it does not exist', function () {
    expect(files.checkIfFileExists('./made-up-file')).to.equal(false);
  });
  it('isValidJson should return true for valid json', function () {
    expect(files.isValidJson('{"hello":"world"}')).to.equal(true);
  });
  it('isValidJson should return false if JSON is invalid', function () {
    expect(files.isValidJson(QUALIFIED_FILE_PATH)).to.equal(false);
  });
});
