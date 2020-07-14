import { runServer } from "./server_definition";
import { parseArguments } from "./arguments";
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
