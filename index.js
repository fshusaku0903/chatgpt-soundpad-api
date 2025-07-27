// index.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const app     = express();

app.use(express.json());

// すべてのリクエストをログに出力
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* 1) .well-known 用 ─ Builder が最初に探す場所 */
app.get('/.well-known/ai-plugin.json', (req, res) => {
  console.log('GET /.well-known/ai-plugin.json');
  const filePath = path.join(__dirname, '.well-known', 'ai-plugin.json');
  console.log('File path:', filePath);
  console.log('__dirname:', __dirname);
  console.log('File exists:', require('fs').existsSync(filePath));
  
  if (!require('fs').existsSync(filePath)) {
    console.log('File not found!');
    return res.status(404).json({ error: 'File not found', path: filePath });
  }
  
  try {
    const content = require('fs').readFileSync(filePath, 'utf8');
    console.log('File content length:', content.length);
    res.type('application/json').send(content);
  } catch (error) {
    console.log('Error reading file:', error);
    res.status(500).json({ error: 'Error reading file', message: error.message });
  }
});
app.get('/.well-known/openapi.yaml', (req, res) => {
  console.log('GET /.well-known/openapi.yaml');
  const filePath = path.join(__dirname, '.well-known', 'openapi.yaml');
  console.log('File path:', filePath);
  console.log('File exists:', require('fs').existsSync(filePath));
  
  if (!require('fs').existsSync(filePath)) {
    console.log('File not found!');
    return res.status(404).json({ error: 'File not found', path: filePath });
  }
  
  try {
    const content = require('fs').readFileSync(filePath, 'utf8');
    console.log('File content length:', content.length);
    res.set('Content-Type', 'application/yaml; charset=utf-8').send(content);
  } catch (error) {
    console.log('Error reading file:', error);
    res.status(500).json({ error: 'Error reading file', message: error.message });
  }
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
