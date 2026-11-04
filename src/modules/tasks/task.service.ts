import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../config/tokens";
import { SOCKET_EVENTS } from "../../realtime/events";
import { SocketService } from "../../realtime/socket.service";
import { NotFoundError } from "../../shared/errors";
import { toTaskDTO, type TaskDTO } from "./task.mapper";
import type {
  ISocketService,
  ITaskRepository,
  ITaskService,
  ListResult,
  TaskStats,
} from "./task.adaptor";
import type {
  CreateTaskInput,
  ListTasksQuery,
  UpdateTaskInput,
} from "./task.schemas";
import { TaskPriority, TaskStatus } from "./task.model";

const DAY_MS = 24 * 60 * 60 * 1000;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

@injectable()
export class TaskService implements ITaskService {
  constructor(
    @inject(TOKENS.TaskRepository) private readonly taskService: ITaskRepository,
    @inject(TOKENS.SocketService) private readonly socketService: ISocketService,
  ) {}

  async list(userId: string, query: ListTasksQuery): Promise<ListResult> {
    const { page, limit, sortBy, order, ...filter } = query;
    const { items, total } = await this.taskService.findMany(
      { owner: userId, ...filter },
      { page, limit, sortBy, order },
    );
    return { items: items.map(toTaskDTO), total, page, limit };
  }

  async get(userId: string, id: string): Promise<TaskDTO> {
    const task = await this.taskService.findById(id, userId);
    if (!task) throw new NotFoundError("Task not found");
    return toTaskDTO(task);
  }

  async create(
    userId: string,
    input: CreateTaskInput,
    originSocketId?: string,
  ): Promise<TaskDTO> {
    const task = await this.taskService.create({
      owner: userId,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate ?? null,
      completedAt: input.status === "done" ? new Date() : null,
    });
    const dto = toTaskDTO(task);
    this.socketService.emitToUser(
      userId,
      SOCKET_EVENTS.TASK_CREATED,
      dto,
      originSocketId,
    );
    return dto;
  }

  async update(
    userId: string,
    id: string,
    input: UpdateTaskInput,
    originSocketId?: string,
  ): Promise<TaskDTO> {
    const existing = await this.taskService.findById(id, userId);
    if (!existing) throw new NotFoundError("Task not found");

    // Keep `completedAt` in sync with status transitions.
    const data: Parameters<ITaskRepository["update"]>[2] = { ...input };
    if (input.status && input.status !== existing.status) {
      data.completedAt = input.status === "done" ? new Date() : null;
    }

    const updated = await this.taskService.update(id, userId, data);
    if (!updated) throw new NotFoundError("Task not found");
    const dto = toTaskDTO(updated);
    this.socketService.emitToUser(
      userId,
      SOCKET_EVENTS.TASK_UPDATED,
      dto,
      originSocketId,
    );
    return dto;
  }

  async remove(
    userId: string,
    id: string,
    originSocketId?: string,
  ): Promise<void> {
    const deleted = await this.taskService.delete(id, userId);
    if (!deleted) throw new NotFoundError("Task not found");
    this.socketService.emitToUser(
      userId,
      SOCKET_EVENTS.TASK_DELETED,
      { id, title: deleted.title },
      originSocketId,
    );
  }

  async getStats(userId: string): Promise<TaskStats> {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) =>
      isoDay(new Date(today.getTime() - (6 - i) * DAY_MS)),
    );
    const since = new Date(`${days[0]}T00:00:00.000Z`);

    const raw = await this.taskService.getStats(userId, since);
    const countByDay = new Map(
      raw.completedByDay.map((d) => [d.date, d.count]),
    );

    const byStatus: Record<TaskStatus, number> = {
      todo: raw.byStatus.todo ?? 0,
      in_progress: raw.byStatus.in_progress ?? 0,
      done: raw.byStatus.done ?? 0,
    };
    const byPriority: Record<TaskPriority, number> = {
      low: raw.byPriority.low ?? 0,
      medium: raw.byPriority.medium ?? 0,
      high: raw.byPriority.high ?? 0,
    };

    return {
      total: raw.total,
      completed: byStatus.done,
      overdue: raw.overdue,
      completionRate:
        raw.total === 0 ? 0 : Math.round((byStatus.done / raw.total) * 100),
      byStatus,
      byPriority,
      completedLast7Days: days.map((date) => ({
        date,
        count: countByDay.get(date) ?? 0,
      })),
    };
  }
}
