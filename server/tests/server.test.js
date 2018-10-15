const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("./../server");
const { Todo } = require("./../models/todo");
const { users, todos, populateTodos, populateUsers } = require("./seed/seed");

beforeEach(populateTodos);
beforeEach(populateUsers);

describe("POST /todos", () => {
  it("expect to create a new todo", done => {
    var text = "create a test";
    const token = users[0].tokens[0].token;

    request(app)
      .post("/todos")
      .send({ text })
      .set("x-auth", token)
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
    const token = users[0].tokens[0].token;
    request(app)
      .post("/todos")
      .send({})
      .set("x-auth", token)
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
    const token = users[0].tokens[0].token;
    request(app)
      .get("/todos")
      .set("x-auth", token)
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe("GET /todos/:id", () => {
  it("should get one todo", done => {
    const id = todos[0]._id;
    request(app)
      .get(`/todos/${id}`)
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe("First test todo");
      })
      .end(done);
  });

  it("should not return a todo doc create by other users", done => {
    const id = todos[1]._id;
    request(app)
      .get(`/todos/${id}`)
      .set("x-auth", users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it("should return a 404 for a invalid id", done => {
    const id = 123;
    request(app)
      .get(`/todos/${id}`)
      .set("x-auth", users[0].tokens[0].token)
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
      .set("x-auth", users[0].tokens[0].token)
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
      .set("x-auth", users[0].tokens[0].token)
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
      .set("x-auth", users[0].tokens[0].token)
      .expect(404)
      .expect(res => {
        expect(res.body.errorMessage).toBe("Could not find todo");
      })
      .end(done);
  });

  it("should not remove a todo wrong user", done => {
    const todo = todos[1];
    request(app)
      .delete(`/todos/${todo._id}`)
      .set("x-auth", users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it("expect to delete todo", done => {
    const todo = todos[0];
    request(app)
      .delete(`/todos/${todo._id}`)
      .set("x-auth", users[0].tokens[0].token)
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

describe("PATCH /todos/:id", () => {
  it("should return a 404 for a invalid id", done => {
    const id = 123;
    request(app)
      .patch(`/todos/${id}`)
      .set("x-auth", users[0].tokens[0].token)
      .expect(404)
      .expect(res => {
        expect(res.body.errorMessage).toBe("ID is invalid");
      })
      .end(done);
  });

  it("should return a 404 not found", done => {
    const id = new ObjectID();
    request(app)
      .patch(`/todos/${id}`)
      .set("x-auth", users[0].tokens[0].token)
      .expect(404)
      .expect(res => {
        expect(res.body.errorMessage).toBe("Could not find todo");
      })
      .end(done);
  });

  it("expect to update a todo completed set to true", done => {
    const todo = todos[0];
    const params = {
      text: "This has been updated",
      completed: true
    };

    request(app)
      .patch(`/todos/${todo._id}`)
      .send(params)
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo).toBeDefined();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(todo._id)
          .then(todo => {
            expect(todo.text).toBe(todo.text);
            expect(res.body.todo.completed).toBe(true);
            expect(res.body.todo.completedAt).toBeTruthy();
            done();
          })
          .catch(e => done(e));
      });
  });

  it("expect to update a todo completed set to false", done => {
    const todo = todos[0];
    const params = {
      text: "Completed set to false",
      completed: false
    };

    request(app)
      .patch(`/todos/${todo._id}`)
      .send(params)
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo).toBeDefined();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(todo._id)
          .then(todo => {
            expect(todo.text).toBe(todo.text);
            expect(res.body.todo.completed).toBe(false);
            expect(res.body.todo.completedAt).toBeNull();
            done();
          })
          .catch(e => done(e));
      });
  });
});
