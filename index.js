// index.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const app     = express();

app.use(express.json());

/* ★ JSON / YAML を必ず 200 で返す固定ルート -------- */
app.get('/ai-plugin.json', (_, res) => {
  res.type('application/json').sendFile(path.join(__dirname, 'ai-plugin.json'));
});
app.get('/openapi.yaml', (_, res) => {
  res.type('text/yaml').sendFile(path.join(__dirname, 'openapi.yaml'));
});
/* --------------------------------------------------- */

/* ここより下で静的配信をまとめて許可 */
app.use(express.static('.'));
app.use('/files', express.static(path.join(__dirname, 'public/files')));

const upload = multer({ dest: 'public/files' });
let sounds = [];
let seq = 1;

/* API 本体 */
app.get('/sounds', (_, res) => res.json(sounds));

app.post('/sounds', upload.single('file'), (req, res) => {
  const entry = {
    id:   seq++,
    name: req.file.originalname,
    url:  `/files/${req.file.filename}`
  };
  sounds.push(entry);
  res.json(entry);
});

app.get('/sounds/:id/play', (req, res) => {
  const snd = sounds.find(s => s.id === +req.params.id);
  if (!snd) return res.status(404).json({ msg: 'not found' });
  res.json({ msg: 'ok', url: snd.url });
});

/* ヘルスチェック */
app.get('/ping', (_, res) => res.json({ msg: 'pong' }));

app.listen(8080, () => console.log('API on :8080'));
