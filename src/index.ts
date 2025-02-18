export function isMapboxURL(url: string) {
  return url.indexOf('mapbox:') === 0
}

export function transformMapboxUrl(
  url: string,
  resourceType: string,
  accessToken: string
) {
  // Validate access token
  if (!accessToken) {
    throw new Error('Access token is required')
  }

  // Ensure it's a mapbox URL
  if (!isMapboxURL(url)) {
    throw new Error('Invalid URL: URL must start with "mapbox://"')
  }

  if (url.indexOf('/styles/') > -1 && url.indexOf('/sprite') === -1)
    return { url: normalizeStyleURL(url, accessToken) }
  if (url.indexOf('/sprites/') > -1)
    return { url: normalizeSpriteURL(url, accessToken) }
  if (url.indexOf('/fonts/') > -1)
    return { url: normalizeGlyphsURL(url, accessToken) }
  if (url.indexOf('/v4/') > -1)
    return { url: normalizeSourceURL(url, accessToken) }
  if (resourceType === 'Source')
    return { url: normalizeSourceURL(url, accessToken) }

  // If we get here, we couldn't match the URL to any known pattern
  throw new Error('Invalid URL: Unrecognized Mapbox URL format')
}

function parseUrl(url: string) {
  const urlRe = /^(\w+):\/\/([^/?]*)(\/[^?]+)?\??(.+)?/
  const parts = url.match(urlRe)
  if (!parts) {
    throw new Error('Unable to parse URL object')
  }
  return {
    protocol: parts[1],
    authority: parts[2],
    path: parts[3] || '/',
    params: parts[4] ? parts[4].split('&') : []
  }
}

function formatUrl(urlObject: any, accessToken: string) {
  const apiUrlObject = parseUrl('https://api.mapbox.com')
  urlObject.protocol = apiUrlObject.protocol
  urlObject.authority = apiUrlObject.authority
  urlObject.params.push(`access_token=${accessToken}`)
  const params = urlObject.params.length ? `?${urlObject.params.join('&')}` : ''
  return `${urlObject.protocol}://${urlObject.authority}${urlObject.path}${params}`
}

function normalizeStyleURL(url: string, accessToken: string) {
  const urlObject = parseUrl(url)
  urlObject.path = `/styles/v1${urlObject.path}`
  return formatUrl(urlObject, accessToken)
}

function normalizeGlyphsURL(url: string, accessToken: string) {
  const urlObject = parseUrl(url)
  urlObject.path = `/fonts/v1${urlObject.path}`
  return formatUrl(urlObject, accessToken)
}

function normalizeSourceURL(url: string, accessToken: string) {
  const urlObject = parseUrl(url)
  urlObject.path = `/v4/${urlObject.authority}.json`
  urlObject.params.push('secure')
  return formatUrl(urlObject, accessToken)
}

function normalizeSpriteURL(url: string, accessToken: string) {
  const urlObject = parseUrl(url)
  const path = urlObject.path.split('.')

  let path1 = path[0]
  // If no extension provided in the URL, default to 'json'
  const path2 = path[1] || 'json'
  const suffix = path1.includes('@') ? path1.slice(path1.indexOf('@')) : ''
  path1 = path1.split('@')[0]

  urlObject.path = `/styles/v1${path1}/sprite${suffix}.${path2}`
  return formatUrl(urlObject, accessToken)
}
