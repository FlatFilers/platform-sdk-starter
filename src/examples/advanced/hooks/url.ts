import { Message } from '@flatfile/configure'

/**
 * Validate url
 *
 * @param record
 * @param key
 */
 export function validateUrl(record, key: string) {
  
  // TODO - write regex for URL
  const valid = true

  if (valid) {
    return [
      new Message(
        `Must be a valid URL`,
        'warn',
        'validate'
      ),
    ]
  }
}