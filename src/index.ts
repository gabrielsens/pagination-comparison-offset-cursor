import 'dotenv/config';
import Fastify from 'fastify';

import { CreatePostCursorController } from './controllers/CursorBased/CreatePostCursorController';
import { DeletePostCursorController } from './controllers/CursorBased/DeletePostCursorController';
import { ListPostsCursorController } from './controllers/CursorBased/ListPostsCursorController';
import { CreatePostController } from './controllers/OffsetBased/CreatePostController';
import { DeletePostController } from './controllers/OffsetBased/DeletePostController';
import { ListPostsController } from './controllers/OffsetBased/ListPostsController';

const fastify = Fastify();

fastify.get('/posts', ListPostsController.handler);
fastify.post('/posts', CreatePostController.handler);
fastify.delete('/posts/:id', DeletePostController.handler);

fastify.get('/posts_cursor', ListPostsCursorController.handler);
fastify.post('/posts_cursor', CreatePostCursorController.handler);
fastify.delete('/posts_cursor/:id', DeletePostCursorController.handler);

fastify.listen({ port: 3000 })
  .then(() => console.log('Server is running at http://localhost:3000'))
  .catch(console.log);
