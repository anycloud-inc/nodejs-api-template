import { notFound } from 'boom'
import * as express from 'express'
import { registerControllers } from '@anycloud/express-controller'
import { parseParameters } from './middleware/parse-parameters'
import { AccountController } from './module/account/account.controller'
import { AuthController } from './module/auth/auth.controller'

const router = express.Router()

router.get('/', (req, res) => res.send('OK'))
router.get('/routes', (req, res, next) => {
  if (process.env.NODE_ENV === 'production') return next(notFound())
  res.send(
    router.stack
      .map(x => `${x.route.stack[0]?.method} ${x.route.path}`)
      .join('</br>')
  )
})

registerControllers({
  router,
  middlewares: [parseParameters()],
  controllers: [AccountController, AuthController],
})

export default router
