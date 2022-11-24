require('dotenv').config()

import express from 'express'
import 'reflect-metadata'
import morgan from 'morgan'
import cors from 'cors'
import { createConnection } from 'typeorm'
import router from './router'
import ormconfig from '../ormconfig'

const app = express()
const port = Number(process.env.PORT) || 3030

app.use((req, res, next) => next(), cors({ maxAge: 84600 }))
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev') as any)
app.use(router)

createConnection(ormconfig)
  .then(async connection => {
    app.listen(port, () => console.log(`Server listening on port ${port}!`))
  })
  .catch(error => console.error(error))
