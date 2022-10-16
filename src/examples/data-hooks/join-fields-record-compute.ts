/**
 * A simple example to encapuslate a javascript .join() function with Typescript
 * 
 * ====================================
 * New to Typescript (.ts)?
 * 
 * If you are, then you might be wondering about the `.ts` file extension (vs `.js`)
 * It's extra syntax on Javascript to help check for errors
 * Useful to ensure input and output data types are correct throughout your program (e.g. boolean, string, object, array, ...) 
 *   
 * This function written in plain Javascript looks like
 * 
 * function joinFieldsRecordCompute(fieldsToJoin, separator) {
 *   return fieldsToJoin.join(separator)
 * }
 * 
 * ..but this might cause errors if you tried passing in a string (e.g. 'myField') to that first param
 * 
 * The same function written in Typescript enforces the expected type of input and output variables
 *  
 * function joinFieldsRecordCompute(fieldsToJoin: Array<string>, separator: string): string {
 *    return fieldsToJoin.join(separator)
 * }
 * ===================================
 */ 
 
 /**
 * A function to join fields into one with a seperator (e.g: ["John", "Smith"] becomes "John Smith")
 * @constructor
 * @param {Array<string>} fieldsToJoin - an array of field values to join.
 * @param {string} separator - what value is used between joined string (e.g, ' ', '-', ',').
 * @return {string} result is a string value of the new field
 */
 export default function joinFieldsRecordCompute(fieldsToJoin: Array<string>, separator: string): string {
  return fieldsToJoin.join(separator)
}
