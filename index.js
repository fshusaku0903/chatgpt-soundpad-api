// index.js
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('.'));          // ai-plugin.json / yaml / logo.png を配信

app.get('/ping', (req, res) => res.json({ msg: 'pong' }));

app.listen(3000, () => console.log('API on :3000'));
