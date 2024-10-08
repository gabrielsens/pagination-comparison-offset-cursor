import { Pool, PoolClient } from 'pg';

let pool: Pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  return pool;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query(query: string, values?: any[]) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const { rows, rowCount } = await client.query(query, values);

    return { rows, rowCount };
  } finally {
    client.release();
  }
}

export async function transaction(callback: (client: PoolClient) => Promise<void>) {
  try {
    await query('BEGIN');

    const pool = getPool();
    const client = await pool.connect();
    callback(client);

    await query('COMMIT');
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
}
