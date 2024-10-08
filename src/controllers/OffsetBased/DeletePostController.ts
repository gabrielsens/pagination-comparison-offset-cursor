import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { query } from '../../db';

const schema = z.object({
  id: z.coerce.string().min(1).max(255),
});

export class DeletePostController {
  static async handler(request: FastifyRequest, reply: FastifyReply) {
    const { success, error, data } = schema.safeParse(request.params);

    if (!success) {
      return reply.code(400).send({
        error: error.issues
      });
    }

    const { id } = data;

    try {
      await query('DELETE FROM posts WHERE id = $1', [id]);

      reply.code(204);
    } catch {
      reply.code(500).send({ error: 'error' });
    }
  }
}
