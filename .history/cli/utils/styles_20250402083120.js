import chalk from 'chalk';

export const style = {
  header: chalk.bold.cyan,
  success: chalk.greenBright,
  warning: chalk.yellowBright,
  error: chalk.redBright,
  highlight: chalk.cyanBright,
  muted: chalk.gray,
  command: chalk.blue.bold
};

export const banner = () => {
  console.log(style.header(`
  ███████╗██╗   ██╗███████╗███╗   ██╗████████╗
  ██╔════╝██║   ██║██╔════╝████╗  ██║╚══██╔══╝
  █████╗  ██║   ██║█████╗  ██╔██╗ ██║   ██║   
  ██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║   ██║   
  ███████╗ ╚████╔╝ ███████╗██║ ╚████║   ██║   
  ╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝   ╚═╝   
  `));
};