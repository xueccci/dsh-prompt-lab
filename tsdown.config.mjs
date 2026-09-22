/**
 * tsdown build for dsh-prompt-lab.
 *
 * 1. lib/index.js  — ESM Node host half (deps externalized against profile install)
 * 2. lib/shared.js — pure shared local optimizer (host + tests)
 * 3. lib/typert.js — Host Typert manifest (zod codecs)
 * 4. lib/client.js — browser bundle in harness ModuleLoader closure-factory format
 */

const ID = 'dsh-prompt-lab'

const PLATFORM_MODULES = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-attachment',
  '@deepseek-ai/dsh-client-schema-form',
]

const INJECTED_BUNDLES = [
  '@deepseek-ai/dsh-client-ui-conversation',
]

const CLIENT_EXTERNALS = [
  ...PLATFORM_MODULES,
  '@deepseek-ai/dsh-client-runtime/client',
  ...INJECTED_BUNDLES,
]

export default [
  {
    name: ID,
    entry: ['src/index.js', 'src/shared.js', 'src/typert.js'],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: true,
    external: (id) =>
      id === 'zod' ||
      id.startsWith('@deepseek-ai/') ||
      id === 'react' ||
      id.startsWith('react/') ||
      !id.startsWith('.') &&
        !id.startsWith('/') &&
        !id.startsWith('\0') &&
        id !== ID,
  },
  {
    name: ID + '/client',
    entry: { client: 'src/client/index.js' },
    outDir: 'lib',
    format: ['cjs'],
    platform: 'browser',
    dts: false,
    sourcemap: false,
    clean: false,
    external: CLIENT_EXTERNALS.slice(),
    noExternal: function (id) {
      return CLIENT_EXTERNALS.includes(id) ? undefined : true
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
    },
    outputOptions: {
      entryFileNames: 'client.js',
      banner:
        'window.__ModuleLoader__.load({ id: ' +
        JSON.stringify(ID) +
        ', factory: (require) => {',
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  },
]
