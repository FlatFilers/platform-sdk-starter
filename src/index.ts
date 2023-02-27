import {
  Sheet,
  Workbook,
  TextField,
  Message,
  SpaceConfig,
  ReferenceField,
  Action,
  BooleanField,
  OptionField,
  NumberField,
  makeField,
  mergeFieldOptions,
  stdlib,
  SynonymCast,
  Field
} from '@flatfile/configure'

// neither of these packages seem to work in X
// import { v4 as uuidv4 } from 'uuid';
// import { nanoid } from 'nanoid'

import * as dfns from "date-fns";

// using this to allow for "checked" in a true boolean field.
const BooleanSynonymField = makeField<
  boolean,
  { trueSubstitutes: string[]; falseSubstitutes: string[] }
>(BooleanField({}), {}, (mergedOptions, passedOptions) => {
  const trueSubstitutes = passedOptions.trueSubstitutes as string[]
  const falseSubstitutes = passedOptions.falseSubstitutes as string[]
  const cast = stdlib.cast.FallbackCast(
    SynonymCast(
      [
        [true, trueSubstitutes],
        [false, falseSubstitutes],
      ],
      (val) => `Couldn't convert '${val}' to a boolean`
    ),
    stdlib.cast.BooleanCast
  )

  const consolidatedOptions = mergeFieldOptions(mergedOptions, { cast })
  return new Field(consolidatedOptions)
})


const configSheet = new Sheet(
  'Configuration Sheet',
  {
    fieldLabel: TextField({
      label: 'Field Label'
    }),
    fieldKey: TextField({
      label: 'Field Key',
      description: 'Letters, numbers, and "_" only. No other characters allowed.'
    }),
    order: TextField({
      label: 'Order'
    }),
    description: TextField({
      label: 'Description',
    }),
    clientView: BooleanSynonymField({
      label: 'Client View',
      trueSubstitutes: ['checked'],
      falseSubstitutes: [],
    }),
    clientEdit: BooleanSynonymField({
      label: 'Client Edit',
      trueSubstitutes: ['checked'],
      falseSubstitutes: [],
    }),
    supplierView: BooleanSynonymField({
      label: 'Supplier View',
      trueSubstitutes: ['checked'],
      falseSubstitutes: [],
    }),
    supplierEdit: BooleanSynonymField({
      label: 'Supplier Edit',
      trueSubstitutes: ['checked'],
      falseSubstitutes: [],
    }),
    reqMatching: BooleanSynonymField({
      label: 'Required at Matching',
      trueSubstitutes: ['checked'],
      falseSubstitutes: [],
    }),
    reqReview: BooleanSynonymField({
      label: 'Required at Review',
      trueSubstitutes: ['checked'],
      falseSubstitutes: [],
    }),
    unique: BooleanSynonymField({
      label: 'Must be Unique',
      trueSubstitutes: ['checked'],
      falseSubstitutes: [],
    }),
    fieldType: OptionField({
      label: 'Field Type',
      options: {
        "string": "string",
        "number": "number",
        "boolean": "boolean",
        "category": "category",
        "email": "email",
        "phone": "phone",
        "percentage": "percentage"
      }
    }),
    categoryMapping: OptionField({
      label: 'Category Mapping',
      description: 'Comma separated values',
      options: {
        "Approved, Pending, Dispute": "Approved, Pending, Dispute",
        "Contractor, Employee": "Contractor, Employee",
        "N/A, E-2, EAD.H-1B, L-1A, TN": "N/A, E-2, EAD.H-1B, L-1A, TN",
        "Onshore, Offshore": "Onshore, Offshore",
        "Onsite, Remote, Hybrid": "Onsite, Remote, Hybrid",
        "W2, 1099, Corp to Corp": "W2, 1099, Corp to Corp"
      }
    }),
    numberLow: TextField({
      label: 'Number Low',
    }),
    numberHigh: TextField({
      label: 'Number High'
    })
  }
)

