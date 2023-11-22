// e.g.
// removeExtenstion('hoge/fuga.js')
// => 'hoge/fuga'
export function removeExtenstion(path: string): string {
  return path.replace(/\.[^/.]+$/, '')
}
