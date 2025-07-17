// index.js
const express = require('express');
const multer  = require('multer');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('.'));
app.use('/files', express.static(path.join(__dirname, 'public/files')));

const upload = multer({ dest: 'public/files' });
let sounds = [];      // ← メモリ保持。MVP なので永続化しない
let seq = 1;

// GET /sounds
app.get('/sounds', (_, res) => res.json(sounds));

// POST /sounds
app.post('/sounds', upload.single('file'), (req, res) => {
  const entry = {
    id: seq++,
    name: req.file.originalname,
    url: `/files/${req.file.filename}`
  };
  sounds.push(entry);
  res.json(entry);
});

// GET /sounds/:id/play
app.get('/sounds/:id/play', (req, res) => {
  const snd = sounds.find(s => s.id === +req.params.id);
  if (!snd) return res.status(404).json({ msg: 'not found' });
  // ここでは再生というより URL を返すだけで十分
  res.json({ msg: 'ok', url: snd.url });
});

app.get('/ping', (_, res) => res.json({ msg: 'pong' }));
app.listen(8080, () => console.log('API on :8080'));
