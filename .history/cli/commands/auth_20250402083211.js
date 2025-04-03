import { Command } from 'commander';
import inquirer from 'inquirer';
import { style, banner } from '../utils/styles.js';
import { handleAction } from '../utils/spinner.js';
import { loginUser, registerUser } from '../utils/auth.js';

const auth = new Command('auth')
  .description(style.header('Authentication operations'))
  .configureHelp({ helpWidth: 80 });

auth.command('login')
  .description('Login with existing credentials')
  .action(async () => {
    banner();
    const { email, password } = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Email:',
        validate: input => /.+@.+\..+/.test(input) || 'Invalid email format'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password:',
        mask: '*'
      }
    ]);

    await handleAction(
      () => loginUser(email, password),
      {
        startText: 'Authenticating...',
        successText: 'Login successful!',
        errorText: 'Login failed'
      }
    );
  });

auth.command('register')
  .description('Register a new user')
  .option('--admin', 'Create admin user')
  .action(async (options) => {
    banner();
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: 'Username:',
        validate: input => input.length >= 3 || 'Minimum 3 characters'
      },
      // Add more registration fields
    ]);

    await handleAction(
      () => registerUser({ ...answers, isAdmin: options.admin }),
      {
        startText: 'Creating account...',
        successText: 'Registration complete!',
        errorText: 'Registration failed'
      }
    );
  });

export default auth;