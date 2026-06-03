import bcrypt from 'bcryptjs'

import type { RegisterUserAccountDeps } from '@/lib/application/users/register-user-account'
import type { UpdateUserNameDeps } from '@/lib/application/users/update-user-name'
import User from '@/lib/db/models/user.model'

const PASSWORD_HASH_SALT_ROUNDS = 12

export const userAccountDeps: RegisterUserAccountDeps & UpdateUserNameDeps = {
  createUserAccount(user) {
    return User.create(user)
  },
  hashPassword(password) {
    return bcrypt.hash(password, PASSWORD_HASH_SALT_ROUNDS)
  },
  findUserById(userId) {
    return User.findById(userId)
  },
}
