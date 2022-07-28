import {
    BooleanField,
    CategoryField,
    EmailField,
    TextField,
    Sheet,
    Workbook,
} from '@flatfile/configure'



const CategoryAndBoolean = new Sheet(
    'New Template With Category And Boolean',
    {
        firstName: TextField({
            required: true,
            description: 'foo',
        }),

        lastName: TextField(),
        email: EmailField({
            nonPublic: true,
            compute: (v) => v.toUpperCase(),
        }),
        boolean: BooleanField(),
        selectOptions: CategoryField({
            categories: { red: 'Red', blue: 'Blue', green: 'Green' }
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
