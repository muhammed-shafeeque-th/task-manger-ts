import type { Request } from "express";
import { inject, injectable } from "tsyringe";
import { asyncHandler } from "../../shared/async-handler";
import { TaskService } from "./task.service";

/** The client sends its socket id so the server can skip echoing events back to it. */
const originSocket = (req: Request) => req.header("x-socket-id") || undefined;

@injectable()
export class TaskController {
  constructor(@inject(TaskService) private readonly tasks: TaskService) {}

  list = asyncHandler(async (req, res) => {
    const taskList = await this.tasks.list(req.userId!, req.query as never);
    res.json(taskList);
  });

  stats = asyncHandler(async (req, res) => {
    const taskStats = await this.tasks.getStats(req.userId!);
    res.json(taskStats);
  });

  get = asyncHandler(async (req, res) => {
    const task = await this.tasks.get(req.userId!, req.params.id as string);
    res.json(task);
  });

  create = asyncHandler(async (req, res) => {
    const createdTask = await this.tasks.create(
      req.userId!,
      req.body,
      originSocket(req),
    );

    res.status(201).json(createdTask);
  });

  update = asyncHandler(async (req, res) => {
    const updatedTask = await this.tasks.update(
      req.userId!,
      req.params.id as string,
      req.body,
      originSocket(req),
    );
    res.json(updatedTask);
  });

  remove = asyncHandler(async (req, res) => {
    await this.tasks.remove(
      req.userId!,
      req.params.id as string,
      originSocket(req),
    );
    res.status(204).send();
  });
}
