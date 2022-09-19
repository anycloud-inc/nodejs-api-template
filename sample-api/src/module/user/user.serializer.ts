import dayjs = require('dayjs')
import { User } from './user.entity'

export const userSerializer = {
  build(user: User) {
    return {
      id: user.id!,
      createdAt: dayjs(user.createdAt).format(),
    }
  },
}
