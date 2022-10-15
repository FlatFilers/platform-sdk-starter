/**
 * This function splits a string into two parts.
 * Example "John A Smith" becomes "John A", "Smith"
 * @constructor
 * @param {Object} record - the record.
 * @param {string} fieldToSplit - the field to split
 * @param {string} separator - what value is used to split the string (e.g, ' ', '-', ',').
 * @param {Array} fieldsToSet - an array of fields to set from a single field.
 * 
 * returns the record object with new field values set
 */
export default function SplitFieldsRecordCompute(
  record: object, 
  fieldToSplit: string,
  separator: string, 
  fieldsToSet: Array<string>, 
): object {
  const fieldToSplitArray = fieldToSplit.split(separator)
 
  if (fieldToSplitArray.length === fieldsToSet.length) {
    fieldsToSet.forEach((fieldToSet: any, index: number) => {
      record.set(fieldToSet, fieldToSplitArray[index])
    })
  } else {
    // TODO - fit array of more parts into output
    // ie: ["John", "A", "Smith"] => "John A" "Smith"
  }
  return record
}
