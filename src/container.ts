import 'reflect-metadata';
import { container } from 'tsyringe';
import { TOKENS } from './config/tokens';
import { UserRepository, type IUserRepository } from './modules/auth/user.repository';
import { TaskRepository, type ITaskRepository } from './modules/tasks/task.repository';

/** Composition root: bind interface tokens to their implementations. */
container.registerSingleton<IUserRepository>(TOKENS.UserRepository, UserRepository);
container.registerSingleton<ITaskRepository>(TOKENS.TaskRepository, TaskRepository);

export { container };
