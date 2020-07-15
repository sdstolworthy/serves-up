import { parseArguments } from './arguments';
import { runServer } from './server';
import process from 'process';

function initializeApp() {
  try {
    const serverOptions = parseArguments();
    runServer(serverOptions);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

initializeApp();
