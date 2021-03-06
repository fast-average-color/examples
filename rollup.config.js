import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-css-only';

const createConfig = name => ({
    input: `src/${name}/index.ts`,
    output: [
        {
            file: `dist/${name}.js`,
            format: 'umd',
        },
]   ,
    plugins: [
        typescript(),
        nodeResolve(),
        css({
            output: `${name}.css`,
        }),
    ]
});

const configs = [
    'algorithms',
    'ambilight',
    'background',
    'background_async',
    'box-shadow',
    'box-shadow-4-sides',
    'canvas',
    'border',
    'text-photo',
    'gradient',
    'gradient_stripes',
    'gallery',
    'define',
].map(name => createConfig(name));

export default configs;