const dataSheet = new Sheet(
  'Data Sheet',
  {

    "flatfileId": TextField({
      "label": "Flatfile ID",
      "description": "ID field used by Flatfile",
      "unique": true
    }),


    "SupplierApproved": OptionField({
      "label": "Supplier Approved",
      "description": "Check this box when you have reviewed this row of data for completeness and accuracy.",
      "options": {
        "Approved": "Approved",
        "Pending": "Pending",
        "Dispute": "Dispute"
      }
    }),


    "SupplierComments": TextField({
      "label": "Supplier Comments",
      "description": "Add any additional information you wish to provide about this row of data.."
    }),


    "BuyerApproved": OptionField({
      "label": "Buyer Approved",
      "description": "Check this box when you have reviewed this row of data for completeness and accuracy.",
      "options": {
        "Approved": "Approved",
        "Pending": "Pending",
        "Dispute": "Dispute"
      }
    }),


    "BuyerComments": TextField({
      "label": "Buyer Comments",
      "description": "Add any additional information you wish to provide about this row of data.."
    }),


    "LegalFirstName": TextField({
      "label": "Legal First Name",
      "description": "Legal first name of worker"
    }),


    "LegalLastName": TextField({
      "label": "Legal Last Name",
      "description": "Legal last name of worker"
    }),


    "FullName": TextField({
      "label": "Full Name"
    }),


    "PreferredName": TextField({
      "label": "Preferred Name",
      "description": "Worker's preferred name if different from legal name"
    }),


    "EmployeeID": TextField({
      "label": "Employee ID",
      "description": "Employee ID of worker"
    }),


    "FGUsername": TextField({
      "label": "FG Username"
    }),


    "ContactEmail": TextField({
      "label": "Contact Email",
      "description": "Personal contact email of the worker",
      "required": true,
      "unique": true
    }),


    "MobilePhoneNumber": TextField({
      "label": "Mobile Phone Number",
      "description": "Mobile phone number of the worker"
    }),


    "WorkerShippingAddress": TextField({
      "label": "Worker Shipping Address",
      "description": "Worker's shipping address (for sending and returning equipment)"
    }),


    "BuyerEmail": TextField({
      "label": "Buyer Email",
      "description": "Buyer contact email of the worker if applicable",
      "unique": true
    }),


    "BirthDate": NumberField({
      "label": "Birth Date",
      "description": "Two digit day of worker's birthday (for Security ID generation)"
    }),


    "BirthMonth": NumberField({
      "label": "Birth Month",
      "description": "Two digit month of worker's birthday (for Security ID generation)"
    }),


    "SecurityID": TextField({
      "label": "Security ID"
    }),


    "HiringMgrFirstName": TextField({
      "label": "Hiring Mgr First Name",
      "required": true
    }),


    "HiringMgrLastName": TextField({
      "label": "Hiring Mgr Last Name",
      "required": true
    }),


    "HiringMgrEmail": TextField({
      "label": "Hiring Mgr Email",
      "required": true
    }),


    "SupplierName": TextField({
      "label": "Supplier Name",
      "description": "Legal name of supplier organization representing the worker.",
      "required": true
    }),


    "SupplierCode": TextField({
      "label": "Supplier Code"
    }),


    "SupplierContactEmail": TextField({
      "label": "Supplier Contact Email",
      "required": true
    }),


    "JobTitle": TextField({
      "label": "Job Title",
      "description": "Job Title of the worker"
    }),


    "MonumentJobTitle": TextField({
      "label": "Monument Job Title"
    }),


    "WorkspaceClientCollaboratorEmail": TextField({
      "label": "Workspace Client Collaborator Email"
    }),


    "WorkspaceSupplierCollaboratorEmail": TextField({
      "label": "Workspace Supplier Collaborator Email"
    }),


    "SOWID": TextField({
      "label": "SOW ID",
      "description": "SOW ID to which the worker is associated"
    }),


    "StartDate": TextField({
      "label": "Start Date",
      "description": "Start date of the worker's current contract"
    }),


    "EndDate": TextField({
      "label": "End Date",
      "description": "End date of the worker's current contract"
    }),


    "InitialBusinessJustification": TextField({
      "label": "Initial Business Justification",
      "description": "Business justification (if applicable) for worker's contract"
    }),


    "Currency": TextField({
      "label": "Currency",
      "description": "Billable currency on the worker's contract"
    }),


    "BillRate": TextField({
      "label": "Bill Rate",
      "description": "Buyer's hourly standard time rate for the worker"
    }),


    "PayRate": TextField({
      "label": "Pay Rate",
      "description": "Standard time pay rate of the worker"
    }),


    "OTFactor": NumberField({
      "label": "OT Factor",
      "description": "Overtime factor (if applicable)"
    }),


    "EstimatedExpenses": TextField({
      "label": "Estimated Expenses",
      "description": "Estimated dollar amount of expenses to be reimbursed to the worker over the life of the contract for travel, equipment, supplies, etc. above and beyond buyer expenses incurred from the worker's billable hours (if applicable)"
    }),


    "TaxPercOfBillRate": TextField({
      "label": "Tax % of Bill Rate",
      "description": "Tax rate assessed on services provided by worker as a percentage of bill rate"
    }),


    "WorkerType": OptionField({
      "label": "Worker Type",
      "description": "Ex. W2, 1099, Corp to Corp",
      "options": {
        "1099": "1099",
        "W2": "W2",
        "Corp to Corp": "Corp to Corp"
      }
    }),


    "ContractType": TextField({
      "label": "Contract Type",
      "description": "Ex. Contract, Contract to Hire"
    }),


    "WorkSiteName": TextField({
      "label": "Work Site Name",
      "description": "Name or address of worker's primary work location"
    }),


    "WorkSiteCode": TextField({
      "label": "Work Site Code"
    }),


    "VisaType": OptionField({
      "label": "Visa Type",
      "description": "If this workers is on a Visa, which type of Visa is the worker on? Select \"N/A\" if the worker is not on a Visa",
      "options": {
        "N/A": "N/A",
        "E-2": "E-2",
        "EAD.H-1B": "EAD.H-1B",
        "L-1A": "L-1A",
        "TN": "TN"
      }
    }),


    "SeatingLocation": TextField({
      "label": "Seating Location",
      "description": "Specific work location of worker within the primary work site"
    }),


    "WorkOnsite": OptionField({
      "label": "Work Onsite",
      "description": "Will the worker primarily work Onsite, Remote, or Hybrid?",
      "options": {
        "Onsite": "Onsite",
        "Remote": "Remote",
        "Hybrid": "Hybrid"
      }
    }),


    "OnshoreorOffshore": OptionField({
      "label": "Onshore or Offshore?",
      "description": "Will the worker be working Onshore of Offshore?",
      "options": {
        "Onshore": "Onshore",
        "Offshore": "Offshore"
      }
    }),


    "Department": TextField({
      "label": "Department",
      "description": "Department of the worker"
    }),


    "BusinessUnit": TextField({
      "label": "Business Unit",
      "description": "Business Unit of the worker"
    }),


    "OrganizationalUnit": TextField({
      "label": "Organizational Unit",
      "description": "Organizational Unit of the worker"
    }),


    "LineofBusiness": TextField({
      "label": "Line of Business",
      "description": "Line of Business of the worker"
    }),


    "GeneralLedger": TextField({
      "label": "General Ledger",
      "description": "General Ledger of the worker's contract"
    }),


    "GeneralLedgerAccount": TextField({
      "label": "General Ledger Account",
      "description": "General Ledger Account of the worker's contract"
    }),


    "PurchaseOrderNo": TextField({
      "label": "Purchase Order No.",
      "description": "Purchase Order No. of the worker's contract"
    }),


    "JobFamily": TextField({
      "label": "Job Family",
      "description": "Job Family of the worker"
    }),


    "SupervisororyOrganizaion": TextField({
      "label": "Supervisorory Organizaion",
      "description": "Supervisory Organization of the Worker"
    }),


    "ManagementLevel": TextField({
      "label": "Management Level",
      "description": "Management Level of the Worker"
    }),


    "Previouslyemployed": BooleanField({
      "label": "Previously Employed",
      "description": "Was worker previously employed by buyer?"
    }),


    "Previousemploymentenddate": TextField({
      "label": "Previous Employment End Date",
      "description": "If previously employed by buyer, when did the employment end?"
    }),


    "Previousemploymentendreason": TextField({
      "label": "Previous Employment End Reason",
      "description": "If previously employed by buyer, why did the employment end?"
    }),


    "Previousemploymenttype": OptionField({
      "label": "Previous Employment Type",
      "description": "If previously employed by buyer, specify if they were a contractor or employy.",
      "options": {
        "Contractor": "Contractor",
        "Employee": "Employee"
      }
    }),


    "Previousemploymentsupervisor": TextField({
      "label": "Previous Employment Supervisor",
      "description": "If previously employed by buyer, who was Supervisor?"
    }),


    "Currentlyprovisionedsystems": BooleanField({
      "label": "Currently Provisioned Systems",
      "description": "If this worker currently provisioned in buyer systems, please list them here."
    }),


    "SupplierWorkerDescription": TextField({
      "label": "Supplier Worker Description",
      "description": "Supplier's description of the worker/worker's qualifications"
    }),


    "CostCenter1": TextField({
      "label": "Cost Center 1",
      "description": "Primary billable Cost Center of the worker"
    }),


    "CostCenter1Code": TextField({
      "label": "Cost Center 1 Code"
    }),


    "CostCenter2": TextField({
      "label": "Cost Center 2",
      "description": "Secondary billable Cost Center of the worker"
    }),


    "CostCenter2Code": TextField({
      "label": "Cost Center 2 Code"
    }),


    "CostCenter3": TextField({
      "label": "Cost Center 3",
      "description": "Additional billable Cost Center of the worker"
    }),


    "CostCenter3Code": TextField({
      "label": "Cost Center 3 Code"
    }),


    "CostCenter4": TextField({
      "label": "Cost Center 4",
      "description": "Additional billable Cost Center of the worker"
    }),


    "CostCenter4Code": TextField({
      "label": "Cost Center 4 Code"
    }),


    "CostCenter5": TextField({
      "label": "Cost Center 5",
      "description": "Additional billable Cost Center of the worker"
    }),


    "CostCenter5Code": TextField({
      "label": "Cost Center 5 Code"
    }),


    "YearsofExperience": NumberField({
      "label": "Years of Experience",
      "description": "Years of experience of the worker in current job role"
    }),


    "LaptopRequired": BooleanField({
      "label": "Laptop Required",
      "description": "Will the worker require a laptop?"
    }),


    "FilesAccessRequired": BooleanField({
      "label": "Files Access Required",
      "description": "Will the worker require access to a file system, if so which file system?"
    }),


    "CellphoneRequired": BooleanField({
      "label": "Cellphone Required",
      "description": "Will the worker require a Cellphone?"
    }),


    "VoicemailAccessRequired": BooleanField({
      "label": "Voicemail Access Required",
      "description": "Will the worker require access to voicemail service?"
    }),


    "SpecialRequest": TextField({
      "label": "Special Request",
      "description": "Please enter any additional special requests for the worker."
    }),


  },
  {
    recordCompute: (record, session, logger) => {

      // Need a uuid solution to enable this data hook
      // if (!record.get('flatfileId')) {
      //   record.set('flatfileId', nanoid())
      // }


      const dateFields = [
        'StartDate',
        'EndDate',
        'Previousemploymentenddate'
      ]

      const valueFields = [
        'BillRate',
        'PayRate',
        'OTRate'
      ]

      const percFields = [
        'TaxPercOfBillRate'
      ]

      if (record.get('LegalFirstName') && record.get('LegalLastName') && !record.get('FullName')) {
        record.set('FullName', record.get('LegalFirstName') + ' ' + record.get('LegalLastName'))
      }

      dateFields.forEach(dateField => {

        if (record.get(dateField)) {

          try {
            let thisDate = dfns.format(new Date(record.get(dateField) as string), 'yyyy-MM-dd')
            let parseDate = dfns.parseISO(thisDate)
            if (parseDate.toString() === 'Invalid Date') {
              logger.info('Invalid Date')
            } else {
              logger.info(parseDate)
              record.set(dateField, dfns.format(parseDate, 'MM-dd-yyyy'))
            }
          }
          catch (err) {
            record.addError(dateField, 'Please check that the date is formatted mm/dd/yyyy.')
            logger.info(err)
          }
        }
      })

      if (record.get('StartDate') && record.get('EndDate')) {
        if (dfns.isAfter(new Date(record.get('StartDate') as string), new Date(record.get('EndDate') as string))) {
          record.addError('StartDate', 'Start Date must be before End Date')
          record.addError('EndDate', 'End Date must be after Start Date')
        }
      }

      valueFields.forEach(valueField => {
        let val
        if (record.get(valueField)) {
          val = Number(record.get(valueField))
          if (!Number.isNaN(val)) {
            record.set(valueField, val.toFixed(2))
          } else {
            record.addError(valueField, 'Not a Number')
          }
        }
      })

      percFields.forEach(percField => {
        let val = 0
        let perc = 0
        if (record.get(percField)) {
          val = Number(record.get(percField))
          if (!Number.isNaN(val)) {
            if (val >= 1) {
              // append %
              record.set(percField, record.get(percField) + '%')
            } else {
              if (val >= 0) {
                // convert to % and append %
                perc = val * 100
                record.set(percField, perc.toString() + '%')
              } else {
                record.addError(percField, 'Not a valid percentage')
              }
            }
          } else {
            record.addError(percField, 'Not a Number')
          }
        }
      })

      const keys = ['SupplierApproved', 'BuyerApproved', 'LegalFirstName', 'LegalLastName', 'BuyerEmail', 'BirthDate', 'BirthMonth', 'SupplierName', 'JobTitle', 'StartDate', 'EndDate', 'Currency', 'BillRate', 'OTFactor', 'EstimatedExpenses', 'TaxPercOfBillRate', 'WorkerType', 'ContractType', 'WorkSiteName', 'VisaType', 'WorkOnsite', 'OnshoreorOffshore', 'BusinessUnit', 'Previouslyemployed', 'CostCenter1', 'YearsofExperience']

      keys.forEach(aKey => {
        if (!record.get(aKey)) {
          record.addError(aKey, 'This field is required')
          logger.info(aKey)
        }
      })
    }

  }
)

const MasterWorkbook = new Workbook({
  name: 'Master Workbook',
  slug: 'MasterWorkbook',
  namespace: 'MasterWorkbook',
  sheets: {
    configSheet,
    dataSheet,
  },
})

const SpaceConfig1 = new SpaceConfig({
  name: 'Monument Space Config',
  slug: 'Monument',
  workbookConfigs: {
    MasterWorkbook,
  },
})

export default SpaceConfig1
