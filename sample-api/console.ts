import { AppDataSource } from './data-source';
import * as repl from 'repl'
import * as glob from 'glob'

console.log('connecting to detabase...')
AppDataSource
  .initialize()
  .then(() => {
    console.log('successfully connected!!')
    const r = repl.start('> ')
    r.setupHistory('.repl_history', (err, repl) => {
      if (err) console.warn(err)
    })
    r.context.getRepository = AppDataSource.getRepository
    const patterns = ['src/**/*.entity.ts', 'src/**/*.service.ts']
    patterns.forEach(pattern => {
      glob(pattern, {}, (err, fileNames) => {
        if (err) {
          console.log(err)
          return
        }
        fileNames.forEach(fileName => {
          const module = require('./' + fileName)
          const keys = Object.keys(module)
          keys.forEach(key => {
            r.context[key] = module[key]
          })
        })
      })
    })
  })
  .catch(error => console.error(error))
