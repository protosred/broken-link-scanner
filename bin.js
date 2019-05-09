const lastArg = process.argv.slice(0).pop();
const child_process = require('child_process');

function openTerminal() {
  const execPath = process.execPath;
  
  switch(process.platform) {
    case "darwin":
      return child_process.exec(`osascript -e tell application "Terminal" to do script "${execPath} ${__filename} cli"`);
    break;
    case "win32":
      return child_process.exec(`start cmd.exe /K ${execPath} ${__filename} cli`);
    break;
    case "linux":
      return child_process.exec(`gnome-terminal -- ${execPath} ${__filename} cli`);
    break;
  }
  process.stderr.write('operating system not supported\n');
  return process.exit(1);
}

if(lastArg === 'cli') {
  require('./index.js')
} else {
  // launch terminal window
  openTerminal();
}
