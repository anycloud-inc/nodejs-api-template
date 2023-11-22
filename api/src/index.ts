require('dotenv').config()

2
import express from 'express'
import 'reflect-metadata'
import morgan from 'morgan'
import cors from 'cors'
import { createConnection } from 'typeorm'
import logRequest from './middleware/log-request'
import handleError from './middleware/handle-error'
import camelizeQuery from './middleware/camelize-query'
import logger from './lib/logger'
import router from './router'
import { getPendingMigrations } from './lib/typeorm-helper/get-pending-migrations'
import ormconfig from '../ormconfig'
import setCurrentUser from './middleware/set-current-user'

const app = express()
const port = Number(process.env.PORT) || 3030

app.use((req, res, next) => next(), cors({ maxAge: 84600 }))
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(camelizeQuery)
app.use(logRequest)
app.use(setCurrentUser)
app.use(morgan('dev') as any)
app.use(router)
app.use(handleError)

process.on('unhandledRejection', logger.error)

createConnection(ormconfig)
  .then(async connection => {
    if (process.env.NODE_ENV !== 'production') {
      const pendingMigrations = await getPendingMigrations(connection)
      if (pendingMigrations.length > 0)
        console.log(
          '\x1b[31m%s\x1b[0m',
          'Pending migrations exist. Please run migration.'
        )
    }
    app.listen(port, () => console.log(`Server listening on port ${port}!`))
  })
  .catch(error => logger.error(error))
