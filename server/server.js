require("./config/config");

const _ = require("lodash");
const express = require("express");
const bodyParser = require("body-parser");
const { mongoose } = require("./db/mongoose");

const { Todo } = require("./models/todo");
const { User } = require("./models/user");

const { ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

app.post("/todos", (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });
  todo.save().then(
    doc => {
      res.send(doc);
    },
    e => {
      res.status(400).send(e);
    }
  );
});

app.get("/todos", (req, res) => {
  Todo.find().then(
    todos => {
      res.send({ todos });
    },
    e => {
      res.status(400).send(e);
    }
  );
});

app.get("/todos/:id", (req, res) => {
  var id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).send({ errorMessage: "ID is invalid" });
  }

  Todo.findById(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).send({ errorMessage: "Could not find todo" });
      }
      res.send({ todo });
    })
    .catch(error => {
      res.status(400).send();
    });
});

app.delete("/todos/:id", (req, res) => {
  var id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).send({ errorMessage: "ID is invalid" });
  }

  Todo.findByIdAndRemove(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).send({ errorMessage: "Could not find todo" });
      }
      res.send({ todo });
    })
    .catch(error => {
      res.status(400).send();
    });
});

app.patch("/todos/:id", (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ["text", "completed"]);

  if (!ObjectId.isValid(id)) {
    return res.status(404).send({ errorMessage: "ID is invalid" });
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then(todo => {
      if (!todo) {
        return res.status(404).send({ errorMessage: "Could not find todo" });
      }
      res.send({ todo });
    })
    .catch(e => {
      res.status(400).send();
    });
});

module.exports = { app };
