// src/utils/animation.js
const fs = require('fs');
const path = require('path');

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function showPreResponse(client, jid, options = {}) {
  const { assetPath = path.join(process.cwd(), 'assets', 'el-nour.gif'), caption = 'EL-NOUR MD', composingMs = 1800, sendImageBeforeResponse = true } = options;
  try {
    if (client && client.sendPresenceUpdate) {
      try { await client.sendPresenceUpdate('composing', jid); } catch (e) { }
    }
    if (sendImageBeforeResponse && fs.existsSync(assetPath)) {
      const buffer = fs.readFileSync(assetPath);
      try {
        await client.sendMessage(jid, { image: buffer, caption });
      } catch (err) {
        console.error('Failed to send pre-response image:', err?.message ?? err);
      }
    }
    await delay(composingMs);
    if (client && client.sendPresenceUpdate) {
      try { await client.sendPresenceUpdate('available', jid); } catch (e) { }
    }
    return;
  } catch (err) {
    console.error('showPreResponse error', err);
  }
}

module.exports = { showPreResponse, delay };
