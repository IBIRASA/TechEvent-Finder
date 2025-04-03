#!/usr/bin/env node
import EventLocatorCLI from './CLI.js';
import chalk from 'chalk';

const cli = new EventLocatorCLI();

process.on('uncaughtException', (err) => {
  console.error(chalk.red('Unhandled error:'), err);
  process.exit(1);
});

cli.start();