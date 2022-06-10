const express = require('express')
const app = express()
const cors = require('cors')
const parser = require("body-parser");


app.use(cors())
app.use(express.static('public'))
app.use(parser.urlencoded({extended: false}))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

const addUser = require("./db.js").createUser;
const listUser = require("./db.js").listUser;

app.route("/api/users")
  .post((req, res) => {
    const username = req.body.username;
    addUser(username, (err, user) => {
      if (err) res.send(err);
      else res.send(user);
    });
  })
  .get((req, res) => {
    listUser((err, users) => {
      if (err) res.send(err);
      else res.json(users);
    });
  });