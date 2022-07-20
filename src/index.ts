import {
    BooleanField,
    CategoryField,
    EmailField,
    TextField,
    Sheet,
    Workbook,
} from '@flatfile/configure'

export const CategoryAndBoolean = new Sheet(
    'CategoryAndBoolean',
    {
        firstName: TextField({
            required: true,
            description: 'foo',
        }),
        lastName: TextField(),
        email: EmailField({
            nonPublic: true,
            onValue: (v) => v.toUpperCase(),
        }),
        phoneNumber: TextField(),
        startDate: TextField(),
    },
    {
        allowCustomFields: true,
        readOnly: true,
        onChange(record) {
            const fName = record.get('firstName')
            console.log(`lastName was ${record.get('lastName')}`)
            record.set('lastName', fName)
            return record
        },
    }
)

export default new Workbook({
    name: 'Category And Boolean Onboarding',
    namespace: 'onboarding',
    sheets: {
        CategoryAndBoolean,
    },
})
