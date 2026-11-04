import 'reflect-metadata';
import { container } from 'tsyringe';
import { TOKENS } from './config/tokens';
import { UserRepository } from './modules/auth/user.repository';
import { TaskRepository } from './modules/tasks/task.repository';
import { IAuthService, IPasswordHasher, IUserRepository } from './modules/auth/auth.adaptors';
import { ISocketService, ITaskRepository, ITaskService } from './modules/tasks/task.adaptor';
import { TaskService } from './modules/tasks/task.service';
import { AuthService } from './modules/auth/auth.service';
import { BcryptPasswordHasher } from './modules/auth/password.hasher';
import { SocketService } from './realtime/socket.service';

/** Composition root: bind interface tokens to their implementations. */
container.registerSingleton<IUserRepository>(TOKENS.UserRepository, UserRepository);
container.registerSingleton<ITaskRepository>(TOKENS.TaskRepository, TaskRepository);
container.registerSingleton<IAuthService>(TOKENS.AuthService, AuthService);
container.registerSingleton<ITaskService>(TOKENS.TaskService, TaskService);
container.registerSingleton<IPasswordHasher>(TOKENS.PasswordHasher, BcryptPasswordHasher);
container.registerSingleton<ISocketService>(TOKENS.SocketService, SocketService);

export { container };
