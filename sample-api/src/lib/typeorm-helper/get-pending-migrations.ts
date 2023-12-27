// https://github.com/typeorm/typeorm/issues/5425
import { DataSource, MigrationExecutor } from 'typeorm'

export async function getPendingMigrations(dataSource: DataSource) {
  const migrationExecuter = new MigrationExecutor(
    dataSource,
    dataSource.createQueryRunner('master')
  )
  const allMigrations = await migrationExecuter.getAllMigrations()
  const executedMigrations = await migrationExecuter.getExecutedMigrations()
  return allMigrations.filter(
    migration =>
      !executedMigrations.find(
        executedMigration => executedMigration.name === migration.name
      )
  )
}
