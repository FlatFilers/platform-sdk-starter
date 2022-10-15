/**
 * This typescript function splits a string into two parts.
 * Example an array of ["John", "Smith"] will become "John Smith"
 * @constructor
 * @param {Object} record - the record.
 * @param {Array} fieldsToJoin - an array of field values to join.
 * @param {string} separator - what value is used between joined string (e.g, ' ', '-', ',').
 * @param {string} fieldToSet - the field to set the joined string
 * 
 * returns the record object with new field value set
 */
 export default function joinFieldsRecordCompute(
  record: object, 
  fieldsToJoin: Array<string>, 
  separator: string, 
  fieldToSet: string
): object {
  const joinedFields = fieldsToJoin.join(separator)
  record.set(fieldToSet, joinedFields)
  return record
}