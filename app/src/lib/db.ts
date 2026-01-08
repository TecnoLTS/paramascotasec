import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg'

type GlobalWithPool = typeof globalThis & { pgPool?: Pool }

const globalWithPool = globalThis as GlobalWithPool

let cachedPool: Pool | undefined

const getPool = () => {
  if (cachedPool) return cachedPool

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL no está configurado')
  }

  const pool =
    globalWithPool.pgPool ??
    new Pool({
      connectionString,
      max: 10,
    })

  if (process.env.NODE_ENV !== 'production') {
    globalWithPool.pgPool = pool
  }

  cachedPool = pool
  return pool
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[],
): Promise<QueryResult<T>> {
  const pool = getPool()
  return pool.query<T>(text, params)
}

export async function withTransaction<T>(handler: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getPool()
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await handler(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
