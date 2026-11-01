import { Router } from "express";
import {
  create,
  getOne,
  list,
  remove,
  stats,
  update,
} from "../controllers/task.controller.js";
import { authenticate } from "../middleware/authenticate.js";

export const taskRouter = Router();

taskRouter.use(authenticate);
taskRouter.get("/stats", stats);
taskRouter.route("/").post(create).get(list);
taskRouter.route("/:id").get(getOne).patch(update).delete(remove);
