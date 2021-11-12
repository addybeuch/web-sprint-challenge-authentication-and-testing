const server = require("./server");
const request = require("supertest");
const db = require("../data/dbConfig");
const beanza = { username: "beanza", password: "12345" };
const Jokes = require("./jokes/jokes-data");

test("sanity", () => {
  expect(true).toBe(true);
});

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
beforeEach(async () => {
  await db("users").truncate();
});
afterAll(async () => {
  await db.destroy();
});

describe("user endpoint", () => {
  beforeEach(async () => {
    await request(server).post("/api/auth/register").send(beanza);
  });
  test("able to register", async () => {
    let users;
    users = await db("users");
    expect(users).toHaveLength(1);
  });

  test("login", async () => {
    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "beanza", password: "12345" });
    expect(res.body.message).toMatch(/beanza is back/i);
  });
});

describe("joke endpoint", () => {
  test("jokes restricted before login", async () => {
    const res = await request(server).get("/api/jokes");
    expect(res.body.message).toMatch(/token required/i);
  });
  test("jokes allowed after login", async () => {
    await request(server).post("/api/auth/register").send(beanza);
    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "beanza", password: "12345" });
    const token = res.body.token;
    const jokes = await request(server)
      .get("/api/jokes")
      .set({ Authorization: token });
    expect(jokes.body[0].joke).toEqual(Jokes[0].joke);
  });
});
