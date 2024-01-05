require('dotenv').config({ path: '.env.test' })
const { AppDataSource } = require('./data-source.js');

jest.setTimeout(10000)

const db = {
  async create() {
    const connection = await AppDataSource.initialize()
    return connection
  },

  async close() {
    await AppDataSource.destroy()
  },

  async clear() {
    const entities = AppDataSource.entityMetadatas

    for (const entity of entities) {
      const repository = AppDataSource.getRepository(entity.name)
      await repository.query(`DELETE FROM ${entity.tableName}`)
    }
  },
}

beforeAll(async () => {
  const connection = await db.create()
  await connection.synchronize()
})

afterAll(async () => {
  await db.close()
})

beforeEach(async () => {
  await db.clear()
})
