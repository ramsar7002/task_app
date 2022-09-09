const request = require("supertest");
const Task = require("../src/models/task");
const app = require("../src/app");
const {
  setupDatabase,
  userOneId,
  userOne,
  taskOne,
  userTwo,
} = require("./fixtures/db");
jest.setTimeout(10000);

beforeEach(setupDatabase);

test("Should create task for a user", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "From my test",
    })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toEqual(false);
});

test("Should return all tasks for user one", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  const tasksLength = response.body;
  expect(tasksLength.length).toBe(2);
});

test("user try to delete task of another user", async () => {
  const response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});
