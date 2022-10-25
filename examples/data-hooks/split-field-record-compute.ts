/**
 * This function splits a string into multiple parts.
 * Examples:
 *   "John A Smith" returns ["John A", "Smith"] when 2 parts requested with ' ' seperator 
 * 
 *   "John A Smith" returns ["John", "A" "Smith"] when 3 parts requested with ' ' seperator
 *  
 *   "716-222-1225" returns ["716", "222", "1225"] when 3 parts requested with '-' seperator
 * 
 * @constructor
 * @param {string} fieldToSplit - field to split
 * @param {number} parts - the field to split
 * @param {string} separator - what value is used to split the string (e.g, ' ', '-', ',').
 * @return {Array<string>} result is an array of strings to match parts input number
*/
export default function SplitFieldRecordCompute (
  fieldToSplit: string,
  separator: string,
  parts: number
): Array<string> {
 
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
