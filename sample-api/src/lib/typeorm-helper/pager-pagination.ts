import { SelectQueryBuilder } from 'typeorm'

export type Order = 'ASC' | 'DESC'

export interface PaginationParams {
  page: number
  size?: number
  order?: Order
}

export async function withPagerPagination<T>(
  qb: SelectQueryBuilder<T>,
  { page, size = 50, order = 'DESC' }: PaginationParams
): Promise<{ result: T[]; maxPage: number }> {
  const skip = (page - 1) * size
  const [result, count] = await qb
    .orderBy(`${qb.alias}.id`, order)
    .skip(skip)
    .take(size)
    .getManyAndCount()

  const maxPage = Math.ceil(count / size)
  return { result, maxPage }
}
