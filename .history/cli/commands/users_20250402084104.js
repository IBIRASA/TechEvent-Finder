import { Command } from 'commander';
import inquirer from 'inquirer';
import Table from 'cli-table3';
import { style } from '../utils/styles.js';
import { handleAction } from '../utils/spinner.js';
import { fetchUsers } from '../utils/api.js';

const users = new Command('users')
  .description(style.header('User management commands'))
  .configureHelp({ helpWidth: 80 });

users.command('list')
  .description('List all users')
  .option('--admins', 'List only admin users')
  .action(async (options) => {
    const users = await handleAction(
      () => fetchUsers(options),
      {
        startText: 'Fetching users...',
        successText: 'Users loaded successfully',
        errorText: 'Failed to fetch users'
      }
    );

    const table = new Table({
      head: [
        style.highlight('ID'),
        style.highlight('Username'),
        style.highlight('Email'),
        style.highlight('Role')
      ],
      colWidths: [8, 20, 30, 15]
    });

    users.forEach(user => {
      table.push([
        user.id,
        style.command(user.username),
        user.email,
        user.isAdmin ? style.success('Admin') : style.muted('User')
      ]);
    });

    console.log(table.toString());
  });

export default users;