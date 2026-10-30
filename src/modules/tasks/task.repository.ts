import { Types, type QueryFilter } from 'mongoose';
import { injectable } from 'tsyringe';
import { TaskModel, type ITask, type TaskPriority, type TaskStatus } from './task.model';

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
  sortBy: 'createdAt' | 'dueDate' | 'title';
  order: 'asc' | 'desc';
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

export type UpdateTaskData = Partial<Omit<CreateTaskData, 'owner'>>;

export interface RawTaskStats {
  total: number;
  overdue: number;
  byStatus: Partial<Record<TaskStatus, number>>;
  byPriority: Partial<Record<TaskPriority, number>>;
  /** Completed tasks per UTC day (`YYYY-MM-DD`) since `since`; days with 0 are omitted. */
  completedByDay: { date: string; count: number }[];
}

export interface ITaskRepository {
  findMany(filter: TaskFilter, options: ListOptions): Promise<{ items: ITask[]; total: number }>;
  findById(id: string, owner: string): Promise<ITask | null>;
  create(data: CreateTaskData): Promise<ITask>;
  update(id: string, owner: string, data: UpdateTaskData): Promise<ITask | null>;
  delete(id: string, owner: string): Promise<ITask | null>;
  getStats(owner: string, since: Date): Promise<RawTaskStats>;
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@injectable()
export class TaskRepository implements ITaskRepository {
  async findMany(filter: TaskFilter, options: ListOptions) {
    const query: QueryFilter<ITask> = { owner: new Types.ObjectId(filter.owner) };
    if (filter.status) query.status = filter.status;
    if (filter.priority) query.priority = filter.priority;
    if (filter.overdue) {
      query.status = { $ne: 'done' };
      query.dueDate = { $lt: new Date() };
    }
    if (filter.search) {
      const regex = new RegExp(escapeRegex(filter.search), 'i');
      query.$or = [{ title: regex }, { description: regex }];
    }

    const sort = { [options.sortBy]: options.order === 'asc' ? 1 : -1, _id: -1 } as const;
    const [items, total] = await Promise.all([
      TaskModel.find(query)
        .sort(sort)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit)
        .lean<ITask[]>(),
      TaskModel.countDocuments(query),
    ]);
    return { items, total };
  }

  async findById(id: string, owner: string) {
    return TaskModel.findOne({ _id: id, owner }).lean<ITask>();
  }

  async create(data: CreateTaskData) {
    const doc = await TaskModel.create(data);
    return doc.toObject() as ITask;
  }

  async update(id: string, owner: string, data: UpdateTaskData) {
    return TaskModel.findOneAndUpdate({ _id: id, owner }, { $set: data }, { new: true, runValidators: true }).lean<ITask>();
  }

  async delete(id: string, owner: string) {
    return TaskModel.findOneAndDelete({ _id: id, owner }).lean<ITask>();
  }

  /** Single round-trip aggregation using $facet. */
  async getStats(owner: string, since: Date): Promise<RawTaskStats> {
    const now = new Date();
    const [result] = await TaskModel.aggregate<{
      total: { n: number }[];
      overdue: { n: number }[];
      byStatus: { _id: TaskStatus; count: number }[];
      byPriority: { _id: TaskPriority; count: number }[];
      completedByDay: { _id: string; count: number }[];
    }>([
      { $match: { owner: new Types.ObjectId(owner) } },
      {
        $facet: {
          total: [{ $count: 'n' }],
          overdue: [{ $match: { status: { $ne: 'done' }, dueDate: { $lt: now } } }, { $count: 'n' }],
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
          completedByDay: [
            { $match: { status: 'done', completedAt: { $gte: since } } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt', timezone: 'UTC' } },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    return {
      total: result?.total[0]?.n ?? 0,
      overdue: result?.overdue[0]?.n ?? 0,
      byStatus: Object.fromEntries((result?.byStatus ?? []).map((s) => [s._id, s.count])),
      byPriority: Object.fromEntries((result?.byPriority ?? []).map((p) => [p._id, p.count])),
      completedByDay: (result?.completedByDay ?? []).map((d) => ({ date: d._id, count: d.count })),
    };
  }
}
