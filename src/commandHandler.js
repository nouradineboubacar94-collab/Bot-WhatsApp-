// src/commandHandler.js
const { showPreResponse } = require('./utils/animation');
const { askOpenAI, limiter } = require('./utils/ai');

async function handleCommand(client, msg, command, args) {
  const jid = msg.key.remoteJid;
  try {
    await showPreResponse(client, jid, { composingMs: 1200, assetPath: './assets/el-nour.gif', caption: 'EL-NOUR MD' });
  } catch (e) {
    console.error('pre-response failed', e);
  }

  // AI commands
  if (command && command.type === 'ai') {
    if (!limiter.check(jid)) {
      await client.sendMessage(jid, { text: 'Trop de requêtes IA — réessaie dans une minute.' });
      return;
    }
    const prompt = args.join(' ');
    if (!prompt) {
      await client.sendMessage(jid, { text: `Usage: ${command.usage || '.' + command.name + ' <prompt>'}` });
      return;
    }
    try {
      const model = command.model || 'gpt-3.5-turbo';
      const answer = await askOpenAI(model, prompt);
      if (!answer) {
        await client.sendMessage(jid, { text: 'Aucune réponse reçue de l’IA.' });
        return;
      }
      const chunks = chunkString(answer, 3000);
      for (const c of chunks) {
        await client.sendMessage(jid, { text: c });
      }
    } catch (err) {
      console.error('AI command error', err);
      await client.sendMessage(jid, { text: `Erreur IA: ${err.message?.slice(0,200)}` });
    }
    return;
  }

  // If module with execute
  if (command && typeof command.execute === 'function') {
    try {
      await command.execute(client, msg, args);
    } catch (err) {
      console.error('execute command error', err);
      await client.sendMessage(jid, { text: 'Erreur lors de l’exécution de la commande.' });
    }
    return;
  }

  // static response
  if (command && command.responseText) {
    await client.sendMessage(jid, { text: command.responseText });
    return;
  }

  await client.sendMessage(jid, { text: "Commande non trouvée ou pas encore implémentée." });
}

function chunkString(str, size) {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);
  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }
  return chunks;
}

module.exports = { handleCommand };
