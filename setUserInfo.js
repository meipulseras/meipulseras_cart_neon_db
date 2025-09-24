import express from 'express';
import { config } from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

config();

const router = express.Router();

app.set('views', path.join(__dirname + '/views/'));
app.set('view engine', 'ejs');


export default router;