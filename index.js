const express = require('express');
const port = 5000;
const { connectToMongo, getDB } = require('./database');
let db;
var cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

connectToMongo((err) => {
  if(!err){
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
    db = getDB();
  }
});

app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/notes', require('./routes/notes.js'));

module.exports = db;