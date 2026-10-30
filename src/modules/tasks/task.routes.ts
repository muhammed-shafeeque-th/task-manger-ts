import { Router } from 'express';
import { container } from 'tsyringe';
import { validate } from '../../shared/validate';
import { requireAuth } from '../auth/auth.middleware';
import { TaskController } from './task.controller';
import {
  createTaskSchema,
  listTasksQuerySchema,
  taskIdParamsSchema,
  updateTaskSchema,
} from './task.schemas';

export function createTaskRouter(): Router {
  const controller = container.resolve(TaskController);
  const router = Router();

  router.use(requireAuth); // every task endpoint requires a valid JWT

  router.get('/stats', controller.stats);
  router.get('/', validate(listTasksQuerySchema, 'query'), controller.list);
  router.post('/', validate(createTaskSchema), controller.create);
  router.get('/:id', validate(taskIdParamsSchema, 'params'), controller.get);
  router.patch('/:id', validate(taskIdParamsSchema, 'params'), validate(updateTaskSchema), controller.update);
  router.delete('/:id', validate(taskIdParamsSchema, 'params'), controller.remove);

  return router;
}
