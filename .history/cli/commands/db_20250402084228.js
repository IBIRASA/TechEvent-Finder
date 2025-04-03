import { Command } from 'commander';
import { style } from '../utils/styles.js';
import { handleAction } from '../utils/spinner.js';
import { seedDatabase } from '../utils/db.js';

const db = new Command('db')
  .description(style.header('Database operations'))
  .configureHelp({ helpWidth: 80 });

db.command('seed')
  .description('Seed database with test data')
  .option('-u, --users <number>', 'Number of users to create', 10)
  .option('-e, --events <number>', 'Events per user', 3)
  .action(async (options) => {
    await handleAction(
      () => seedDatabase(options.users, options.events),
      {
        startText: 'Seeding database...',
        successText: 'Database seeded successfully!',
        errorText: 'Database seeding failed'
      }
    );
  });

export default db;