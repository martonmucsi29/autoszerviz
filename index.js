import 'dotenv/config';
import express from 'express';
import munkarouter from './routes/munkalapRoute.js';

const app = express();
app.use(express.json());

app.use('/munkalapok', munkarouter);

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => console.log(`Szerver fut: http://localhost:${PORT}`));