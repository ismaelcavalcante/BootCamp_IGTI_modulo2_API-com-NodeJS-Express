import express from 'express';
import { promises } from 'fs';
import winston from 'winston';
// import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import gradesRouter from './routes/grades.js';
// import swaggerDocument from './doc.js';

const app = express();
const readFile = promises.readFile;
const writeFile = promises.writeFile;

global.fileName = 'grades.json';

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'grades-control-api.log' }),
  ],
  format: combine(
    label({ label: 'grades-control-api' }),
    timestamp(),
    myFormat
  ),
});

app.use(express.json());

app.use(cors());

app.use('/grade', gradesRouter);

// app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(30000, async () => {
  try {
    await readFile(global.fileName, 'utf-8');
    logger.info('API start');
  } catch (err) {
    const initialJson = {
      nextId: 1,
      accounts: [],
    };
    writeFile(global.fileName, JSON.stringify(initialJson));

    logger.error('erro');
  }
});
