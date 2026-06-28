import http from 'k6/http'
import { check, sleep } from 'k6'

import { createLoadStages, parseLoadProfile } from './load-profile.mjs'

const profile = parseLoadProfile(__ENV)

export const options = {
  scenarios: {
    read_traffic: {
      executor: 'ramping-vus',
      gracefulRampDown: '30s',
      stages: createLoadStages(profile),
    },
  },
  thresholds: {
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
    'http_req_duration{endpoint:health}': ['p(95)<300'],
    'http_req_duration{endpoint:home}': ['p(95)<800'],
    'http_req_duration{endpoint:search}': ['p(95)<1000'],
    'http_req_duration{endpoint:product}': ['p(95)<1000'],
  },
  summaryTrendStats: ['avg', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
}

function chooseEndpoint(randomValue) {
  if (profile.productSlug) {
    if (randomValue < 0.1) return { name: 'health', path: '/api/health' }
    if (randomValue < 0.4) return { name: 'home', path: '/' }
    if (randomValue < 0.7) return { name: 'search', path: '/search?q=shoe' }
    return { name: 'product', path: `/product/${profile.productSlug}` }
  }

  if (randomValue < 0.2) return { name: 'health', path: '/api/health' }
  if (randomValue < 0.6) return { name: 'home', path: '/' }
  return { name: 'search', path: '/search?q=shoe' }
}

export default function runReadTraffic() {
  const endpoint = chooseEndpoint(Math.random())
  const response = http.get(`${profile.baseUrl}${endpoint.path}`, {
    tags: { endpoint: endpoint.name },
  })

  check(response, {
    [`${endpoint.name} returned HTTP 200`]: (result) => result.status === 200,
  })

  sleep(profile.thinkTimeSeconds)
}
