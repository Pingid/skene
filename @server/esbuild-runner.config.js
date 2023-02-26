/** @type {import('esbuild').BuildOptions} */
const esbuild = {
  minify: false,
  // sourcemap: true,
  format: 'esm',
}

module.exports = {
  type: 'bundle', // bundle or transform (see description above)
  esbuild,
}
