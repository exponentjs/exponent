import { program, Command } from 'commander';
import path from 'path';

import { defaultConfig } from './constants';
import { startServer } from './server';

program.version('0.0.1');

const startCommand = new Command();

startCommand
  .name('start')
  .option('-p, --port', 'port to run the server on', '7001')
  .option('-r, --projectRoot <path>', 'the directory for the server to run', process.cwd())
  .option('-w --watchRoot <path>', 'the directory for the server to watch', process.cwd())
  .action(options => {
    options = {
      ...defaultConfig,
      ...options,
    };

    options.watchRoot = path.resolve(process.cwd(), options.watchRoot);

    startServer(options);
  });

program.addCommand(startCommand);
program.parse(process.argv);
