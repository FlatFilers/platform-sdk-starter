/**
 * This function splits a string into two parts.
 * Example "John A Smith" becomes "John A", "Smith"
 * @constructor
 * @param {string} fieldToSplit - field to split
 * @param {number} parts - the field to split
 * @param {string} separator - what value is used to split the string (e.g, ' ', '-', ',').
*/
export default function SplitFieldRecordCompute (
  fieldToSplit: string, separator: string, parts: number): Array<string> {
  
  const fieldParts = fieldToSplit.split(separator)

  if (fieldParts.length < parts) {
    // todo
  }

  if (fieldParts.length > parts) {
    // todo
  }
 
  if (fieldParts.length === parts) {
    return fieldParts
  } 
}
