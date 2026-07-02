module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { password, action, date } = req.body || {};

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Parolă incorectă.' });
    return;
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: 'Dată invalidă.' });
    return;
  }
  if (action !== 'add' && action !== 'remove') {
    res.status(400).json({ error: 'Acțiune invalidă.' });
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const filePath = 'data/closed-dates.json';

  if (!token || !repo) {
    res.status(500).json({ error: 'Configurare lipsă pe server.' });
    return;
  }

  try {
    const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    });
    if (!getRes.ok) throw new Error('Nu am putut citi fișierul curent din GitHub.');
    const getData = await getRes.json();
    const current = JSON.parse(Buffer.from(getData.content, 'base64').toString('utf-8'));

    let dates = Array.isArray(current.dates) ? current.dates : [];
    if (action === 'add' && !dates.includes(date)) dates.push(date);
    if (action === 'remove') dates = dates.filter((d) => d !== date);
    dates.sort();

    const newContent = Buffer.from(JSON.stringify({ dates }, null, 2) + '\n').toString('base64');

    const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
      body: JSON.stringify({
        message: `Actualizare zile nelucrătoare (${action} ${date})`,
        content: newContent,
        sha: getData.sha,
      }),
    });
    if (!putRes.ok) {
      const err = await putRes.json();
      throw new Error(err.message || 'Eroare la salvare în GitHub.');
    }

    res.status(200).json({ ok: true, dates });
  } catch (err) {
    res.status(502).json({ error: err.message || 'Nu am putut salva modificarea.' });
  }
};
