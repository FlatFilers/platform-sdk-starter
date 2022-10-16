/**
 * An example function to demonstrate logic comparing values across all records to determine a value on each record
 * This type of function would only run once as a BatchRecordCompute on the sheet after all records are initially imported
 * 
 * 
 * @constructor
 * @param {Array} records - an array of all records from an import
 */
 export default function RankBatchRecordCompute(records: Array<object>): Array<object> {
  return calculateRankOnRecords(records)
 }


/**
 * 
 * These functions represent some fictional business logic to determine a ranked score
 * Purpose is to help visualize what type of code belongs in a batchRecordCompute function
 * 
 */
function calculateRankOnRecords(records: Array<object>): Array<object> {
  // 1. Set initial score to each record based on business rules
  const recordsWithBaseScore = records.map(record => {
    const baseScore = getBaseScore(record.revenue, record.geoCode, record.industry)
    return {...record, baseScore }
  })

  // 2. Sort based on comparison of baseScores 
  const sortedRecords = recordsWithBaseScore.sort(function(a, b){ 
    return a.baseScore - b.baseScore
  })

  // 3. records with 'rank' based on sort index and remove temp baseScore
  const recordsWithRank = sortedRecords.map((record, index) => {
    delete record.baseScore
    const rank = index + 1
    return {...record, rank}
  })

  return recordsWithRank
}

function getBaseScore(revenue: number, geoCode: number, industry: string): number {
  return revenueScore(revenue) + geoCodeScore(geoCode) + geoIndustryScore(industry)
}

function revenueScore(revenue: number): number {
  if (revenue >= 100_000_000) { return 10 }
  if (revenue >= 1_000_000) { return 5 }
  if (revenue >= 100_000) { return 2 }
  return 0
}

function geoCodeScore(geoCode: number): number {
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
function calculateDistanceFromHQ(_geoCode: number): number { 
  //This randomizes a distance value for demonsration purposes (between 2000 max and 1 min).
  return Math.floor(Math.random() * (2000 - 1) + 1)
}
