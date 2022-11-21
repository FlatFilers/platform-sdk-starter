// workbook example shows how to structure with multiple imported sheets
import { Portal, Workbook } from '@flatfile/configure'

// Define your own sheets in seperate files for easier maintainability
import Organizations from '../sheets/organizations'
import People from '../sheets/people'
import Notes from '../sheets/notes'

// Sheets as object for Workbook
const sheets = {
  Organizations,
  People,
  Notes,
}

// Portals as array for Workbook
const portals = [
  new Portal({ name: 'OrganizationsPortal', sheet: 'Organizations' }),
  new Portal({ name: 'PeoplePortal', sheet: 'People' }),
  new Portal({ name: 'NotesPortal', sheet: 'Notes' }),
]

// Workbook
export default new Workbook({
  name: 'MultiSheetWorkbook',
  namespace: 'multi-sheet-workbook',
  portals,
  sheets,
})
