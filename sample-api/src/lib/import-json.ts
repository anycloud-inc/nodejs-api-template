import { DataSource } from 'typeorm'
import { readFile } from 'fs'

// jsonファイルからDBにデータをインポートする
export const importJson = <J>(db: DataSource, recipe: ImportRecipe<J>) => {
  return new Promise<void>((resolve, reject) => {
    readFile(recipe.filePath, 'utf-8', async (err, data) => {
      if (err) reject(err)
      const repo = db.getRepository(recipe.entity)
      let items: Array<J> = JSON.parse(data)
      if (recipe.preProcessing) items = recipe.preProcessing(items)
      // DBにすでにあるマスターを除外
      const existingKeys = (await repo.find()).map(recipe.keyExtractorFromDB)
      items = items.filter(
        item => !existingKeys.includes(recipe.keyExtractorFromJSON(item))
      )
      const { parentEntity, parentKey, parentFinder } = recipe
      if (parentEntity != null && parentKey != null && parentFinder != null) {
        // 親テーブルのリレーションを追加
        const parents = await db.getRepository(parentEntity).find()
        items = items.map(item => {
          return {
            ...item,
            [parentKey]: parents.find(parentFinder.bind(null, item)),
          }
        })
      }

      await db
        .createQueryBuilder()
        .insert()
        .into(recipe.entity)
        .values(items)
        .execute()
    })
  })
}

export interface ImportRecipe<T> {
  filePath: string
  entity: any
  keyExtractorFromDB: (obj: any) => string
  keyExtractorFromJSON: (obj: T) => string
  preProcessing?: (objectList: T[]) => T[]
  parentEntity?: any
  parentKey?: string
  parentFinder?: (obj: T, parent: any) => boolean
}
