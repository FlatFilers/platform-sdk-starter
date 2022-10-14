/**
 * Validate phone number
 *
 * @param record
 * @param key
 */
 export function validatePhone(record, key: string) {
  const phone = record.get(key)
  if (phone) {
    let formatted = record.get(key).replace(/\D+/g, '')

    // TODO: this logic is flawed
    if (formatted == '9999999999' || formatted == '0000000000') {
      formatted = ''
    }

    record.set(key, formatted)
    if (formatted.length != '10') {
      record.addError(key, 'Please enter a valid number')
    }
    if (formatted !== phone) {
      record.addInfo(key, `Automatically reformatted from "${phone}" to "${formatted}"`)
    }
  }
}