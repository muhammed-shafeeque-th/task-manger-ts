export const TOKENS = {
  AuthService: Symbol.for("AuthService"),
  TaskService: Symbol.for("TaskService"),
  PasswordHasher: Symbol.for("PasswordHasher"),
  UserRepository: Symbol.for("UserRepository"),
  TaskRepository: Symbol.for("TaskRepository"),
  SocketService: Symbol.for("SocketService"),
} as const;
