/**
 * This is a simple example to encapuslate a javascript .join() function with Typescript
 * 
 * While trivial, it offers an easy demonstration of why Typsecript is prefered to help reduce code errors when working with data
 * 
 * Typescript is Javascript with some additional syntax to enforce input and output types (e.g: string, number, boolean, etc)
 *  
 * This function written in plain Javascript looks like
 * 
 * function joinFieldsRecordCompute(fieldsToJoin, separator) {
 *   return fieldsToJoin.join(separator)
 * }
 * 
 * Same function written in Typescript enforce the expected type of input and output
 *  
 * function joinFieldsRecordCompute(fieldsToJoin: Array<string>, separator: string): string {
 *    return fieldsToJoin.join(separator)
 * }
 * 
 * For example, this fails if pass in a number or string for that FieldsToJoin input.
 * 
 * A function to join fields into one with a seperator (e.g: ["John", "Smith"] becomes "John Smith")
 * @constructor
 * @param {Array<string>} fieldsToJoin - an array of field values to join.
 * @param {string} separator - what value is used between joined string (e.g, ' ', '-', ',').
 * @return {string} result is a string value of the new field
 */
 export default function joinFieldsRecordCompute(fieldsToJoin: Array<string>, separator: string): string {
  return fieldsToJoin.join(separator)
}
