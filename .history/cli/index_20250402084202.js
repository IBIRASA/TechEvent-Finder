// #!/usr/bin/env node
// import { Command } from 'commander';
// import auth from './commands/auth.js';
// import events from './commands/events.js';
// import users from './commands/users.js';
// import db from './commands/db.js';
// import { style, banner } from './utils/styles.js';

// const program = new Command();

// program
//   .name('evloc')
//   .version('1.0.0')
//   .description(style.header('Event Locator CLI Tool'))
//   .configureOutput({
//     outputError: (str, write) => write(style.error(str))
//   });

// // Add commands
// program.addCommand(auth);
// program.addCommand(events);
// program.addCommand(users);
// program.addCommand(db);

// // Show banner if no commands
// if (!process.argv.slice(2).length) {
//   banner();
//   program.outputHelp();
// }

// program.parse(process.argv);

#!/usr/bin/env node
import { Command } from 'commander';
import auth from './commands/auth.js';
import events from './commands/events.js';
// import users from './commands/users.js'; // Comment out for now
import db from './commands/db.js';
import { style, banner } from './utils/styles.js';

const program = new Command();

program
  .name('evloc')
  .version('1.0.0')
  .description(style.header('Event Locator CLI Tool'))
  .configureOutput({
    outputError: (str, write) => write(style.error(str))
  });

// Add commands
program.addCommand(auth);
program.addCommand(events);
// program.addCommand(users); // Comment out for now
program.addCommand(db);

// Show banner if no commands
if (!process.argv.slice(2).length) {
  banner();
  program.outputHelp();
}

program.parse(process.argv);