import {
  TextField,
  NumberField,
  GroupByField,
  Sheet,
  Workbook,
  Portal
} from '@flatfile/configure'
import {
  Group,
  SumField,
  Count,
  Match,
  Error,
  GreaterThan,
  Unless,
  GroupConstraintItem,
  Do
} from './expression-lang/EXPR'

/**
 * This is a scaffold for defining a Workbook with Sheets and Portals.
 * Test this scaffold using the sample file in examples/sample-uploads/my-sheet-sample.csv.
 *
 * See examples/workbooks/FullExample.ts for a full, working example of a Workbook.
 */


/**
 * Sheets
 * Define your Sheet configuration and Fields here, or import them:
 * import { YourSheet } from './path-to-your-sheet/your-sheet.ts'
 */
const MySheet = new Sheet('MySheet', {
  firstName: TextField(),
  lastName: TextField(),
  age: NumberField(),
})

const BothSheet =  new Sheet(
  'BothSheet',
  {
    name: TextField(), 
    eye_color: TextField(), 
    job: TextField(), 
    age: NumberField(),
    age_sum: GroupByField(
      ['job'],
      // NOTE THE USE OF DO HERE...
      // Do allows multiple expressions to be executed and the result
      // of the last one is returned... in this case "SumField"
      Do(
       GroupConstraintItem(
	  Group(),
	  Unless(
	    GreaterThan(
	      Count(Match({eye_color: 'blue_'}, Group())),
	      0),
	    Error('No Blue eyes')),
	  'name',
	  Group()),
	SumField(Group(), 'age'))
    ),
  }
)





/**
 * Portals
 * Define your Portals here, or import them:
 * import { YourPortal } from './path-to-your-portal/your-portal.ts'
 */
const MyPortal = new Portal({
  name: 'MyPortal',
  sheet: 'BothSheet',
})

// Workbook  - Update to reference your Workbook with Sheet(s) and Portal(s)
//export default new Workbook({
export default new Workbook({name: 't', namespace: 't', sheets: {BothSheet},
  // name: 'MyWorkbook',
  // namespace: 'my-workbook',
  portals: [MyPortal],
})
