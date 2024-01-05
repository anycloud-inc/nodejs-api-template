import {
  EntityTarget,
  ObjectLiteral,
  InsertQueryBuilder,
  SelectQueryBuilder,
  FindOptionsWhere,
  FindOneOptions,
  FindOptionsRelations
} from 'typeorm'
import { camelize } from 'humps'
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata'
import { loadRelationsManyToMany } from './many-to-many-loader'
import { loadRelationsOneToMany } from './one-to-many-loader'
import { loadRelationsToOne } from './to-one-loader'
import { AppDataSource } from 'data-source'

export interface RelationWithQuery {
  name: string
  qb?: SelectQueryBuilder<any>
  joins?: string[]
  refKey?: string
}
// リレーション別にクエリを発行する
// helper method to resolve https://github.com/typeorm/typeorm/issues/3857
export async function findWithRelations<T extends ObjectLiteral>(
  entityClass: new () => T,
  id: number | string,
  relations: Array<string | RelationWithQuery>
): Promise<T | null> {
  const repo = AppDataSource.getRepository(entityClass)
  const toOneRelations = repo.metadata.manyToOneRelations
    .concat(repo.metadata.oneToOneRelations)
    .map(r => r.propertyName)

  const toManyRelations = repo.metadata.oneToManyRelations
    .concat(repo.metadata.manyToManyRelations)
    .map(r => r.propertyName)

  const names = relations.map(r => (typeof r === 'string' ? r : r.name))

  const toOneRelationsFindOptions: { [key: string]: boolean } = {};
  names.forEach(n => {
    if (toOneRelations.includes(n)) {
      toOneRelationsFindOptions[n] = true;
    }
  });

  // to-one relation を取得
  const item = await AppDataSource.getRepository(entityClass).findOne({
    where: { id: id } as FindOptionsWhere<ObjectLiteral>,
    relations: toOneRelationsFindOptions as FindOptionsRelations<T>,
  })
  if (!item) return null

  // to-many relation を取得
  await loadRelations([item], toManyRelations)

  return item
}

export async function loadRelations(
  entities: any[],
  relations: Array<string | RelationWithQuery>
): Promise<void> {
  if (entities.length === 0) return
  const entityName = entities[0].constructor.name
  const relationsMap = _getRelationsMap(entityName)

  // 'texts.metadata'のようなリレーションを {name: 'texts', joins: ['metadata']} に変換する
  relations = relations.reduce<RelationWithQuery[]>((prev, curr) => {
    if (typeof curr !== 'string') {
      prev.push(curr)
    } else if (!curr.includes('.')) {
      prev.push({ name: curr, joins: [] })
    } else {
      const baseName = curr.split('.')[0]
      const joinName = curr.split('.').slice(1).join('.')
      const target = prev.find(x => x.name === baseName)
      if (target == null) {
        prev.push({ name: baseName, joins: [joinName] })
        return prev
      }
      target.joins = (target.joins ?? []).concat(joinName)
    }
    return prev
  }, [])

  const relationItemsList = await Promise.all(
    relations.map(async relation => {
      const name = typeof relation === 'string' ? relation : relation.name
      const meta = relationsMap[name]
      if (!meta) return

      switch (meta.relationType) {
        case 'one-to-one':
        case 'many-to-one':
          return loadRelationsToOne(
            typeof meta.type === 'string' ? meta.type : meta.type.name,
            entityName,
            relation,
            entities
          )
        case 'one-to-many':
          return loadRelationsOneToMany(
            meta.type,
            entityName,
            relation,
            entities
          )
        case 'many-to-many':
          return loadRelationsManyToMany(meta, relation, entities)

        default:
          break
      }
    })
  )

  relationItemsList.forEach(data => {
    if (!data) return
    entities.forEach(entity => {
      entity[data.name] = data.items[entity.id] ?? data.defaultValue
    })
  })
}

function _getRelationsMap(entityName: string): {
  [k: string]: RelationMetadata
} {
  const repo = AppDataSource.getRepository(entityName)
  return repo.metadata.relations.reduce<{ [key: string]: RelationMetadata }>(
    (acc, r) => {
      acc[r.propertyName] = r
      return acc
    },
    {}
  )
}

// leftJoinRelations(qb, ['text', 'text.metadata']) によって以下のコードを実現できる
// ```
// qb.leftJoinAndSelect('xxx.text', 'text)
//   .leftJoinAndSelect('text.metadata', 'textMetadata')
// ```
export function leftJoinRelations<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  relations: string[]
): SelectQueryBuilder<T> {
  relations.forEach(relation => {
    let baseAlias = qb.alias
    let property = relation
    let alias = relation

    if (relation.includes('.')) {
      baseAlias = camelize(relation.split('.').slice(0, -1).join('_'))
      property = relation.split('.').slice(-1)[0]
      alias = camelize(relation.split('.').join('_'))
    }

    qb = qb.leftJoinAndSelect(`${baseAlias}.${property}`, alias)
  })
  return qb
}

export async function runInBatch<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  callback: (items: T[]) => Promise<void>,
  { perPage = 500 } = {}
) {
  let page = 0

  const total = await qb.getCount()

  while (true) {
    if (page * perPage >= total) return
    const items = await qb
      .skip(perPage * page)
      .take(perPage)
      .getMany()

    page++

    await callback(items)
  }
}

export async function bulkInsertWithMultipleKeys<T extends ObjectLiteral>(
  iqb: InsertQueryBuilder<any>,
  entityClass: EntityTarget<T>,
): Promise<void> {
  const [sql, parameters] = iqb.getQueryAndParameters()
  // typeormでは複合キーでのバルクアップデートができないようなので、SQLを直接実行
  // typeorm内での返り値の組み立て方法に問題があると思われる
  await AppDataSource.getRepository(entityClass).query(sql, parameters)
}

export function getCols<T extends ObjectLiteral>(entityClass: EntityTarget<T>): (keyof T)[] {
  return AppDataSource.getRepository(entityClass).metadata.columns.map(
    col => col.propertyName
  ) as (keyof T)[]
}
