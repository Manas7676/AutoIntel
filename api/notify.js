// Vercel serverless function: sends a Telegram message. Secrets stay server-side.
const KINDS = ['Critical', 'Maintenance', 'Recovery', 'Prediction'];
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const kind = KINDS.includes(body.kind) ? body.kind : 'Critical';
  const msg = String(body.msg || '').slice(0, 300);
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return res.status(200).json({ mode: 'mock', sent: false });
  const icon = { Critical: '🚨', Maintenance: '🛠', Recovery: '✅', Prediction: '🔮' }[kind];
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: `${icon} AUTO INTEL — ${kind}\n${msg}` })
    });
    return res.status(200).json({ mode: 'telegram', sent: r.ok });
  } catch (e) { return res.status(502).json({ sent: false }); }
};
