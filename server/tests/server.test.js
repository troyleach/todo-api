const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("./../server");
const { Todo } = require("./../models/todo");

const todos = [
  {
    _id: new ObjectID(),
    text: "First test todo"
  },
  {
    _id: new ObjectID(),
    text: "Second test todo"
  }
];

beforeEach(done => {
  Todo.remove({})
    .then(() => {
      Todo.insertMany(todos);
    })
    .then(() => done());
});

describe("POST /todos", () => {
  it("expect to create a new todo", done => {
    var text = "create a test";

    request(app)
      .post("/todos")
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({ text })
          .then(todos => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch(e => done(e));
      });
  });

  it("should not create todo with invalid data", done => {
    request(app)
      .post("/todos")
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch(e => done(e));
      });
  });
});

describe("GET /todos", () => {
  it("should get all todos", done => {
    request(app)
      .get("/todos")
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe("GET /todos/:id", () => {
  it("should get one todo", done => {
    const id = todos[0]._id;
    request(app)
      .get(`/todos/${id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe("First test todo");
      })
      .end(done);
  });

  it("should return a 404 for a invalid id", done => {
    const id = 123;
    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .expect(res => {
        expect(res.body.errorMessage).toBe("ID is invalid");
      })
      .end(done);
  });

  it("should return a 404 not found", done => {
    const id = new ObjectID();
    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .expect(res => {
        expect(res.body.errorMessage).toBe("Could not find todo");
      })
      .end(done);
  });
});

describe("DELETE /todos/:id", () => {
  it("should return a 404 for a invalid id", done => {
    const id = 123;
    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .expect(res => {
        expect(res.body.errorMessage).toBe("ID is invalid");
      })
      .end(done);
  });

  it("should return a 404 not found", done => {
    const id = new ObjectID();
    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .expect(res => {
        expect(res.body.errorMessage).toBe("Could not find todo");
      })
      .end(done);
  });

  it("expect to delete todo", done => {
    const todo = todos[0];
    request(app)
      .delete(`/todos/${todo._id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todo.text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({})
          .then(todos => {
            expect(todos.length).toBe(1);
            done();
          })
          .catch(e => done(e));
      });
  });
});
