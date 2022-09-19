const { doesNotMatch } = require('assert')
const typeorm = require('typeorm')
const { createConnection, getConnection } = typeorm

jest.setTimeout(10000)

const db = {
  async create() {
    const connection = await createConnection()
    return connection
  },

  async close() {
    await getConnection().close()
  },

  async clear() {
    const connection = getConnection()
    const entities = connection.entityMetadatas

    for (const entity of entities) {
      const repository = connection.getRepository(entity.name)
      await repository.query(`DELETE FROM ${entity.tableName}`)
    }
  },
}

beforeAll(async () => {
  require('dotenv').config({ path: '.env.test' })
  const connection = await db.create()
  await connection.synchronize()
})

afterAll(async () => {
  await db.close()
})

beforeEach(async () => {
  await db.clear()
})
