const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("./../server");
const { User } = require("./../models/user");
const { users, populateUsers } = require("./seed/seed");

beforeEach(populateUsers);

describe("POST /users", () => {
  it("expect to create a new user", done => {
    const email = "test@email.com";
    const password = "testPassword";

    request(app)
      .post("/users")
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.body).toBeDefined();
        expect(res.body._id).toBeDefined();
        expect(res.body.email).toBe(email);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findOne({ email })
          .then(user => {
            expect(user.email).toBe(email);
            expect(user.password).not.toBe(email);
            done();
          })
          .catch(e => done(e));
      });
  });

  it("expect validation errors if request invalid", done => {
    const invalid_user_params = {
      email: "test@email.com",
      password: "td"
    };

    request(app)
      .post("/users")
      .send(invalid_user_params)
      .expect(400)
      .expect(res => {
        expect(res.body.name).toBe("ValidationError");
      })
      .end(done);
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
      .end(done);
  });
});

describe("GET /users/me", () => {
  it("expect user if authenticated", done => {
    request(app)
      .get("/users/me")
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it("expect 401 if not authenticated", done => {
    request(app)
      .get("/users/me")
      .set("x-auth", "3434")
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe("POST /users/login", () => {
  it("expect positive result", done => {
    const email = users[0].email;
    const password = users[0].password;

    request(app)
      .post("/users/login")
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers["x-auth"]).toBeDefined();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id)
          .then(user => {
            const should = {
              access: user.tokens[1].access,
              token: user.tokens[1].token
            };
            const expectation = {
              access: "auth",
              token: res.headers["x-auth"]
            };
            expect(should).toEqual(expectation);
            done();
          })
          .catch(e => done(e));
      });
  });

  it("expect negative result", done => {
    const email = users[1].email;
    const password = "wrongPassword";

    request(app)
      .post("/users/login")
      .send({ email, password })
      .expect(400)
      .expect(res => {
        expect(res.headers["x-auth"]).toBeUndefined();
        expect(res.body).toEqual({});
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens).toHaveLength(1);
            done();
          })
          .catch(e => done(e));
      });
  });

  it("expect negative result", done => {
    const email = "emailDoesNotExist@email.com";
    const password = users[1].password;

    request(app)
      .post("/users/login")
      .send({ email, password })
      .expect(400)
      .expect(res => {
        expect(res.headers["x-auth"]).toBeUndefined();
        expect(res.body).toEqual({});
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens).toHaveLength(1);
            done();
          })
          .catch(e => done(e));
      });
  });
});

describe("POST /users/me/logout", () => {
  it("expect positive result", done => {
    const token = users[0].tokens[0].token;

    request(app)
      .delete("/users/me/token")
      .set("x-auth", token)
      .expect(200)
      .expect(res => {
        expect(res.headers["x-auth"]).toBeUndefined();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id)
          .then(user => {
            expect(user.tokens).toHaveLength(0);
            done();
          })
          .catch(e => done(e));
      });
  });
});
