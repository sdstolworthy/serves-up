import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";
export default {
  plugins: [nodeResolve(), commonjs(), json(), terser()],
  input: "src/index.js",
  output: {
    file: "dist/servesup.js",
    format: "cjs",
    banner: "#!/usr/bin/env node",
  },
};
