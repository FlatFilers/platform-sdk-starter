import {
  Sheet,
  TextField,
  Workbook,
} from '@flatfile/configure'


const numexact5 = {
  regex: /(^$)|(^[0-9]{5}$)/,
  message: 'Must be exactly 5 numbers',
}

const allcharmax50 = {
  regex: /(^$)|(^.{0,50}$)/,
  message: 'Value must be 50 or fewer characters',
}

const anmax11 = {
  regex: /(^$)|(^[a-zA-Z0-9]{0,11}$)/,
  message: 'Value must be 11 or fewer alpha-numeric characters',
}

const anmax15 = {
  regex: /(^$)|(^[a-zA-Z0-9]{0,15}$)/,
  message: 'Value must be 15 or fewer alpha-numeric characters',
}

const anmax50 = {
  regex: /(^$)|(^[a-zA-Z0-9 ]{0,50}$)/,
  message: 'Value must be 50 or fewer alpha-numeric characters',
}

const lettersmax50 = {
  regex: /(^$)|(^[a-zA-Z ]{0,50}$)/,
  message: 'Value must be 50 or fewer letters',
}

const charmax10 = {
  regex: /(^$)|(^.{0,10}$)/,
  message: 'Value must be 10 or fewer characters',
}

const FIELDS = {
  supplierID: anmax50,
  MBI: anmax11,
  MemberZip: numexact5,
  NPI: anmax15,
  MemberAddress1: allcharmax50,
  MemberAddress2: anmax50,
  MemberAlias: anmax50,
  MemberCity: lettersmax50,
  Ending_DOS: charmax10,
}

const logger = { info: console.log }

const fieldTypeVal = (record) => {
  Object.keys(FIELDS).forEach((field) => {
    const fieldRegex = FIELDS[field]['regex']
    logger.info(FIELDS[field]['message'])
    logger.info(fieldRegex.toString())
    const fieldValue = record.get(field)
    if (fieldRegex.test(fieldValue) === false) {
      record.addError(field, FIELDS[field]['message'])
      logger.info(FIELDS[field]['message'])
    }
  })
}

export const SupplierMember = new Sheet(
  'SupplierMember',
  {

    supplierID: TextField({
      label: 'supplierID',
    }),

    NPI: TextField({
      label: 'NPI',
    }),

    MBI: TextField({
      label: 'MBI',
    }),

    MemberAddress1: TextField({
      label: 'MemberAddress1',
    }),

    MemberAddress2: TextField({
      label: 'MemberAddress2',
    }),

    MemberZip: TextField({
      label: 'MemberZip',
      description: 'Member Zip Code',
    }),


    MemberAlias: TextField({
      label: 'MemberAlias',
    }),

    MemberCity: TextField({
      label: 'MemberCity',
    }),

    Ending_DOS: TextField({
      label: 'EndDOS',
      description: 'Last Date of service you want retrieved for this request',
    }),
  },
  
  {
    recordCompute(record, logger) {
      fieldTypeVal(record)
    },
  }
)


export default new Workbook({
  name: 'Default',
  namespace: 'default',
  sheets: {
    SupplierMember
  },
})
