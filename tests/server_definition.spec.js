import chai from 'chai';
import {
  createDefinition,
  onLoadFixture,
  getReferenceFilePath,
} from '../src/server_definition';
import { close as closeServer } from '../src/server';
import fs from 'fs';
const { expect } = chai;

describe('Server definition factory', function() {
  before(function() {
    fs.writeFileSync(
      './tests/test_schema.json',
      JSON.stringify({
        port: 3000,
        routes: [
          {
            path: '/app',
            statusCode: 401,
            fixture: './test_fixture.json',
            methods: ['get', 'post'],
          },
          {
            path: '/app',
            statusCode: 200,
            fixture: { john: 'doe' },
            methods: ['delete', 'head'],
          },
          {
            path: '*',
            statusCode: 301,
            headers: {
              'X-My-Custom-Header': 'custom header',
            },
          },
        ],
      })
    );
    fs.writeFileSync(
      './tests/test_fixture.json',
      JSON.stringify({
        example: 'response',
      })
    );
  });
  after(function() {
    fs.unlinkSync('./tests/test_schema.json');
    fs.unlinkSync('./tests/test_fixture.json');
  });
  afterEach(function() {
    closeServer();
  });
  it('should generate a schema from file when an inputFile is provided', function() {
    let definition = createDefinition(
      {
        inputFile: './tests/test_schema.json',
      },
      onLoadFixture(getReferenceFilePath('./tests/test_schema.json'))
    );
    expect(definition).to.deep.equal({
      port: 3000,
      plugins: undefined,
      routes: [
        {
          path: '/app',
          statusCode: 401,
          fixture: { example: 'response' },
          methods: ['get', 'post'],
        },
        {
          path: '/app',
          statusCode: 200,
          fixture: { john: 'doe' },
          methods: ['delete', 'head'],
        },
        {
          path: '*',
          statusCode: 301,
          fixture: undefined,
          headers: {
            'X-My-Custom-Header': 'custom header',
          },
        },
      ],
    });
  });
  it('should throw an error if loading a file that does not exist', function() {
    expect(() =>
      createDefinition({ inputFile: './tests/made-up-file__' })
    ).to.throw('The server definition file does not exist');
  });
  it('should create a definition from arguments', function() {
    let definition = createDefinition({
      routePath: '/app/test',
      fixture: { hello: 'world' },
      headers: { 'X-Custom-Header': 'custom header' },
      method: ['get'],
      port: 2000,
      statusCode: 200,
    });
    expect(definition).to.deep.equal({
      port: 2000,
      routes: [
        {
          path: '/app/test',
          methods: ['get'],
          statusCode: 200,
          fixture: { hello: 'world' },
          headers: { 'X-Custom-Header': 'custom header' },
        },
      ],
    });
  });
  it('should correctly parse stringified json fixtures', function() {
    let definition = createDefinition({
      routePath: '/app/test',
      fixture: '{ "hello": "world" }',
    });
    expect(definition).to.deep.equal({
      port: 3000,
      routes: [
        {
          path: '/app/test',
          fixture: { hello: 'world' },
          statusCode: 200,
          methods: undefined,
          headers: undefined,
        },
      ],
    });
  });

  it('should throw an error when fixtures are not valid JSON, undefined, or json file', function() {
    expect(() =>
      createDefinition(
        {
          routePath: '/app/test',
          fixture: 'garbledygook',
        },
        onLoadFixture(getReferenceFilePath())
      )
    ).to.throw('Fixture does not exist at path garbledygook');
  });
  it('should correctly parse stringified json headers', function() {
    let definition = createDefinition({
      routePath: '/app/test',
      headers: '{ "X-Custom-Header": "custom header" }',
    });
    expect(definition).to.deep.equal({
      port: 3000,
      routes: [
        {
          path: '/app/test',
          headers: { 'X-Custom-Header': 'custom header' },
          statusCode: 200,
          methods: undefined,
          fixture: undefined,
        },
      ],
    });
  });
  it('should throw an error when headers are not a map of strings', function() {
    expect(() =>
      createDefinition({
        routePath: '/app/test',
        headers: 'garbledygook',
      })
    ).to.throw('headers must be a stringified JSON object or undefined');
  });
  it('should throw an error if neither routePath or inputFile are specified', function() {
    expect(() => {
      createDefinition({});
    }).to.throw('Either route path or input file must be specified');
  });
 

  it('should throw an error when the input file is not a valid json file', function() {
    fs.writeFileSync('./tests/incorrect_schema.json', 'ashwshahsisis');
    expect(() =>
      createDefinition({ inputFile: './tests/incorrect_schema.json' })
    ).to.throw(
      'Something went wrong while parsing the input file. Is your file a JSON file?'
    );
    fs.unlinkSync('./tests/incorrect_schema.json');
  });
  it('should throw an error when a fixture is not a json serializable object, file, or undefined', function() {
    expect(() =>
      createDefinition(
        {
          routePath: '/app/test',
          fixture: () => {},
        },
        onLoadFixture(getReferenceFilePath())
      )
    ).to.throw('fixture must be a stringified JSON object or undefined');
  });
  it('should accept an absolute path with an absolute path is passed for fixture', function() {
    fs.writeFileSync(
      './tests/sample.json',
      JSON.stringify({ hello: 'goodbye' })
    );
    expect(() =>
      createDefinition(
        {
          routePath: '/app',
          fixture: __dirname + '/sample.json',
        },
        onLoadFixture(getReferenceFilePath())
      )
    ).to.not.throw();
    fs.unlinkSync('./tests/sample.json');
  });
  it('should throw an error when the json file is not parsable', function() {
    fs.writeFileSync('./tests/sample.json', '{invalid:json}');
    expect(() =>
      createDefinition(
        {
          routePath: '/app',
          fixture: __dirname + '/sample.json',
        },
        onLoadFixture(getReferenceFilePath())
      )
    ).to.throw('Fixture could not be parsed to JSON');
    fs.unlinkSync('./tests/sample.json');
  });
  it('defaults to port 3000 when no port is specified', function() {
    fs.writeFileSync('./no-port.json', JSON.stringify({
      routes: []
    }));
    expect(createDefinition({ inputFile: './no-port.json' }, () => {}).port).to.equal(3000);
    fs.unlinkSync('./no-port.json');
  });
  it('defaults to an empty array of routes when no route is defined', function() {
    fs.writeFileSync('./no-routes.json', JSON.stringify({
    }));
    expect(createDefinition({ inputFile: './no-routes.json' }, () => {}).routes).to.deep.equal([]);
    fs.unlinkSync('./no-routes.json');
  });
  it('when a route is defined without a return statusCode, it defaults to `200`', function() {
    fs.writeFileSync('./no-return-status-code.json', JSON.stringify({
      routes: [{ path: '/*' }]
    }));
    expect(createDefinition({ inputFile: './no-return-status-code.json' }, () => {}).routes[0].statusCode).to.equal(200);
    fs.unlinkSync('./no-return-status-code.json');
  });
});
