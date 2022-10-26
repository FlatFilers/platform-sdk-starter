import {
  Sheet,
  TextField,
  Workbook,
  Message
} from '@flatfile/configure'

const logger = { info: console.log }

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

const regexValidate = (regexMessage) => {
  const retFunc = (val:string) => {
    const regex = regexMessage.regex
    const message = regexMessage.message
    if (regex.test(val) === false) {
      logger.info(regex.toString())
      logger.info(message)
      return [
        new Message(message, 'error', 'validate')
          ]
    }
  }
  return retFunc
}


export const SupplierMember = new Sheet(
  'SupplierMember',
  {
    supplierID: TextField({
      label: 'supplierID',
      validate: regexValidate(anmax50)
    }),

    NPI: TextField({
      label: 'NPI', validate:regexValidate(anmax15)
    }),

    MBI: TextField({
      label: 'MBI', validate:regexValidate(anmax11)
    }),

    MemberAddress1: TextField({label: 'MemberAddress1', validate: regexValidate(allcharmax50)}),
    MemberAddress2: TextField({label: 'MemberAddress2', validate: regexValidate(anmax50)}),

    MemberZip: TextField({
      label: 'MemberZip',
      description: 'Member Zip Code',
      validate:regexValidate(numexact5)}),
    MemberAlias: TextField({label: 'MemberAlias', validate:regexValidate(anmax50)}),
    MemberCity: TextField({label: 'MemberCity', validate:regexValidate(lettersmax50)}),
    Ending_DOS: TextField({
      label: 'EndDOS',
      description: 'Last Date of service you want retrieved for this request',
      validate:regexValidate(charmax10)
    }),
  },
  {}
)

export default new Workbook({
  name: 'Default',
  namespace: 'default',
  sheets: {
    SupplierMember
  },
})
