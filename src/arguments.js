import yargs from 'yargs';

export function parseArguments() {
  const {
    routePath,
    method,
    fixture,
    statusCode,
    port,
    headers,
    definition_file,
  } = yargs
    .command('$0 <definition_file>', 'Run a schema file', (yargs) =>
      yargs.positional('definition_file', {
        describe: 'schema definition file',
        type: 'string',
        demandOption: true,
      })
    )
    .command('route <routePath>', 'Run a single route', (yargs) =>
      yargs
        .positional('routePath', {
          type: 'string',
          demandOption: true,
          description: 'The path the server should listen on',
        })
        .option('statusCode', {
          type: 'number',
          alias: 'c',
          description: 'The status code the server should respond with',
        })
        .option('method', {
          type: 'array',
          alias: 'm',
          description:
            'The HTTP methods the server should respond to (e.g. -m get -m post -m delete)',
        })
        .option('fixture', {
          type: 'string',
          alias: 'f',
          description:
            'A stringified JSON object that will be sent as the response payload, e.g. "{"hello":"world"}"',
        })
        .option('headers', {
          type: 'string',
          alias: 'd',
          description: 'Custom headers to be returned in the response',
        })
        .help('h')
    )
    .option('port', {
      global: true,
      alias: 'p',
      description:
        'The port the server will listen on (this overrides the server port defined in the schema)',
      type: 'number',
    })
    .help('h').argv;
  return {
    inputFile: definition_file,
    port,
    headers,
    routePath,
    method,
    fixture,
    statusCode,
  };
}
