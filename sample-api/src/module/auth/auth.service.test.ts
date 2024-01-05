import { LoginError, ValidationError } from '../../error'
import { User } from '../user/user.entity'
import { authService } from './auth.service'
import { AppDataSource } from 'data-source'

describe('authService', () => {
  describe('signup', () => {
    test('success case', async () => {
      const { user, token } = await authService.signup({
        email: 'hoge@example.com',
        password: 'hogehoge',
      })
      // DBにレコードが作成されていることを確認
      expect(await AppDataSource.getRepository(User).count()).toBe(1)
      // パスワードが暗号化されていることを確認
      expect(user.password).not.toBe('hogehoge')
    })
    test('fail case', async () => {
      const promise = authService.signup({
        email: 'hogehoge',
        password: 'hogehoge',
      })
      await expect(promise).rejects.toBeInstanceOf(ValidationError)
    })
  })

  describe('login', () => {
    test('success case', async () => {
      await authService.signup({
        email: 'hoge@example.com',
        password: 'hogehoge',
      })

      const { user } = await authService.login({
        email: 'hoge@example.com',
        password: 'hogehoge',
      })
      expect(user.email).toBe('hoge@example.com')
    })

    test('fail case', async () => {
      const promise = authService.login({
        email: 'hoge@example.com',
        password: 'fugafuga',
      })
      await expect(promise).rejects.toBeInstanceOf(LoginError)
    })
  })
})
