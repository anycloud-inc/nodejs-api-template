export function extractAllUrls(str: String) {
  const regex = new RegExp(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  )
  const matches = str.match(regex)
  return matches?.map(match => String(match))
}

export function isHexString(value: any): boolean {
  return value.match(/^0x[0-9a-f]+$/i) != null
}
