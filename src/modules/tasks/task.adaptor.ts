import { SocketEvent } from "../../realtime/events";
import { ObjectID } from "../../types/types";
import { TaskDTO } from "./task.mapper";
import { ITask, TaskPriority, TaskStatus } from "./task.model";
import {
  CreateTaskInput,
  ListTasksQuery,
  UpdateTaskInput,
} from "./task.schemas";

export interface TaskFilter {
  owner: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  overdue?: boolean;
}

export interface ListOptions {
  page: number;
  limit: number;
  sortBy: "createdAt" | "dueDate" | "title";
  order: "asc" | "desc";
}

export interface CreateTaskData {
  owner: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  completedAt: Date | null;
}

export type UpdateTaskData = Partial<Omit<CreateTaskData, "owner">>;

export interface RawTaskStats {
  total: number;
  overdue: number;
  byStatus: Partial<Record<TaskStatus, number>>;
  byPriority: Partial<Record<TaskPriority, number>>;
  /** Completed tasks per UTC day (`YYYY-MM-DD`) since `since`; days with 0 are omitted. */
  completedByDay: { date: string; count: number }[];
}

export interface ITaskRepository {
  findMany(
    filter: TaskFilter,
    options: ListOptions,
  ): Promise<{ items: ITask[]; total: number }>;
  findById(id: string, owner: string): Promise<ITask | null>;
  create(data: CreateTaskData): Promise<ITask>;
  update(
    id: string,
    owner: string,
    data: UpdateTaskData,
  ): Promise<ITask | null>;
  delete(id: string, owner: string): Promise<ITask | null>;
  getStats(owner: string, since: Date): Promise<RawTaskStats>;
}

export interface ITaskService {
  list(userId: string, query: ListTasksQuery): Promise<ListResult>;

  get(userId: string, id: string): Promise<TaskDTO>;

  create(
    userId: string,
    input: CreateTaskInput,
    originSocketId?: string,
  ): Promise<TaskDTO>;

  update(
    userId: string,
    id: string,
    input: UpdateTaskInput,
    originSocketId?: string,
  ): Promise<TaskDTO>;

  remove(userId: string, id: string, originSocketId?: string): Promise<void>;

  getStats(userId: string): Promise<TaskStats>;
}
export interface ISocketService {
  init(httpServer: any): void;

  /**
   * Emits to every socket of a user. `exceptSocketId` lets the originating tab skip the echo,
   * since it already has the HTTP response.
   */
  emitToUser<T>(
    userId: string,
    event: SocketEvent,
    payload: T,
    exceptSocketId?: string,
  ): void;

  close(): Promise<void>;
}

export interface TaskStats {
  total: number;
  completed: number;
  overdue: number;
  /** Completed / total, as a 0-100 integer. */
  completionRate: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  /** Last 7 UTC days including today, oldest first, zero-filled. */
  completedLast7Days: { date: string; count: number }[];
}

export interface ListResult {
  items: TaskDTO[];
  total: number;
  page: number;
  limit: number;
}
