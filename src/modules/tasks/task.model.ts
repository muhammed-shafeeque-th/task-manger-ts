import { Schema, model, type Types } from "mongoose";

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface ITask {
  _id: Types.ObjectId;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  completedAt: Date | null;
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", trim: true, maxlength: 2000 },
    status: { type: String, enum: TASK_STATUSES, default: "todo" },
    priority: { type: String, enum: TASK_PRIORITIES, default: "medium" },
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

taskSchema.index({ owner: 1, createdAt: -1 });
taskSchema.index({ owner: 1, status: 1, dueDate: 1 });

export const TaskModel = model<ITask>("Task", taskSchema);
