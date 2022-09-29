import {
  //  BooleanField,
    DateField,
    Message,
    NumberField,
    OptionField,
  //  Portal,
    Sheet,
    TextField,
    Workbook,
  } from '@flatfile/configure'
  
  // import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
  // import fetch from 'node-fetch'
  import crono from 'chrono-node'
  
  const Branch_Supplemental = new Sheet(
    'Branch Supplemental',
    {
      branch_code: NumberField({
        label: "Branch Code",
        required: true,
        unique: true,
        description: 'Code of the branch',
      }),
      branch_name: TextField({
        label: "Branch Name",
        required: true
      }),
      branch_type: OptionField({
        label: 'Branch Type',
        options: {
          cost_center: { label: 'Cost Center' },
          other: { label: 'Other' },
          field_operations: { label: 'Field Operations' },
          sales_center: { label: 'Sales Center' },
          hub: { label: 'Hub' },
          distribution_center: { label: 'Distribution Center' }
        },
      }),
      alt_region_code: TextField({
        label: "Alt Region Code",
        validate: (alt_region_code: string) => {
        const alphaRegex = /^[a-z0-9]+$/i
        if (!alphaRegex.test(alt_region_code)) {
          return [
            new Message(
              `${alt_region_code} should be alphanumeric`,
              'error',
              'validate'
            ),
          ]
        }
      },
      }),
      alt_region_name: TextField({
        label: "Alt Region Name",
        validate: (alt_region_name: string) => {
          const alphaRegex = /^[a-z0-9]+$/i
          if (!alphaRegex.test(alt_region_name)) {
            return [
              new Message(
                `${alt_region_name} should be alphanumeric`,
                'error',
                'validate'
              ),
            ]
          }
        },
      }),
      branch_group_code: NumberField({
        label: "Branch Group Code"
      }),
      branch_group_name: TextField({
        label: "Branch Group Name"
      }),
      open_date: DateField({
        label: "Open Date",
        required: true
      }),
      close_date: DateField({
        label: "Close Date"
      }),
      active_date: DateField({
        label: "Active Date"
      }),
      last_relo_date: DateField({
        label: "Last Relo Date"
      }),
      branch_status: OptionField({
        label: 'Branch Status',
        options: {
          baker: { label: 'BAKER' },
          tradewinds: { label: 'TRADEWINDS' },
          consolidated: { label: 'Consolidated' }
        },
      }),
      status_effective_date: DateField({
        label: "Status Effective Date"
      }),
      status_end_date: DateField({
        label: "Status End Date"
      }),
      notes: TextField({
        label: "Notes"
      }),
    },
  
    
    {
      allowCustomFields: false,
      readOnly: false,
      // example of a record hook (not needed because of date typecasting)
      // recordCompute: (record) => {
      //   const openDate = crono.parse(`{record.get('open_date')}`)
      //   record.set('open_date', openDate[0].start.date())
      //   return record
      // }
    }
  )
  
  // Portal not needed in this example
  // const Supplemental3Portal = new Portal({
  //   name: 'Supplemental3Portal',
  //   sheet: 'Supplemental3'
  // })
  
  export default new Workbook({
    name: 'Branch Supplemental',
    namespace: 'Branch Supplemental',
    sheets: {
      Branch_Supplemental,
    },
    // portals: [Supplemental3Portal],
  })