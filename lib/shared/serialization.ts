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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null)
  )
}

function hasToJSON(value: unknown): value is HasToJSON {
  if (!value || typeof value !== 'object' || !('toJSON' in value)) return false

  return typeof (value as { toJSON?: unknown }).toJSON === 'function'
}

function serializeJson(value: unknown): JsonValue | undefined {
  if (value === undefined) return undefined
  if (value === null) return null

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }

  if (typeof value === 'bigint' || typeof value === 'symbol') {
    throw new TypeError('Cannot serialize unsupported value for client payload')
  }

  if (value instanceof Date) return value.toISOString()
  if (hasToJSON(value)) return serializeJson(value.toJSON())

  if (Array.isArray(value)) {
    return value.map((item) => serializeJson(item) ?? null)
  }

  if (isPlainObject(value)) {
    const serializedObject: JsonObject = {}

    for (const [key, nestedValue] of Object.entries(value)) {
      const serializedValue = serializeJson(nestedValue)
      if (serializedValue !== undefined) {
        serializedObject[key] = serializedValue
      }
    }

    return serializedObject
  }

  throw new TypeError('Cannot serialize unsupported value for client payload')
}

export function serializeTypedForClient<T>(value: T): Serialized<T> {
  return serializeJson(value) as Serialized<T>
}
