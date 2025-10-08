// Optional local dev server
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/read', async (req, res) => {
  const mod = await import('./api/read.js');
  return mod.default(req, res);
});
app.get('/api/tts', async (req, res) => {
  const mod = await import('./api/tts.js');
  return mod.default(req, res);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Local dev: http://localhost:${port}`));
