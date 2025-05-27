const { spawn } = require('child_process');
const path = require('path');
const isWin = process.platform === 'win32';
const cmd = isWin ? 'start-backend.bat' : 'start-backend.sh';
const proc = spawn(
  isWin ? 'cmd' : 'bash',
  [isWin ? '/c' : '', cmd].filter(Boolean),
  {
    stdio: 'inherit',
    cwd: path.resolve(__dirname) // <-- set working directory to project root
  }
);
proc.on('exit', code => process.exit(code));