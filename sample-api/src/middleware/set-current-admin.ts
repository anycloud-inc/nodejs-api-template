import { Request, Response, NextFunction } from 'express'
import { decodeJwt } from 'src/lib/jwt'
import { Admin } from 'src/module/admin/admin.entity'
import { AppDataSource } from 'data-source'

export default async (req: Request, _res: Response, next: NextFunction) => {
  const token = _getTokenFromHeader(req)
  if (!token) return next()
  try {
    const { payload } = decodeJwt(token)
    const { id, resource } = payload
    if (resource !== 'Admin') return next()
    const admin = await AppDataSource.getRepository(Admin).findOneBy({ id })
    if (!admin) return next()

    req.currentAdmin = admin
  } catch (e) {
    // unauthorizedエラーを出すのはAuthデコレータに任せる
    console.log(e)
  }
  next()
}

const _getTokenFromHeader = (req: Request): string | undefined => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    return req.headers.authorization.split(' ')[1]
  }
}
