const express = require("express");

const router = express.Router();
const Task = require("../models/task");
const auth = require("../middleware/auth");

router.post("/tasks", auth, async (req, res, next) => {
  const task = new Task({ ...req.body, owner: req.user._id });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});

///Get /tasks?completed=false
//Get /tasks?limit=10&skip=10 - 11-20
//Get /tasks?sortBy=createdAt_asc
router.get("/tasks", auth, async (req, res, next) => {
  const match = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true" ? true : false;
  }
  const sort = {};
  const sortByArr = req.query.sortBy.split(":");
  if (sortByArr.length === 2) {
    sort[sortByArr[0]] = sortByArr[1] === "desc" ? -1 : 1;
  }

  try {
    // const tasks = await Task.find({ owner: req.user._id });
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: +req.query.limit,
        skip: +req.query.skip,
        sort,
      },
    });
    res.send(req.user.tasks);
  } catch (err) {
    res.status(500).send();
  }
});

router.get("/tasks/:id", auth, async (req, res, next) => {
  try {
    const _id = req.params.id;
    // const task = await Task.findById(_id);
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send("Task not found");
    }
    res.send(task);
  } catch (err) {
    res.status(500).send();
  }
});

router.put("/tasks/:id", auth, async (req, res, next) => {
  const _id = req.params.id;

  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];

  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send("Invalid fields");
  }

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send("Task not found");
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    // const task = await Task.findByIdAndUpdate(_id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    res.send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete("/tasks/:id", auth, async (req, res, next) => {
  try {
    const _id = req.params.id;
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (task.length === 0) {
      return res.status(404).send("task not found");
    }
    task.delete();
    res.send(task);
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
