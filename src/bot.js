// src/bot.js
// Scaffolding d'initialisation Baileys + chargement commandes
require('dotenv').config();
const fs = require('fs');
const { default: makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion } = require('@adiwajshing/baileys');
const { commandLoader } = require('./commandLoader');
const { handleCommand } = require('./commandHandler');

const SESSION_FILE = process.env.SESSION_FILE || './sessions/session.json';
const PREFIX = process.env.BOT_PREFIX || '.';

async function start() {
  // auth state
  const { state, saveState } = useSingleFileAuthState(SESSION_FILE);
  const { version } = await fetchLatestBaileysVersion();

  const client = makeWASocket({ auth: state, version });
  client.ev.on('creds.update', saveState);

  // load commands metadata
  const commands = commandLoader();
  console.log(`Loaded ${Object.keys(commands).length} commands`);

  client.ev.on('messages.upsert', async (m) => {
    try {
      const message = m.messages[0];
      if (!message || message.key && message.key.remoteJid === 'status@broadcast') return;
      const jid = message.key.remoteJid;
      const isGroup = jid.endsWith('@g.us');
      const msgType = Object.keys(message.message || {})[0];
      // get text
      let text = '';
      if (msgType === 'conversation') text = message.message.conversation;
      else if (msgType === 'extendedTextMessage') text = message.message.extendedTextMessage.text;
      else return; // ignore other types for command parsing

      if (!text) return;
      if (!text.startsWith(PREFIX)) return;
      const withoutPrefix = text.slice(PREFIX.length).trim();
      const split = withoutPrefix.split(/\s+/);
      const cmdName = split[0].toLowerCase();
      const args = split.slice(1);

      const command = commands[cmdName];
      if (!command) {
        // unknown command - optionally reply
        return;
      }

      // Attach message and user info into a simple msg object
      const msg = message;
      // Execute
      await handleCommand(client, msg, command, args);
    } catch (err) {
      console.error('messages.upsert handler error', err);
    }
  });

  client.ev.on('connection.update', (update) => {
    console.log('Connection update:', update);
  });

  console.log('Bot started');
}

start().catch(err => {
  console.error('Failed to start bot', err);
});
