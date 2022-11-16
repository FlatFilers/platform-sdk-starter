/**
 * This function splits a string into multiple parts.
 *
 * It always returns the number of parts requested. If splitting the string
 * results in more parts than requested, it returns the first n parts, where
 * n is the number requested. If splitting the string results in fewer parts
 * than requested, it returns those parts plus empty strings.
 *
 * Examples:
 * "John A Smith" returns ["John", "A" "Smith"] when 3 parts requested with ' '
 * separator
 *
 * "John A Smith" returns ["John", "A"] when 2 parts requested with ' '
 * separator
 *
 * "716-222" returns ["716", "222", ""] when 3 parts requested with '-'
 * separator
 *
 * @constructor
 * @param {string} fieldToSplit - field to split
 * @param {number} parts - the number of parts to split into
 * @param {string} separator - what value is used to split the string (e.g, ' ', '-', ',').
 * @return {Array<string>} result is an array of strings to match parts input number
 */
export default function SplitFieldRecordCompute(
  fieldToSplit: string,
  separator: string,
  parts: number
): Array<string> {
  const fieldParts = fieldToSplit.split(separator)
  let partsArray = Array(parts).fill('')

  fieldParts.forEach((part, index) => {
    if (index < partsArray.length) {
      partsArray[index] = part
    }
  })

  return fieldParts
}
