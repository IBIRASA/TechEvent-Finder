import { Command } from 'commander';
import Table from 'cli-table3';
import { style } from '../utils/styles.js';
import { handleAction } from '../utils/spinner.js';
import { fetchEvents, createEvent } from '../utils/api.js';

const events = new Command('events')
  .description(style.header('Event management'))
  .configureHelp({ helpWidth: 80 });

events.command('list')
  .description('List upcoming events')
  .option('-l, --limit <number>', 'Limit results', 10)
  .action(async (options) => {
    const events = await handleAction(
      () => fetchEvents(options.limit),
      {
        startText: 'Fetching events...',
        successText: 'Events loaded',
        errorText: 'Failed to fetch events'
      }
    );

    const table = new Table({
      head: [style.highlight('ID'), style.highlight('Name'), style.highlight('Date')],
      colWidths: [10, 30, 20]
    });

    events.forEach(event => {
      table.push([
        event.id,
        style.command(event.name),
        new Date(event.date).toLocaleString()
      ]);
    });

    console.log(table.toString());
  });

// Add more event commands...

export default events;