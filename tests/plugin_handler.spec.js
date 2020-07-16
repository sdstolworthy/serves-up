import fs from 'fs';
import path from 'path';
import chai, { expect } from 'chai';
import process from 'process';
import { Plugins, makeMiddlewareFailproof } from '../src/plugin_handler';
import chaiSpy from 'chai-spies';
import { createDefinition } from '../src/server_definition';
chai.use(chaiSpy);
const PLUGIN_PATH = './__plugin.js';
describe('Plugin Handler:', function() {
  beforeEach(function() {
    Plugins.prototype.__plugins = null;
  });
  afterEach(function() {
    try {
      fs.unlinkSync(PLUGIN_PATH);
    } catch(e){
      console.log(PLUGIN_PATH, 'not unwritten');
    }

    delete require.cache[path.join(process.cwd(), PLUGIN_PATH)];
  });
  it('does not allow plugin paths that are not a string', function() {
    createDefinition({ routePath: '/', plugins: [{}] });
    expect(Plugins.plugins).to.deep.equal([]);
  });
  it('rejects a plugin that has a member that is not a function', function() {
    fs.writeFileSync(PLUGIN_PATH, `
      module.exports={
        requestInterceptor: 'asdf'
      }
    `);
    createDefinition({ routePath: '/', plugins: [PLUGIN_PATH] });
    expect(Plugins.plugins).to.deep.equal([]);
  });
  it('by default, plugins is an empty array', function() {
    expect(Plugins.plugins).to.deep.equal([]);
  });
  it('Plugins.plugins initializes the static __plugins if it is not initialized', function() {
    Plugins.prototype.__plugins = null;
    expect(Plugins.plugins).to.deep.equal([]);
  });
  it('if a plugin is valid, it is added to the array of plugins', function() {
    fs.writeFileSync(PLUGIN_PATH, `
      function requestInterceptor(){}
      module.exports={requestInterceptor};
    `);
    createDefinition({ plugins: [PLUGIN_PATH], routePath: '/' });
    expect(Plugins.plugins.length).to.equal(1);
  });
  it('returns null if a plugin cannot be resolved', function() {
    createDefinition({ plugins:['./ashwhsaslsls'], routePath: '/' });
    expect(Plugins.plugins).to.deep.equal([]);
  });
  it('can resolve an installed node module', function() {
    const resolved = path.join(process.cwd(), PLUGIN_PATH);
    fs.writeFileSync(PLUGIN_PATH, 'module.exports = {requestInterceptor: function requestInterceptor(){}}');
    require.cache['faked-installed-module'] = {
      id: 'faked-installed-module',
      filename: resolved,
      loaded: true,
      exports: {
        requestInterceptor: function() {}
      }
    };
    createDefinition({ plugins: ['mocha'], routePath: '/' });
    expect(Plugins.plugins.length).to.equal(0);
  });
  it('rejects a plugin that is has no recognized methods', function() {
    fs.writeFileSync(PLUGIN_PATH, 'module.exports = {unrecognized: function unrecognized() {}}');
    createDefinition({ plugins:[PLUGIN_PATH], routePath: '/' });
    expect(Plugins.plugins).to.deep.equal([]);
  });
  it('cannot load a module that is not installed', function() {
    createDefinition({ routePath:'/', plugins: ['fake-plugin'] });
    expect(Plugins.plugins).to.deep.equal([]);
  });
  it('will catch a middleware call that throws an error', function() {
    let next = chai.spy(() => {});
    makeMiddlewareFailproof(() => {throw new Error();})({},{},next);
    expect(next).to.have.been.called();
  });

});
