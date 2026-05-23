import { spawn } from 'child_process';
import path from 'path';

process.env.NODE_ENV = 'development';
process.env.PORT = '5000';

const tsxPath = path.resolve('node_modules', '.bin', 'tsx.cmd');

const child = spawn(tsxPath, ['watch', 'server/_core/index.ts'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

child.on('error', (err) => {
  console.error('Failed to start server:', err);
});

child.on('exit', (code) => {
  console.log('Process exited with code:', code);
});
