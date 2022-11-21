import { SmartDateField } from './DateField'
import { FlatfileRecord } from '@flatfile/hooks'
import { TextField, Sheet, Workbook } from '@flatfile/configure'
import { SheetTester } from './utils/testing/SheetTester'



const SimpleDateSheet = new Sheet(
  'SimpleDateSheet',
  {d: SmartDateField({required:true,
		      compute: (v:Date) => {
			//console.log(v.getHours())
			return v
		      },
		     })})

const DateBook= new Workbook({name:'DateBook', namespace:'test', sheets:{SimpleDateSheet}})


describe('Simple Date Sheet ->', () => {
  const testSheet = new SheetTester(DateBook, 'SimpleDateSheet')
  test('date conversion', async () => {
    const results = await testSheet.testRecord({'d':"02/17/2009"})
    console.log(results)

  })
})


// const CompSets = [
// //  { expResult: "error___", before: "18/02/2009", /*--*/ after: "02/17/2009" },
//   { expResult: "No Error", before: "02/17/2009", /*--*/ after: "2009/02/19" },
//   { expResult: "No Error", before: "2009/02/19", /*--*/ after: "February 20, 2009"},
//   { expResult: "error___", before: "February 20, 2009", after: "2/21/2009"},
//   { expResult: "error___", before: "22/2/2009", /*---*/ after: "2009/02/19"},
//   { expResult: "No Error", before: "2/21/2009", /*---*/ after: "2009/2/23"},
//   { expResult: "No Error", before: "February 20, 2009", after: " 2/24/2009"},
//   { expResult: "No Error", before: "February 20, 2009", after: "25Feb2009"},
//   { expResult: "No Error", before: " 2/8/2009", /*---*/ after: " 8/2/2009"},
// ];



// const DateSheet = new Sheet(
//   'DateSheet',
//   {before: SmartDateField({required:true}),
//    after: SmartDateField({required:true}),
//    expResult: TextField({required:true})  },
//   {recordCompute: (record: FlatfileRecord) => {
//     const [before, after] = [record.get('before'), record.get('after')]
//     if ((before && after) && !(before > after)) {
//       record.addError(['before', 'after'], "field 'before' must be a date before 'after'")
//     }
//   }
//   })
// const DateBook= new Workbook({name:'DateBook', namespace:'test', sheets:{DateSheet}})


// describe('Smaple Sheet ->', () => {
//   const testSheet = new SheetTester(DateBook, 'DateSheet')
//   test('true date comparison', async () => {
//     const results = await testSheet.testMessages(CompSets)
//     console.log(results)

//   })
// })
