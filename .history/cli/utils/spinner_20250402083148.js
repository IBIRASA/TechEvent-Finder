import ora from 'ora';
import { style } from './styles.js';

export const createSpinner = (text) => {
  return ora({
    text,
    spinner: 'dots2',
    color: 'cyan',
    indent: 2
  }).start();
};

export const handleAction = async (action, { 
  startText, 
  successText, 
  errorText 
}) => {
  const spinner = createSpinner(style.muted(startText));
  try {
    const result = await action();
    spinner.succeed(style.success(successText));
    return result;
  } catch (error) {
    spinner.fail(style.error(errorText));
    console.error(style.muted(error.stack));
    process.exit(1);
  }
};