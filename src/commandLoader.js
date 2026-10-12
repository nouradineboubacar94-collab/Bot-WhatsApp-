// src/commandLoader.js
// Charge les metadata JSON depuis commands/metadata et construit un map name->command
const fs = require('fs');
const path = require('path');

function commandLoader() {
  const metaDir = path.join(process.cwd(), 'commands', 'metadata');
  const files = fs.existsSync(metaDir) ? fs.readdirSync(metaDir) : [];
  const commands = {};
  files.forEach(f => {
    if (!f.endsWith('.json')) return;
    try {
      const data = JSON.parse(fs.readFileSync(path.join(metaDir, f), 'utf8'));
      // data can be array or object with keys
      if (Array.isArray(data)) {
        data.forEach(cmd => {
          if (cmd.name) commands[cmd.name.toLowerCase()] = cmd;
        });
      } else if (typeof data === 'object') {
        // assume object map
        Object.keys(data).forEach(k => {
          const cmd = data[k];
          if (cmd.name) commands[cmd.name.toLowerCase()] = cmd;
        });
      }
    } catch (err) {
      console.error('Failed to load metadata', f, err.message);
    }
  });
  // Additionally, try loading JS modules for commands with logic
  const modulesDir = path.join(process.cwd(), 'commands', 'modules');
  if (fs.existsSync(modulesDir)) {
    const modFiles = fs.readdirSync(modulesDir).filter(x => x.endsWith('.js'));
    modFiles.forEach(mf => {
      try {
        const mod = require(path.join(modulesDir, mf));
        if (mod && mod.meta && mod.meta.name) {
          commands[mod.meta.name.toLowerCase()] = Object.assign({}, mod, { meta: mod.meta });
        }
      } catch (err) {
        console.error('Failed to load module', mf, err.message);
      }
    });
  }
  return commands;
}

module.exports = { commandLoader };
