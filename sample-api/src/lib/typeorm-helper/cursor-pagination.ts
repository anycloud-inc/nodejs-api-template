import { SelectQueryBuilder } from 'typeorm'

export type Order = 'ASC' | 'DESC'

export interface PaginationParams {
  cursor?: number
  isNext?: boolean
  size?: number
  order?: Order
}

export function addPagination<T>(
  qb: SelectQueryBuilder<T>,
  { cursor, isNext = true, size, order = 'DESC' }: PaginationParams
): SelectQueryBuilder<T> {
  if (!size || isNaN(size)) size = 50
  qb.orderBy(`${qb.alias}.id`, order)
  if (cursor && !isNaN(cursor)) {
    const inequalitySign =
      (order === 'DESC' && isNext) || (order === 'ASC' && !isNext) ? '<' : '>'
    qb.andWhere(`(${qb.alias}.id ${inequalitySign} :id)`, {
      id: cursor,
    })
  }
  return qb.take(size)
}
