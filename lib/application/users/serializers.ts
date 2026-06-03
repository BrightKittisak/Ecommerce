import type { UpdatedUserNameDTO } from './dtos'

type UserNameRecord = {
  name: string
}

export function toUpdatedUserNameDTO(user: UserNameRecord): UpdatedUserNameDTO {
  return {
    name: user.name,
  }
}
