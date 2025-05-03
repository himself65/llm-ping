export type Platform = 'openai' | 'anthropic' | 'google' | 'unknown'

/**
 * Predict the platform based on the API key prefix
 *
 * This function will check the prefix of the API key and return the corresponding platform.
 *
 * @param apiKey
 */
export function predict (
  apiKey: string
): Platform {
  if (apiKey.startsWith('sk-proj')) {
    return 'openai'
  } else if (apiKey.startsWith('sk-ant')) {
    return 'anthropic'
  } else if (apiKey.startsWith('AI')) {
    if (apiKey.length === 39) {
      return 'google'
    }
  }
  return 'unknown'
}

/**
 * Ping the API to check if the key is valid
 *
 * This function will make a request to the API and check if the response is 401 (Unauthorized).
 *
 * @param apiKey - The API key to validate
 * @param platform - The platform to validate against. If not provided, it will be predicted from the API key.
 */
export async function ping (
  apiKey: string,
  platform?: Omit<Platform, 'unknown'>
): Promise<boolean> {
  if (!platform) {
    platform = predict(apiKey)
  }
  switch (platform) {
    case 'openai':
      return fetch('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      }).then(r => r.status !== 401)
    case 'anthropic':
      return fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }
      }).then(r => r.status !== 401)
    case 'google':
      return fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`).
        then(r => r.status !== 401)
    default:
      throw new Error('Unsupported API key')
  }
}