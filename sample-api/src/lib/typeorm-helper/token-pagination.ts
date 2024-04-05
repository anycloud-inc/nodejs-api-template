import { ObjectLiteral, SelectQueryBuilder } from 'typeorm'
import { Order } from './cursor-pagination'

export interface TokenPaginationParams {
  targetList?: { name: string; cursor?: number }[]
  isNext?: boolean
  size?: number
  order?: Order
}

export async function withTokenPagination<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  params?: TokenPaginationParams | string,
  getResult?: (qb: SelectQueryBuilder<T>) => Promise<T[]>
): Promise<{ result: T[]; nextToken: string }> {
  if (typeof params == 'string') {
    params = decodeToken(params)
  }
  return await _withTokenPagination(qb, params, getResult)
}

export async function withRawTokenPagination<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  params?: TokenPaginationParams | string,
  getResult?: (qb: SelectQueryBuilder<T>) => Promise<T[]>
): Promise<{ result: T[]; nextToken: string }> {
  if (typeof params == 'string') {
    params = decodeToken(params)
  }
  return await _withTokenPagination(qb, params, getResult, true)
}

async function _withTokenPagination<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  params?: TokenPaginationParams,
  getResult?: (qb: SelectQueryBuilder<T>) => Promise<T[]>,
  raw: boolean = false
): Promise<{ result: T[]; nextToken: string }> {
  const {
    targetList = [{ name: 'id' }],
    isNext = true,
    size = 50,
    order = 'DESC',
  } = params ?? {}

  for (const target of targetList) {
    const { name, cursor } = target
    qb.addOrderBy(name, order)
    if (cursor && !isNaN(cursor)) {
      const inequalitySign =
        (order === 'DESC' && isNext) || (order === 'ASC' && !isNext) ? '<' : '>'
      qb.andWhere(`(${name} ${inequalitySign} :cursor)`, {
        cursor,
      })
    }
  }
  raw ? qb.limit(size) : qb.take(size)

  const result =
    getResult != null
      ? await getResult(qb)
      : raw
      ? await qb.getRawMany()
      : await qb.getMany()
  if (result.length === 0)
    return {
      result,
      nextToken: generateToken(params ?? {}),
    }

  const last = result.slice(-1)[0] as any
  return {
    result,
    nextToken: generateToken({
      ...params,
      targetList: targetList?.map(target => {
        return { name: target.name, cursor: last[target.name] }
      }),
    }),
  }
}

function decodeToken(token: string): TokenPaginationParams {
  const json = Buffer.from(token, 'base64').toString()
  const params = JSON.parse(json)
  return params as TokenPaginationParams
}

function generateToken(params: TokenPaginationParams): string {
  const json = JSON.stringify(params)
  return Buffer.from(json).toString('base64')
}
