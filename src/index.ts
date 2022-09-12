import {
    BooleanField,
    OptionField,
    // EmailField,
    TextField,
    Sheet,
    Workbook,
} from '@flatfile/configure'

// import {
//     isNil,
//     isNotNil,
//     splitNames,
//     emailOrPhoneRequired,
//     dateFormatter,
//     countryAndZipCodeFormatter
// } from './data-hooks.js'

// const phoneFormatter = require ('phone-number-formatter-us')

const mySheet = new Sheet(
    'My Sheet 2',
    {
        createDate: TextField('Create Date'),
        firstName: TextField('First Name', {
            description: 'Person First Name',
        }),
        lastName: TextField('Last Name', {
            required: true
        }),
        // email: EmailField('Email Address', {
        //     nonPublic: true,
        //     unique: true
        // }),
        // phone: TextField('Phone Number', {
        //     compute: (v) => isNotNil(v) ? phoneFormatter(v) : null,
        // }),
        postalCode: TextField(),
        country: TextField('Country', {
            description: 'Primary country of residence'
        }),
        optedIn: BooleanField('Opted In'),
        status: OptionField({
            label: "Deal Status",
            options: {
              prospecting: "Prospecting",
              discovery: "Discovery",
              proposal: "Proposal",
              negotiation: "Negotiation",
              closed_won: "Closed Won",
              closed_lost: "Closed Lost",
            },
          })
    },
    {
        allowCustomFields: true,
        readOnly: true,
        // onChange(record) {
        //     splitNames(record);
        //     emailOrPhoneRequired(record);
        //     dateFormatter(record);
        //     countryAndZipCodeFormatter(record);
        //     return record
        // },
    })

export default new Workbook({
    name: 'My Data Onboarding',
    namespace: 'my onboarding',
    sheets: {
        mySheet,
    },
})
