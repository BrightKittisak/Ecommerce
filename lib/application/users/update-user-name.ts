import type { IUserName } from '../../../types'

import type { UpdatedUserNameDTO } from './dtos'
import { toUpdatedUserNameDTO } from './serializers'

export type UpdatableUserNameRecord = {
  name: string
  save(): Promise<{ name: string }>
}

export type UpdateUserNameDeps = {
  findUserById(userId: string): Promise<UpdatableUserNameRecord | null>
}

type UpdateUserNameInput = {
  userId: string | undefined
  user: IUserName
  deps: UpdateUserNameDeps
}

export async function updateUserNameForAccount({
  userId,
  user,
  deps,
}: UpdateUserNameInput): Promise<UpdatedUserNameDTO> {
  if (!userId) throw new Error('ไม่พบบัญชีผู้ใช้')

  const currentUser = await deps.findUserById(userId)
  if (!currentUser) throw new Error('ไม่พบบัญชีผู้ใช้')

  currentUser.name = user.name
  const updatedUser = await currentUser.save()
  return toUpdatedUserNameDTO(updatedUser)
}
