import express from 'express';
import { promises } from 'fs';

const router = express.Router();
const readFile = promises.readFile;
const writeFile = promises.writeFile;

router.get('/', async (_, res) => {
  try {
    let data = await readFile(global.fileName, 'utf-8');
    let json = JSON.parse(data);

    delete json.nextId;

    res.send(json);
    logger.info(`GET /grades`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`GET /grades - ${err.message}`);
  }
});

router.get('/:id', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf-8');
    let json = JSON.parse(data);

    const grade = json.grades.find(
      (grade) => grade.id === parseInt(req.params.id, 10)
    );
    if (grade) {
      res.send(grade);
      logger.info(`GET /grade/:id - ${JSON.stringify(grade)}`);
    } else {
      res.end();
      logger.info(`GET /grade/:id`);
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`GET /grade/:id - ${err.message}`);
  }
});

router.get('/sum/:student/:subject', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf-8');
    let json = JSON.parse(data);

    const grade = json.grades
      .filter(
        (grade) =>
          grade.student === req.params.student &&
          grade.subject === req.params.subject
      )
      .reduce((accum, curr) => accum + curr.value, 0);

    if (grade) {
      res.send(
        `A soma das notas do(a) aluno(a) "${req.params.student}" na disciplina "${req.params.subject}" é "${grade}"`
      );
      logger.info(
        `GET /grade/sum/:student/:subject - ${JSON.stringify(grade)}`
      );
    } else {
      res.end();
      logger.info(`GET /grade/sum/:student/:subject`);
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`GET /grade/sum/:student/:subject - ${err.message}`);
  }
});

router.get('/average/:subject/:type', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf-8');
    let json = JSON.parse(data);

    const grade = json.grades.filter(
      (grade) =>
        grade.subject === req.params.subject && grade.type === req.params.type
    );

    let average =
      grade.reduce((accum, curr) => accum + curr.value, 0) / grade.length;
    if (average) {
      res.send(
        `A média das notas da disciplina "${req.params.subject}" do tipo "${req.params.type}" é "${average}"`
      );
      logger.info(
        `GET /grade/average/:subject/:type - ${JSON.stringify(grade)}`
      );
    } else {
      res.end();
      logger.info(`GET /grade/average/:subject/:type`);
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`GET /grade/average/:student/:subject - ${err.message}`);
  }
});

router.get('/bigger/:subject/:type', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf-8');
    let json = JSON.parse(data);

    const grade = json.grades
      .filter(
        (grade) =>
          grade.subject === req.params.subject && grade.type === req.params.type
      )
      .sort((a, b) => {
        return b.value > a.value ? 1 : a.value > b.value ? -1 : 0;
      });

    if (grade) {
      if (grade.length >= 3) {
        res.send(grade.slice(0, 3));
        logger.info(
          `GET /grade/bigger/:subject/:type - ${JSON.stringify(
            grade.slice(0, 3)
          )}`
        );
      } else {
        res.send(grade);
        logger.info(
          `GET /grade/bigger/:subject/:type - ${JSON.stringify(grade)}`
        );
      }
    } else {
      res.end();
      logger.info(`GET /grade/bigger/:subject/:type`);
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`GET /grade/bigger/:student/:subject - ${err.message}`);
  }
});

router.post('/', async (req, res) => {
  try {
    let grade = req.body;
    let data = await readFile(global.fileName, 'utf-8');
    let json = JSON.parse(data);
    let hour = new Date();

    grade = {
      id: json.nextId++,
      ...grade,
      timestamp: new Date(),
    };
    json.grades.push(grade);

    await writeFile(global.fileName, JSON.stringify(json));

    res.send('Grade adicionada com sucesso');
    logger.info(`POST /grade - ${JSON.stringify(grade)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`POST /grade - ${err.message}`);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf-8');
    let json = JSON.parse(data);

    const grades = json.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id, 10)
    );
    json.grades = grades;

    await writeFile(global.fileName, JSON.stringify(json));

    res.send('Grade excluída com sucesso');
    logger.info(`DELETE /grade/:id - ${req.params.id}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`DELETE /grade - ${err.message}`);
  }
});

router.put('/:id', async (req, res) => {
  try {
    let inputs = req.body;
    let data = await readFile(global.fileName, 'utf-8');
    let json = JSON.parse(data);
    let index = json.grades.findIndex(
      (grade) => grade.id === parseInt(req.params.id, 10)
    );

    json.grades[index].student = inputs.student;
    json.grades[index].subject = inputs.subject;
    json.grades[index].type = inputs.type;
    json.grades[index].value = inputs.value;

    await writeFile(global.fileName, JSON.stringify(json));

    res.send('Grade atualizada com sucesso');
    logger.info(`PUT /grade - ${JSON.stringify(inputs)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`PUT /grade - ${err.message}`);
  }
});

export default router;
