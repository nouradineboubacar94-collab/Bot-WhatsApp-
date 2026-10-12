// src/utils/ai.js
const fetch = require('node-fetch');

class RateLimiter {
  constructor(maxRequests = 5, windowMs = 60_000) {
    this.max = maxRequests; this.window = windowMs; this.map = new Map();
  }
  check(jid) {
    const now = Date.now();
    const rec = this.map.get(jid);
    if (!rec) { this.map.set(jid, { count: 1, firstTs: now }); return true; }
    if (now - rec.firstTs > this.window) { this.map.set(jid, { count: 1, firstTs: now }); return true; }
    if (rec.count < this.max) { rec.count += 1; return true; }
    return false;
  }
}

const limiter = new RateLimiter(4, 60_000);

async function askOpenAI(model, prompt) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set in env');
  // simple Chat Completions call
  const url = 'https://api.openai.com/v1/chat/completions';
  const body = { model: model || 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }], max_tokens: 800, temperature: 0.7 };
  const res = await fetch(url, { method: 'POST', headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() ?? null;
}

module.exports = { askOpenAI, limiter };
