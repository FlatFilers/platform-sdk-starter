/**
 * This is a simple example to encapuslate a javascript .join() function with a Typescript function
 * 
 * While trivial, it offers an easy demonstration of why Typsecript is prefered to help reduce code errors
 * 
 * Typescript is Javascript with some additional syntax to help enforce the input and output types (e.g: string, number, object)
 *  
 * Note: this function written in Javascript would look like
 * 
 * function joinFieldsRecordCompute(fieldsToJoin, separator) {
 *   return fieldsToJoin.join(separator)
 * }
 * 
 * Typescript helps enforce the type of inputs and outputs
 *  
 * function joinFieldsRecordCompute(fieldsToJoin: Array<string>, separator: string): string {
 *    return fieldsToJoin.join(separator)
 * }
 * 
 * A function to join fields into one with a seperator (e.g: ["John", "Smith"] becomes "John Smith")
 * @constructor
 * @param {Array} fieldsToJoin - an array of field values to join.
 * @param {string} separator - what value is used between joined string (e.g, ' ', '-', ',').
 */
 export default function joinFieldsRecordCompute(fieldsToJoin: Array<string>, separator: string): string {
  return fieldsToJoin.join(separator)
}
