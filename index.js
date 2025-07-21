// index.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const app     = express();

app.use(express.json());

/* 1) .well-known 用 ─ Builder が最初に探す場所 */
app.get('/.well-known/ai-plugin.json', (_, res) => {
  res.type('application/json')
     .sendFile(path.join(__dirname, '.well-known', 'ai-plugin.json'));
});
app.get('/.well-known/openapi.yaml', (_, res) => {
  res.type('text/yaml')
     .sendFile(path.join(__dirname, '.well-known', 'openapi.yaml'));
});

/* 2) ルート直下用 ─ 手動テスト用に残しても OK */
app.get('/ai-plugin.json', (_, res) => {
  res.type('application/json')
     .sendFile(path.join(__dirname, 'ai-plugin.json'));
});
app.get('/openapi.yaml', (_, res) => {
  res.type('text/yaml')
     .sendFile(path.join(__dirname, 'openapi.yaml'));
});

/* 3) その他の静的ファイル */
app.use(express.static('.'));
app.use('/files', express.static(path.join(__dirname, 'public/files')));

/* 4) API 本体 */
const upload = multer({ dest: 'public/files' });
let sounds = [];
let seq = 1;

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

/* 5) ヘルスチェック */
app.get('/ping', (_, res) => res.json({ msg: 'pong' }));

app.listen(8080, () => console.log('API on :8080'));
