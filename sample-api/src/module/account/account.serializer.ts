import dayjs = require('dayjs')
import { User } from '../user/user.entity'

export const accountSerializer = {
  build(user: User) {
    return {
      id: user.id!,
      createdAt: dayjs(user.createdAt).format(),
    }
  },
}
