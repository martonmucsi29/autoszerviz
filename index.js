import 'dotenv/config';
import express from 'express';
import munkarouter from './routes/munkalapRoute.js';
import alkatreszrouter from './routes/alkatreszRoute.js';
import ugyfelrouter from './routes/ugyfelRoute.js';

const app = express();
app.use(express.json());

app.use('/munkalapok', munkarouter);
app.use('/alkatreszek', alkatreszrouter);
app.use('/ugyfelek', ugyfelrouter);

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => console.log(`Szerver fut: http://localhost:${PORT}`));