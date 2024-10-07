import esbuild from 'esbuild';

function createBuildSettings(options){
    return {
        entryPoints : ['src/index.ts'],
        outfile : 'dist/is-test-utils.js',
        format : 'esm',
        bundle : true,
        ...options
    }
}

const settings = createBuildSettings({ minify : false });

await esbuild.build(settings);
