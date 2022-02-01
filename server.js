const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const generator = require('./generator/generator');

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get('/sonnet', (req, res) => {
  const sonnetObj = generator.generateSonnet();
  res.status(200).send(sonnetObj);
});

app.get('/sonnet/:id', (req, res) => {
  const sonnetObj = generator.generateSonnet(req.params.id);
  res.status(200).send(sonnetObj);
});

const port = 8080;
app.listen(port, () => {
  console.log(`Sonnet-bot server is live at http://localhost:${port}`);
});
