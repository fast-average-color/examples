import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-css-only';

const createConfig = (name) => ({
  input: `src/${name}/index.ts`,
  output: [
    {
        file: `dist/${name}.js`,
        format: 'umd',
    },
  ],
  plugins: [
    typescript(),
    nodeResolve(),
    css({
        output: `dist/${name}.css`,
    }),
  ]
});

const configs = [
  'algorithms',
  'background',
  'background_async',
  'box-shadow',
  'canvas',
  'border',
  'text-photo',
].map((name) => createConfig(name));

export default configs;