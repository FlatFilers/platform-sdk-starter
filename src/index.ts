import {
  BooleanField,
  OptionField,
  TextField,
  Sheet,
  Workbook,
} from "@flatfile/configure";

import {
    isNil,
    isNotNil,
    splitNames,
    emailOrPhoneRequired,
    dateFormatter,
    countryAndZipCodeFormatter
} from './data-hooks.js'

const phoneFormatter = require ('phone-number-formatter-us')

const mySheet = new Sheet(

    'My Sheet 2',
    {
        createDate: TextField({
            label: 'Create Date'
        }),
        firstName: TextField({
            label: 'First Name',
            description: 'Person First Name',
        }),
        lastName: TextField({
            label: 'Last Name',
            required: true
        }),
        phone: TextField('Phone Number', {
            compute: (v) => isNotNil(v) ? phoneFormatter(v) : null,
        }),
        postalCode: TextField({
            label: 'Postal Code'
        }),
        country: TextField({
            label: 'Country',
            description: 'Primary country of residence'
        }),
        optedIn: BooleanField({
            label: 'Opted In'
        }),
        status: OptionField({
            label: 'Deal Status',
            options: {
                prospecting: 'Prospecting',
                discovery: 'Discovery',
                proposal: 'Proposal',
                negotiation: 'Negotiation',
                closed_won: 'Closed Won',
                closed_lost: 'Closed Lost'
            }
        }),
    },
  {
    allowCustomFields: true,
    readOnly: true,
    recordCompute(record) {
        splitNames(record);
        emailOrPhoneRequired(record);
        dateFormatter(record);
        countryAndZipCodeFormatter(record);
        return record
    },
  }
);

export default new Workbook({
  name: "My Data Onboarding",
  namespace: "my onboarding",
  sheets: {
    mySheet,
  },
});
