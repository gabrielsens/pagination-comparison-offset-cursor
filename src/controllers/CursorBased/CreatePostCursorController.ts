import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { transaction } from '../../db';

const schema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
});

export class CreatePostCursorController {
  static async handler(request: FastifyRequest, reply: FastifyReply) {
    const { success, error, data } = schema.safeParse(request.body);

    if (!success) {
      return reply.code(400).send({
        error: error.issues
      });
    }

    const { title, content } = data;

    try {
      await transaction(async (client) => {
        const { rows: [post] } = await client.query(`
        INSERT INTO posts_cursor(title, content)
        VALUES ($1, $2)
        RETURNING *;
        `, [title, content]);

        await client.query('UPDATE system_sumary SET total_count = total_count + 1 WHERE entity = $1;', ['posts_cursor']);

        reply.code(201).send({
          data,
          post
        });
      });
    } catch {
      reply.code(500).send({ error: 'error' });
    }
  }
}
