export const LARGE_TEST_VU_THRESHOLD = 1000

const PROFILE_STAGES = {
  smoke: {
    rampUp: '30s',
    hold: '1m',
    rampDown: '30s',
  },
  capacity: {
    rampUp: '5m',
    hold: '10m',
    rampDown: '2m',
  },
}

function parsePositiveInteger(value, name, fallback) {
  const parsed = Number(value ?? fallback)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`)
  }

  return parsed
}

function parsePositiveNumber(value, name, fallback) {
  const parsed = Number(value ?? fallback)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive number`)
  }

  return parsed
}

export function parseLoadProfile(env = {}) {
  const baseUrl = env.BASE_URL?.replace(/\/$/, '')
  const targetVus = parsePositiveInteger(env.TARGET_VUS, 'TARGET_VUS', 50)
  const thinkTimeSeconds = parsePositiveNumber(
    env.THINK_TIME_SECONDS,
    'THINK_TIME_SECONDS',
    3
  )
  const profileName = env.LOAD_PROFILE ?? 'smoke'
  const stageDurations = PROFILE_STAGES[profileName]

  if (!baseUrl || !/^https?:\/\//.test(baseUrl)) {
    throw new Error('BASE_URL must be an absolute HTTP or HTTPS URL')
  }

  if (!stageDurations) {
    throw new Error('LOAD_PROFILE must be smoke or capacity')
  }

  if (
    targetVus > LARGE_TEST_VU_THRESHOLD &&
    env.LARGE_TEST_APPROVED !== 'true'
  ) {
    throw new Error(
      `Tests above ${LARGE_TEST_VU_THRESHOLD} VUs require LARGE_TEST_APPROVED=true`
    )
  }

  return {
    baseUrl,
    targetVus,
    thinkTimeSeconds,
    productSlug: env.PRODUCT_SLUG || undefined,
    profileName,
    stageDurations,
  }
}

export function createLoadStages({ targetVus, stageDurations }) {
  return [
    { duration: stageDurations.rampUp, target: targetVus },
    { duration: stageDurations.hold, target: targetVus },
    { duration: stageDurations.rampDown, target: 0 },
  ]
}
