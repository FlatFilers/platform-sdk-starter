// workbook example shows how to structure with multiple imported sheets
import { Portal, Workbook} from '@flatfile/configure'

// Import sheets. You can define your own sheets to match your business use case
import Organizations from '../sheets/organizations'
import People from '../sheets/people'
import Notes from '../sheets/notes'

// Sheets - add imported sheets to array for the Workbook
const sheets = {
  Organizations,
  People,
  Notes
}

// Portal - add portals to an array for the Workbook
const portals = [
  new Portal({name: 'OrganizationsPortal', sheet: 'Organizations'}),
  new Portal({name: 'PeoplePortal', sheet: 'People'}),
  new Portal({name: 'NotesPortal', sheet: 'Notes'})
]

// Workbook 
export default new Workbook({
  name: 'MyWorkbook',
  namespace: 'my-workbook',
  portals,
  sheets
})
