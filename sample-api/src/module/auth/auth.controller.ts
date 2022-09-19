import { Request, Response, NextFunction } from 'express'
import { authService } from './auth.service'
import { Controller, Post } from '@anycloud/express-controller'
import { accountSerializer } from '../account/account.serializer'
import { LoginError } from 'src/error'
import { badRequest } from 'boom'

@Controller('/auth')
export class AuthController {
  @Post()
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body
      const { user, token } = await authService.login({ email, password })
      res.json({ user: accountSerializer.build(user), token })
    } catch (e) {
      if (e instanceof LoginError) {
        next(badRequest(e.message))
      } else {
        next(e)
      }
    }
  }
}
