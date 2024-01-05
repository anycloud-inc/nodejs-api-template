import * as argon2 from 'argon2'
import { User } from '../user/user.entity'
import { LoginError, ValidationError } from '../../error'
import { encodeJwt } from 'src/lib/jwt'
import { validateOrFail } from 'src/lib/validate'
import { AppDataSource } from 'data-source'

interface SignupParams {
  email: string
  password: string
}

interface LoginParmas {
  email: string
  password: string
}

export const authService = {
  async signup({
    email,
    password,
  }: SignupParams): Promise<{ user: User; token: string }> {
    const passwordHashed = await this.hashPassword(password)
    const repo = AppDataSource.getRepository(User)

    let user = repo.create({
      email,
      password: passwordHashed,
    })
    await validateOrFail(user)
    user = await repo.save(user)

    return {
      user,
      token: this._generateToken(user),
    }
  },

  async login({
    email,
    password,
  }: LoginParmas): Promise<{ user: User; token: string }> {
    const user = await AppDataSource.getRepository(User).findOneBy({ email })
    if (!user) throw new LoginError()

    const valid = await this.verifyPassword(user.password, password)
    if (!valid) throw new LoginError()

    return {
      user,
      token: this._generateToken(user),
    }
  },

  async verifyPassword(hash: string, plain: string) {
    return await argon2.verify(hash, plain)
  },

  async hashPassword(password: string) {
    if (password.length < 8) throw new ValidationError('Password is too short.')
    return await argon2.hash(password)
  },

  _generateToken(user: User): string {
    if (user.id == null) return ''
    return encodeJwt({ id: user.id, resource: 'User' })
  },
}
