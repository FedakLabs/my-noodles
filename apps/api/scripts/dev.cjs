const { execSync, spawn } = require('node:child_process');
const path = require('node:path');

const cwd = path.join(__dirname, '..');

function compile() {
  execSync('tsc -p tsconfig.build.json', { cwd, stdio: 'inherit' });
  execSync('tsc-alias -p tsconfig.build.json', { cwd, stdio: 'inherit' });
}

function startApp() {
  if (startApp.child) {
    startApp.child.kill();
  }

  startApp.child = spawn('node', ['--import=./dist/otel-instrumentation.js', 'dist/index.js'], {
    cwd,
    stdio: 'inherit',
  });
}

compile();
startApp();

const tscBin = require.resolve('typescript/bin/tsc');

const tsc = spawn(process.execPath, [tscBin, '-w', '-p', 'tsconfig.build.json', '--preserveWatchOutput'], {
  cwd,
  stdio: ['ignore', 'pipe', 'inherit'],
});

let rebuildTimer;

tsc.stdout.on('data', (chunk) => {
  process.stdout.write(chunk);

  if (!chunk.toString().includes('Found 0 errors')) {
    return;
  }

  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(() => {
    execSync('tsc-alias -p tsconfig.build.json', { cwd, stdio: 'inherit' });
    startApp();
  }, 200);
});

process.on('SIGINT', () => {
  if (startApp.child) {
    startApp.child.kill();
  }

  tsc.kill();
  process.exit(0);
});
