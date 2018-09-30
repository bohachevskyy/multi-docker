const keys = require('./keys');
// express app setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// postgress client setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

pgClient.on('error', () => console.log('Lost PG connection'));

pgClient
  .query('CREATE TABLE IF NOT EXIST values (number INT)')
  .catch(err => console.log(err));

// redis client setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const publisher = redisClient.duplicate();

// express routes handler

app.get('/', (req, res) => {
  res.send('hi');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values');
  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  redisClient.hgetAll('values', (err, values) => {
    res.send(values);
  });
});

app.post('/value', (req, res) => {
  const index = req.body.index;
  if (index > 40) {
    res.status(422).send('Index too hight');
  }

  redisClient.hset('values', index, 'nothing yet');
  redisPublisher.publish('insert', index);
  pgClient.query('INSERTO INTO values(number) VALUES($1)', [index]);
  res.send({ working: true });
});

app.listen(5000, () => {
  console.log('listening');
});
