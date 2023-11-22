// 型情報として non-nullにする
export const nonNullable = <T>(value: T): value is NonNullable<T> =>
  value != null
