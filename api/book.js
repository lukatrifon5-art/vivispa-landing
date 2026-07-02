module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, phone, service, date, message } = req.body || {};

  if (!name || !phone) {
    res.status(400).json({ error: 'Numele și telefonul sunt obligatorii.' });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    res.status(500).json({ error: 'Configurare lipsă pe server.' });
    return;
  }

  const text = [
    '🌿 Cerere nouă de rezervare — ViviSpa',
    '',
    `Nume: ${name}`,
    `Telefon: ${phone}`,
    service ? `Serviciu: ${service}` : null,
    date ? `Data preferată: ${date}` : null,
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
