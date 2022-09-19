import { getRepository } from 'typeorm'
import { filterKeys } from './object-utils'

// HTTP経由のDB更新用のデータをサニタイズ
export function sanitizeParams(
  params: object | null,
  entityClass: any
): object {
  if (params == null) return {}

  return filterKeys(
    _formatParams(params, entityClass),
    _getUpdatableColumns(entityClass)
  )
}

function _formatParams(params: object | null, entityClass: any): object {
  if (params == null) return {}

  return Object.entries(params).reduce((acc, [key, val]) => {
    const colType = _getColumnType(key, entityClass) ?? ''
    if (['float', 'int'].includes(colType) && val === '') {
      acc[key] = null
    } else {
      acc[key] = val
    }
    return acc
  }, {} as { [key: string]: any })
}

function _getColumnType(col: string, entityClass: any): string | undefined {
  const repo = getRepository(entityClass)
  return repo.metadata.columns.find(item => item.propertyName === col)
    ?.type as string
}

function _getUpdatableColumns(entityClass: any): string[] {
  const repo = getRepository(entityClass)
  return repo.metadata.nonVirtualColumns
    .map(col => col.propertyName)
    .filter(col => !['id', 'createdAt', 'updatedAt'].includes(col))
}
