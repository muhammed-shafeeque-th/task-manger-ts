import type { ITask, TaskPriority, TaskStatus } from './task.model';

export interface TaskDTO {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const toTaskDTO = (task: ITask): TaskDTO => ({
  id: task._id.toString(),
  title: task.title,
  description: task.description ?? '',
  status: task.status,
  priority: task.priority,
  dueDate: task.dueDate ? task.dueDate.toISOString() : null,
  completedAt: task.completedAt ? task.completedAt.toISOString() : null,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
});
