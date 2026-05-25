const { execSync } = require('child_process');
const fs = require('fs');

try {
  const log = execSync('git log --oneline -n 15', { cwd: 'c:/Users/lenovo/Desktop/jappandal' }).toString();
  fs.writeFileSync('c:/Users/lenovo/Desktop/jappandal/git_log.txt', log);
} catch (e) {
  console.error(e);
}
