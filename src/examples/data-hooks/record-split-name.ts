/**
 * This is function splits a string into two parts.
 * Example "John A Smith" becomes "John A", "Smith"
 * @constructor
 * @param {string} name - A name you want to split into 2 parts.
 */
export default function RecordSplitName(name: string) {
  const partOne = name.split(' ').slice(0, -1).join(' ');
  const partTwo = name.split(' ').slice(-1).join(' ');
  return [partOne, partTwo]
}
