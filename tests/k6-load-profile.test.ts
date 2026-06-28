import assert from 'node:assert/strict'
import test from 'node:test'

type LoadProfileModule = typeof import('../scripts/perf/k6/load-profile.mjs')

let createLoadStages: LoadProfileModule['createLoadStages']
let parseLoadProfile: LoadProfileModule['parseLoadProfile']

test.before(async () => {
  const loadProfileModule = await import('../scripts/perf/k6/load-profile.mjs')

  createLoadStages = loadProfileModule.createLoadStages
  parseLoadProfile = loadProfileModule.parseLoadProfile
})

test('parses a safe smoke profile with normalized base URL', () => {
  const profile = parseLoadProfile({ BASE_URL: 'https://staging.example.com/' })

  assert.equal(profile.baseUrl, 'https://staging.example.com')
  assert.equal(profile.targetVus, 50)
  assert.equal(profile.thinkTimeSeconds, 3)
  assert.equal(profile.profileName, 'smoke')
  assert.equal(profile.productSlug, undefined)
})

test('requires explicit approval above one thousand virtual users', () => {
  assert.throws(
    () =>
      parseLoadProfile({
        BASE_URL: 'https://staging.example.com',
        TARGET_VUS: '100000',
        LOAD_PROFILE: 'capacity',
      }),
    /LARGE_TEST_APPROVED=true/
  )

  const profile = parseLoadProfile({
    BASE_URL: 'https://staging.example.com',
    TARGET_VUS: '100000',
    LOAD_PROFILE: 'capacity',
    LARGE_TEST_APPROVED: 'true',
    THINK_TIME_SECONDS: '5',
    PRODUCT_SLUG: 'running-shoe',
  })

  assert.equal(profile.targetVus, 100000)
  assert.equal(profile.thinkTimeSeconds, 5)
  assert.equal(profile.productSlug, 'running-shoe')
})

test('rejects unsafe configuration values', () => {
  assert.throws(() => parseLoadProfile({}), /BASE_URL/)
  assert.throws(
    () => parseLoadProfile({ BASE_URL: 'staging.example.com' }),
    /absolute HTTP or HTTPS URL/
  )
  assert.throws(
    () =>
      parseLoadProfile({
        BASE_URL: 'https://staging.example.com',
        TARGET_VUS: '0',
      }),
    /positive integer/
  )
  assert.throws(
    () =>
      parseLoadProfile({
        BASE_URL: 'https://staging.example.com',
        LOAD_PROFILE: 'unknown',
      }),
    /smoke or capacity/
  )
})

test('creates ramp, hold, and ramp-down stages for the full target', () => {
  assert.deepEqual(
    createLoadStages({
      targetVus: 100000,
      stageDurations: {
        rampUp: '5m',
        hold: '10m',
        rampDown: '2m',
      },
    }),
    [
      { duration: '5m', target: 100000 },
      { duration: '10m', target: 100000 },
      { duration: '2m', target: 0 },
    ]
  )
})
