import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
const pkg = require('./package.json');
export default {
  plugins: [nodeResolve(), commonjs(), json(), terser()],
  external: Object.keys(pkg.dependencies),
  input: 'src/index.js',
  output: {
    file: 'dist/servesup.js',
    format: 'cjs',
    banner: '#!/usr/bin/env node',
  },
};
