import { Request, Response, NextFunction } from 'express'
import { User } from 'src/module/user/user.entity'
import { decodeJwt } from 'src/lib/jwt'
import { AppDataSource } from 'data-source'

export default async (req: Request, _res: Response, next: NextFunction) => {
  const token = _getTokenFromHeader(req)
  if (!token) return next()
  try {
    const { payload } = decodeJwt(token)
    const { id, resource } = payload
    if (resource !== 'User') return next()
    const user = await AppDataSource.getRepository(User).findOneBy({ id })
    if (!user) return next()
    req.currentUser = user
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
