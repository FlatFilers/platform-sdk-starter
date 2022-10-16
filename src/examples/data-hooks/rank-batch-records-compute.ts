/**
 * An example function to demonstrate logic comparing values across all records to determine a value on each record
 * This type of function would only run once as a BatchRecordCompute on the sheet after all records are initially imported
 * 
 * Additionally this file demonstrates Typescript syntax to define the expected type and shape of inputs and outputs with a Type alias
 * 
 * 'RecordsInputs', 'RecordInput' help define the shape of input data
 * 
 * 'RecordsOutputs', 'RecordOutput' help define the shape of return data
 * 
 * Notice how the export function below uses these type aliases (vs. defining within the function)
 * 
 * function RankBatchRecordCompute(records: RecordsInputs): RecordsOutputs {
 *   return calculateRecordsWithRank(records)
 * }
 * 
 */ 

/**
 * @type {Object} - an input object with keys id, revenue, geoCode and industry
 */
type RecordInput = { 
  id: number,
  revenue: number,
  geoCode: string,
  industry: string
 }

/**
 * @type {Array<RecordInput>} - an array of objects that match the type alias RecordInput
 */
type RecordsInputs = Array<RecordInput>

/**
 * @type {Object} - an output object with keys id and rank
 */
type RecordOutput = { 
  id: number,
  rank: number
 }

/**
 * @type {Array<RecordOutput>} - an array of objects that match the type alias RecordOutput
 */
type RecordsOutputs = Array<RecordOutput>


/**
 * @param {RecordsInput} records - input records array of objects that uses id, revenue, geoCode and industry
 * @return {RecordOutput} returns array of record objects with id, rank
 */
 export default function RankBatchRecordCompute(records: RecordsInputs): RecordsOutputs {
  return calculateRecordsWithRank(records)
 }

/**
 * functions represent fictional business logic to determine a ranked score
 * comparison against all records from an import
 */
function calculateRecordsWithRank(records: RecordsInputs): RecordsOutputs {
  // 1. Set initial score to each record based on business rules
  const recordsWithScore = records.map(record => {
    const score = getScore(record.revenue, record.geoCode, record.industry)
    return {id: record.id, score }
  })

  // 2. Sort array based on comparison of baseScores 
  const sortedRecords = recordsWithScore.sort(function(a, b){ 
    return a.score - b.score
  })

  // 3. return record id and 'rank' based on sort index. Ommit temp score
  const recordsWithRank = sortedRecords.map((record, index) => {
    const rank = index + 1
    return {id: record.id, rank}
  })

  return recordsWithRank
}

function getScore(revenue: number, geoCode: string, industry: string): number {
  return revenueScore(revenue) + geoCodeScore(geoCode) + geoIndustryScore(industry)
}

function revenueScore(revenue: number): number {
  if (revenue >= 100_000_000) { return 10 }
  if (revenue >= 1_000_000) { return 5 }
  if (revenue >= 100_000) { return 2 }
  return 0
}

function geoCodeScore(geoCode: string): number {
  const getDistanceFromHQ = calculateDistanceFromHQ(geoCode)

  if (getDistanceFromHQ <=  10) { return 10 }
  if (getDistanceFromHQ <= 100) { return 5 }
  if (getDistanceFromHQ <- 1000) { return 2 }
  return 0
}

function geoIndustryScore(industry: string): number {
  if (industry === 'healthcare') { return 10 }
  return 0
}

// This function might use a library to calculate distance of geoPoint from a base geocode
function calculateDistanceFromHQ(_geoCode: string): number { 
  //This randomizes a distance value for demonsration purposes (between 2000 max and 1 min).
  return Math.floor(Math.random() * (2000 - 1) + 1)
}
