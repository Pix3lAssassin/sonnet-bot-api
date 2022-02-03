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
  try {
    const sonnetObj = generator.generateSonnet();
    res.status(200).send(sonnetObj);
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

app.get('/sonnet/:id', (req, res) => {
  try {
    const sonnetObj = generator.generateSonnet(req.params.id);
    res.status(200).send(sonnetObj);
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Sonnet-bot server is live at http://localhost:${port}`);
});
