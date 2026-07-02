const fs = require('fs');
const path = require('path');
const { getFile, putFile } = require('./_github');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, phone, service, date, time, message } = req.body || {};

  const NAME_RE = /^[A-Za-zĂÂÎȘȚăâîșțŞŢşţ]{2,}(\s+[A-Za-zĂÂÎȘȚăâîșțŞŢşţ]{2,})+$/;
  const PHONE_RE = /^\+373[0-9]{8}$/;
  const TIME_RE = /^\d{2}:\d{2}$/;

  if (!name || !NAME_RE.test(String(name).trim())) {
    res.status(400).json({ error: 'Introdu numele și prenumele complet.' });
    return;
  }
  const cleanPhone = String(phone || '').replace(/[\s()-]/g, '');
  if (!PHONE_RE.test(cleanPhone)) {
    res.status(400).json({ error: 'Numărul de telefon nu este valid.' });
    return;
  }
  if (!date) {
    res.status(400).json({ error: 'Alege o dată pentru rezervare.' });
    return;
  }
  if (!time || !TIME_RE.test(String(time))) {
    res.status(400).json({ error: 'Alege o oră pentru rezervare.' });
    return;
  }
  const todayISO = new Date().toISOString().split('T')[0];
  if (String(date) < todayISO) {
    res.status(400).json({ error: 'Data preferată nu poate fi în trecut.' });
    return;
  }
  try {
    const closedPath = path.join(process.cwd(), 'data', 'closed-dates.json');
    const closed = JSON.parse(fs.readFileSync(closedPath, 'utf-8')).dates || [];
    if (closed.includes(String(date))) {
      res.status(400).json({ error: 'Această zi este nelucrătoare. Te rugăm să alegi altă dată.' });
      return;
    }
  } catch (err) {
    // If the file can't be read, don't block a legitimate booking over it
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const ghToken = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  if (!token || !chatId) {
    res.status(500).json({ error: 'Configurare lipsă pe server.' });
    return;
  }

  // Reserve the exact date+time slot, reading live from GitHub (not the bundled
  // snapshot) so two near-simultaneous bookings can't both slip through. If a
  // concurrent booking landed first, the sha check on save fails and we retry.
  if (ghToken && repo) {
    let attempt = 0;
    let reserved = false;
    while (attempt < 3 && !reserved) {
      attempt++;
      try {
        const { content, sha } = await getFile(repo, ghToken, 'data/bookings.json');
        const bookings = Array.isArray(content.bookings) ? content.bookings : [];
        const taken = bookings.some((b) => b.date === date && b.time === time);
        if (taken) {
          res.status(409).json({ error: 'Acest interval orar este deja rezervat. Te rugăm să alegi altă oră.' });
          return;
        }
        bookings.push({ date, time, name, phone, service: service || '', message: message || '' });
        await putFile(repo, ghToken, 'data/bookings.json', { bookings }, sha, `Rezervare nouă: ${date} ${time}`);
        reserved = true;
      } catch (err) {
        if (attempt >= 3) {
          res.status(502).json({ error: 'Nu am putut verifica disponibilitatea. Încearcă din nou.' });
          return;
        }
        await new Promise((r) => setTimeout(r, 150 * attempt));
      }
    }
  }

  const text = [
    '🌿 Cerere nouă de rezervare — ViviSpa',
    '',
    `Nume: ${name}`,
    `Telefon: ${phone}`,
    service ? `Serviciu: ${service}` : null,
    `Data: ${date}`,
    `Ora: ${time}`,
    message ? `Mesaj: ${message}` : null,
  ].filter(Boolean).join('\n');

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    const tgData = await tgRes.json();
    if (!tgData.ok) throw new Error(tgData.description || 'Telegram API error');
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: 'Nu am putut trimite cererea. Încearcă din nou sau sună-ne direct.' });
  }
};
