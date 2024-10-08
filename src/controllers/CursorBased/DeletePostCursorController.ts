import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { transaction } from '../../db';

const schema = z.object({
  id: z.coerce.string().min(1).max(255),
});

export class DeletePostCursorController {
  static async handler(request: FastifyRequest, reply: FastifyReply) {
    const { success, error, data } = schema.safeParse(request.params);

    if (!success) {
      return reply.code(400).send({
        error: error.issues
      });
    }

    const { id } = data;

    try {
      transaction(async (client) => {
        const { rowCount } = await client.query('DELETE FROM posts_cursor WHERE id = $1', [id]);
        if (rowCount) {
          await client.query('UPDATE system_sumary SET total_count = total_count - $1 WHERE entity = $2;', [rowCount, 'posts_cursor']);
        }

        reply.code(204);
      });
    } catch {
      reply.code(500).send({ error: 'error' });
    }
  }
}
