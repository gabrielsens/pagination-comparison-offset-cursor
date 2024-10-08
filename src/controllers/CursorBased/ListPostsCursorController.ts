import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { query } from '../../db';

const schema = z.object({
  cursor: z.coerce.number().min(0),
  perPage: z.coerce.number().min(10).max(50)
});

export class ListPostsCursorController {
  static async handler(request: FastifyRequest, reply: FastifyReply) {
    const { success, error, data } = schema.safeParse(request.query);

    if (!success) {
      return reply.code(400).send({
        error: error.issues
      });
    }

    const { cursor, perPage } = data;
    const [{ rows: [total] }, { rows: posts }] = await Promise.all([
      query('SELECT total_count FROM system_sumary WHERE entity = $1', ['posts_cursor']),
      query('SELECT * FROM posts_cursor WHERE id > $1 LIMIT $2;', [cursor, perPage])
    ]);

    const postsCount = Number(total.total_count);
    const totalPages = Math.ceil(postsCount / perPage);
    const nextCursor = posts.at(-1)?.id;

    reply.send({
      data: {
        cursor,
        perPage,
        total: postsCount,
        totalPages,
        nextCursor
      },
      posts
    });
  }
}
