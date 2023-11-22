import { Request, Response, NextFunction } from 'express'
import { Controller, Get, Post } from '@anycloud/express-controller'
import { accountSerializer } from './account.serializer'
import { authService } from '../auth/auth.service'

@Controller('/account')
export class AccountController {
  @Get()
  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    const currentUser = req.currentUser
    if (currentUser == null) {
      res.json({ user: undefined })
      return
    }
    res.json({
      user: accountSerializer.build(currentUser),
    })
  }

  @Post()
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body
      const { user, token } = await authService.signup({ email, password })
      res.json({ user: accountSerializer.build(user), token })
    } catch (e) {
      next(e)
    }
  }
}
