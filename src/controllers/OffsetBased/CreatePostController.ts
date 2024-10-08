import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { query } from '../../db';

const schema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
});

export class CreatePostController {
  static async handler(request: FastifyRequest, reply: FastifyReply) {
    const { success, error, data } = schema.safeParse(request.body);

    if (!success) {
      return reply.code(400).send({
        error: error.issues
      });
    }

    const { title, content } = data;

    try {
      const { rows: [post] } = await query(`
        INSERT INTO posts(title, content)
        VALUES ($1, $2)
        RETURNING *;
        `, [title, content]);

      reply.code(201).send({
        data,
        post
      });
    } catch {
      reply.code(500).send({ error: 'error' });
    }
  }
}
