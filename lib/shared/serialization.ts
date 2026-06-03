type JsonPrimitive = string | number | boolean | null

type JsonObject = {
  [key: string]: JsonValue
}

type JsonValue = JsonPrimitive | JsonValue[] | JsonObject

type HasToJSON = {
  toJSON(): unknown
}

export type Serialized<T> =
  T extends Date
    ? string
    : T extends HasToJSON
      ? Serialized<ReturnType<T['toJSON']>>
      : T extends JsonPrimitive
        ? T
        : T extends Array<infer Item>
          ? Serialized<Item>[]
          : T extends ReadonlyArray<infer Item>
            ? Serialized<Item>[]
            : T extends object
              ? { [Key in keyof T]: Serialized<T[Key]> }
              : T

const serializeJson = (value: unknown): JsonValue =>
  JSON.parse(JSON.stringify(value)) as JsonValue

export function serializeTypedForClient<T>(value: T): Serialized<T> {
  return serializeJson(value) as Serialized<T>
}
