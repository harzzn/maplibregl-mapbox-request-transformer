import { describe, expect, test } from 'bun:test'
import { isMapboxURL, transformMapboxUrl } from './index'

const TEST_ACCESS_TOKEN = 'pk.test_token'

describe('isMapboxURL', () => {
  test('should return true for mapbox URLs', () => {
    expect(isMapboxURL('mapbox://styles/mapbox/streets-v12')).toBe(true)
  })

  test('should return false for non-mapbox URLs', () => {
    expect(isMapboxURL('https://example.com')).toBe(false)
  })
})

describe('transformMapboxUrl', () => {
  test('should transform style URLs', () => {
    const input = 'mapbox://styles/mapbox/streets-v12'
    const result = transformMapboxUrl(input, 'Style', TEST_ACCESS_TOKEN)
    expect(result?.url).toBe(
      `https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=${TEST_ACCESS_TOKEN}`
    )
  })

  test('should transform sprite URLs', () => {
    const input = 'mapbox://sprites/mapbox/streets-v12'
    const result = transformMapboxUrl(input, 'Sprite', TEST_ACCESS_TOKEN)
    expect(result?.url).toBe(
      `https://api.mapbox.com/styles/v1/mapbox/streets-v12/sprite?access_token=${TEST_ACCESS_TOKEN}`
    )
  })

  test('should transform sprite URLs with @2x suffix', () => {
    const input = 'mapbox://sprites/mapbox/streets-v12@2x'
    const result = transformMapboxUrl(input, 'Sprite', TEST_ACCESS_TOKEN)
    expect(result?.url).toBe(
      `https://api.mapbox.com/styles/v1/mapbox/streets-v12/sprite?access_token=${TEST_ACCESS_TOKEN}`
    )
  })

  test('should transform glyphs URLs', () => {
    const input = 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf'
    const result = transformMapboxUrl(input, 'Glyphs', TEST_ACCESS_TOKEN)
    expect(result?.url).toBe(
      `https://api.mapbox.com/fonts/v1/mapbox/{fontstack}/{range}.pbf?access_token=${TEST_ACCESS_TOKEN}`
    )
  })

  test('should transform v4 source URLs', () => {
    const input = 'mapbox://mapbox.satellite'
    const result = transformMapboxUrl(input, 'Source', TEST_ACCESS_TOKEN)
    expect(result?.url).toBe(
      `https://api.mapbox.com/v4/mapbox.satellite.json?secure&access_token=${TEST_ACCESS_TOKEN}`
    )
  })
})

describe('error handling', () => {
  test('should throw for non-mapbox URLs', () => {
    expect(() =>
      transformMapboxUrl('https://example.com', 'Style', TEST_ACCESS_TOKEN)
    ).toThrow(
      'Invalid URL: URL must start with "mapbox://". URL: https://example.com'
    )
  })

  test('should throw for malformed mapbox URLs', () => {
    expect(() =>
      transformMapboxUrl('mapbox:/malformed', 'Style', TEST_ACCESS_TOKEN)
    ).toThrow(
      'Invalid URL: Unrecognized Mapbox URL format. URL: mapbox:/malformed'
    )
  })

  test('should throw for unrecognized URL pattern', () => {
    expect(() =>
      transformMapboxUrl(
        'mapbox://unknown/pattern/test',
        'Style',
        TEST_ACCESS_TOKEN
      )
    ).toThrow(
      'Invalid URL: Unrecognized Mapbox URL format. URL: mapbox://unknown/pattern/test'
    )
  })

  test('should throw for empty access token', () => {
    expect(() =>
      transformMapboxUrl('mapbox://styles/mapbox/streets-v12', 'Style', '')
    ).toThrow('Access token is required')
  })
})
