import type { IUserSignUp } from '../../../types'

import { UserSignUpSchema } from '../../auth-validator'

type CreateUserAccountInput = {
  name: string
  email: string
  password: string
}

export type RegisterUserAccountDeps = {
  createUserAccount(user: CreateUserAccountInput): Promise<unknown>
  hashPassword(password: string): Promise<string>
}

type RegisterUserAccountInput = {
  userSignUp: IUserSignUp
  deps: RegisterUserAccountDeps
}

export async function registerUserAccount({
  userSignUp,
  deps,
}: RegisterUserAccountInput) {
  const user = await UserSignUpSchema.parseAsync({
    name: userSignUp.name,
    email: userSignUp.email,
    password: userSignUp.password,
    confirmPassword: userSignUp.confirmPassword,
  })

  await deps.createUserAccount({
    name: user.name,
    email: user.email,
    password: await deps.hashPassword(user.password),
  })
}
