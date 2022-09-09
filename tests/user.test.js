const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { setupDatabase, userOneId, userOne } = require("./fixtures/db");
jest.setTimeout(10000);

beforeEach(setupDatabase);

test("Should sign up a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Ram",
      email: "ramsar7002@gmail.com",
      password: "mypass777!",
    })
    .expect(201);

  //Assert that the db was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  //Assertion sabout the response
  expect(response.body).toMatchObject({
    user: {
      name: "Ram",
      email: "ramsar7002@gmail.com",
    },
    token: user.tokens[0].token,
  });

  expect(user.password).not.toBe("mypass777!");
});

// test("Should log in existing user", async () => {
//   const response = await request(app)
//     .post("/users/login")
//     .send({
//       email: userOne.email,
//       password: userOne.password,
//     })
//     .expect(200);
//   const user = await User.findById(response.body.user._id);
//   expect(user.tokens[user.tokens.length - 1].token).toBe(response.body.token);
// });

// test("Should not log in", async () => {
//   await request(app)
//     .post("/users/login")
//     .send({
//       email: "incorrect@example.com",
//       password: "incorrect",
//     })
//     .expect(401);
// });

// test("should get profile per user", async () => {
//   await request(app)
//     .get("/users/me")
//     .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
//     .send()
//     .expect(200);
// });

// test("should not get profile", async () => {
//   await request(app)
//     .get("/users/me")
//     .set("Authorization", "fdsfds")
//     .send()
//     .expect(401);
// });

// test("Should delete account for user", async () => {
//   const response = await request(app)
//     .delete("/users/me")
//     .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
//     .expect(200);

//   const user = await User.findById(userOne._id);
//   expect(user).toBeNull();
// });

// test("Should upload avatar image", async () => {
//   const response = await request(app)
//     .post("/users/me/avatar")
//     .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
//     .attach("avatar", "tests/fixtures/profile-pic.jpg")
//     .expect(200);

//   const user = await User.findById(userOne._id);
//   expect(user.avatar).toEqual(expect.any(Buffer));
// });

// test("Should update valid user fields", async () => {
//   const response = await request(app)
//     .put("/users/me")
//     .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
//     .send({
//       name: "name changed",
//     })
//     .expect(200);

//   const user = await User.findById(userOne._id);
//   expect(user.name).toBe("name changed");
// });

// test("Should not update valid user fields", async () => {
//   const response = await request(app)
//     .put("/users/me")
//     .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
//     .send({
//       location: "changed",
//     })
//     .expect(400);
// });
