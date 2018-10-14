const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("./../server");
const { User } = require("./../models/user");

const users = [
  {
    _id: new ObjectID(),
    email: "emailOne@email.com",
    password: "password"
  },
  {
    _id: new ObjectID(),
    email: "emailTwo@email.com",
    password: "password"
  }
];

beforeEach(done => {
  User.remove({})
    .then(() => {
      User.insertMany(users);
    })
    .then(() => done());
});

describe("POST /users", () => {
  it("expect to create a new user", done => {
    const user_params = {
      email: "test@email.com",
      password: "testPassword"
    };

    request(app)
      .post("/users")
      .send(user_params)
      .expect(200)
      .expect(res => {
        expect(res.body).toBeDefined();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.find({})
          .then(users => {
            expect(users.length).toBe(3);
            expect(users[2].email).toBe(user_params.email);
            done();
          })
          .catch(e => done(e));
      });
  });

  it("expect to get a duplicate key error", done => {
    const user_params = {
      email: "emailOne@email.com",
      password: "testPassword"
    };

    request(app)
      .post("/users")
      .send(user_params)
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.find({})
          .then(users => {
            expect(users.length).toBe(2);
            done();
          })
          .catch(e => done(e));
      });
  });

  xit("should not create todo with invalid data", done => {
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
  xit("should get all todos", done => {
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
  xit("should get one todo", done => {
    const id = todos[0]._id;
    request(app)
      .get(`/todos/${id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe("First test todo");
      })
      .end(done);
  });

  xit("should return a 404 for a invalid id", done => {
    const id = 123;
    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .expect(res => {
        expect(res.body.errorMessage).toBe("ID is invalid");
      })
      .end(done);
  });

  xit("should return a 404 not found", done => {
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
  xit("should return a 404 for a invalid id", done => {
    const id = 123;
    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .expect(res => {
        expect(res.body.errorMessage).toBe("ID is invalid");
      })
      .end(done);
  });

  xit("should return a 404 not found", done => {
    const id = new ObjectID();
    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .expect(res => {
        expect(res.body.errorMessage).toBe("Could not find todo");
      })
      .end(done);
  });

  xit("expect to delete todo", done => {
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

describe("PATCH /todos/:id", () => {
  xit("should return a 404 for a invalid id", done => {
    const id = 123;
    request(app)
      .patch(`/todos/${id}`)
      .expect(404)
      .expect(res => {
        expect(res.body.errorMessage).toBe("ID is invalid");
      })
      .end(done);
  });

  xit("should return a 404 not found", done => {
    const id = new ObjectID();
    request(app)
      .patch(`/todos/${id}`)
      .expect(404)
      .expect(res => {
        expect(res.body.errorMessage).toBe("Could not find todo");
      })
      .end(done);
  });

  xit("expect to update a todo completed set to true", done => {
    const todo = todos[0];
    const params = {
      text: "This has been updated",
      completed: true
    };

    request(app)
      .patch(`/todos/${todo._id}`)
      .send(params)
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

  xit("expect to update a todo completed set to false", done => {
    const todo = todos[1];
    const params = {
      text: "Completed set to false",
      completed: false
    };

    request(app)
      .patch(`/todos/${todo._id}`)
      .send(params)
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
