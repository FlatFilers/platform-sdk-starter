
# Platform SDK Starter
The platform SDK starter is a way to configure your Flatfile Workbook in code.

Visit [the Guides](https://flatfile.com/docs/guides/) to learn more about using Flatfile and the Platform SDK Starter.

This readme is intended to provide convienient object reference definitions.

## Getting Started

Visit [CLI quickstart](https://flatfile.com/docs/get-started/quickstart/) and follow instructions to sign up for a Flatfile account and run this code locally.


## Object Reference
Technically taken from SchemaIL interfaces

### BaseFields
The base fields closely mirror primitive types and vary primarily by their default cast functions.  Read [the CastFunction tests](https://github.com/FlatFilers/platform-sdk-mono/blob/main/packages/configure/src/stdlib/CastFunctions.spec.ts) for explicit understanding of cast function behavior.
#### TextField
Persists strings.  Defaults to `StringCast` `cast`.
#### NumberField
Persists numbers.  Defaults to `NumberCast` `cast`
#### BooleanField
Persists booleans.  Defaults to `BooleanCast` `cast`
#### DateField.
Persists Dates.  Defaults to `DateCast` `cast`

### Special Fields
#### OptionField
Presents the user with discrete options. Accepts a specific option of
```ts
options:{'dbValue': 'Label displayed to user'}
options:{'dbValue': {label: 'Label displayed to user',  futureOption1: undefined}
```
It is called like this
```
    department: OptionField({
      label: 'Department',
      options: {
        engineering: 'Engineering',
        hr: 'People Ops',
        sales: 'Revenue',
      },
    }),
```
or
```ts
    department: OptionField({
      label: 'Department',
      options: {
        engineering: {label:'Engineering'},
        hr: {label:'People Ops'},
        sales: {label:'Revenue'}
      },
    }),

```

### FieldOptions
```ts
interface FieldOptions {
  label: string
  primary: boolean
  required: boolean
  unique: boolean
  cast: (value: Dirty<T>) => Nullable<T>
  default: Nullable<T>
  compute: (value: T) => T
  validate: (value: T) => void | Message[]
}
```
(Field Options Definitions)[https://github.com/FlatFilers/platform-sdk-mono/blob/main/packages/configure/src/ddl/Field.ts#L43-L69]
Every field can set at least the above properties
#### Label
Controls the label displayed for the field in the UI
#### Required
Is a value for this field required after the `default` stage of field hooks.  If set to true, an error will be thrown and registered as such on the cell for that value, no further processing will take place for that field.
#### Primary
Is this field the primary key for a sheet, or part of a composite primary key (not currently supported).  Primary implies unique too.
#### Unique
Is this field required to be unique across the whole sheet.  We have chosen to treat a field with multiple `null`s as still unique.  [Tests and comments](https://github.com/FlatFilers/platform-sdk-mono/blob/main/packages/configure/src/ddl/Sheet.ts#L41-L46)


#### `cast`
`cast` transforms input into the type specified by the field.
#### `default`
The default value for this field
#### `compute`
`compute` takes the type specified by the field and returns the type specified by the field.
#### `validate`
`validate` takes the type specified by the field and returns validation messages.  This is the most commonly used field hook.


#### Other Field Options
##### Description
Long form description that appears in the UI upon hover of the field name.
##### Annotations
Annotations are automatically filled in messages that the platform sdk provides when `default` or `compute` changes a value. Following independent options set as an object - `{}`
###### default
If set to `true` insertions of the `default` value will be annotated with an info message of `defaultMessage`
###### defaultMessage
The message to use when a `default` value is inserted.  If none specified, defaults to 'This field was automatically given a default value of'
###### compute
If set to `true` instances where `compute` changes the value of a field will be annotated with an info message of `computeMessage`
###### computeMessage
The message to use when a `compute` changes a value.  if none specified, defaults to 'This value was automatically reformatted - original data:'
##### stageVisibility
controls what parts of mapping/review/export a field occurs in
###### mapping
When set to `false` this field will not appear for matching in the mapping stage.
###### review
This field will not appear in the review stage
###### export
This field will not be exported.



### SheetOptions
```ts
export interface SheetOptions<FC> {
  allowCustomFields: boolean
  readOnly: boolean
  recordCompute: (record:FlatfileRecord<any>, logger?:any): void
  batchRecordsCompute: (records: FlatfileRecords<any>) => Promise<void>

}
```

#### allowCustomFields
Allows the end user to create additional fields from their upload when the incoming column does not match with any existing field for the Sheet.
#### recordCompute
Function that receives a row with all required fields fully present and optional fields typed `optional?:string`. Best used to compute derived values, can also be used to update existing fields.
#### batchRecordsCompute
Asynchronous function that is best for HTTP/API calls. External calls can be made to fill in values from external services. This takes `records` so it is easier to make bulk calls.


### SheetTester®

This helper utility gives you tools to test real records and fields locally against your field hooks (`default`, `cast`, `compute` and `validate`) and record-level compute functions (`recordCompute` and `batchRecordsCompute`). This runs the exact same logic that is done on Flatfile's production servers so it will produce the same results locally for quick testing before deploying. 

For example, with this TestSheet:
```js
const TestSheet = new Sheet(
  'TestSheet',
  {
    firstName: TextField({
      required: true,
      description: 'foo',
      compute: (v) => v.toUpperCase(),
    }),
    age: NumberField(),
    testBoolean: BooleanField({ default: false }),
  },
  {
    recordCompute: (record, _session, _logger) => {
      const age = record.get('age')
      const newAge = typeof age === 'number' ? age * 2 : 0
      record.set('age', newAge)
    },
  }
)
```

#### transformField(fieldName: string, value: string)
This takes a field name and value and returns the transformed value based on all sheet operations: 

```js
expect(await testSheet.transformField('age', '10')).toEqual(20)
```

#### testRecord(record: object)
This takes a full record and returns the transformed record based on all sheet operations: 

```js
const inputRow = { firstName: 'foo', age: '10', testBoolean: 'true' }

const expectedOutputRow = { age: 20, firstName: 'FOO', testBoolean: true }
const res = await testSheet.testRecord(inputRow)
expect(res).toMatchObject(expectedOutputRow)
```

#### testRecords(record: object[])
This takes an array of full records and returns the transformed records based on all sheet operations: 

```js
const inputRows = [
    { firstName: 'foo', age: '10', testBoolean: 'true' },
    { firstName: 'bar', age: '8', testBoolean: 'true' },
]

const expectedOutputRows = [
    { age: 20, firstName: 'FOO', testBoolean: true },
    { age: 16, firstName: 'BAR', testBoolean: true },
]

const results = await testSheet.testRecords(inputRows)
expect(results).toMatchObject(expectedOutputRows)
```


### FAQ

- **How can I lowercase an email field anytime input is provided by a file or manual entry?**
  - This is a good use for field `compute`. This function will be idempotent (running it over and over on the same input produces the same output and state)
- **How can check the type and size of an url and return an error if the linked file is > 5mb or not an image?**
  - Currently this is best accomplished with a text field named `s3_url` that will match to the URL provided in the upload, and a row `compute` that stores the size of the download to `s3_url_size`, `s3_url_size` should have an `validate` of less than 5mb.
  - In the near future this will be handled with a computed filed that takes `s3_url` as an input and outputs `s3_url_size`.
  - In the longer term this will be handled by a `SmartURLCapture` field that stores URLs to a synced s3 bucket and provides metadata about the download including size. The `validate` will run on the size property of the `SmartURLCapture` field
- **Using a domain name (www.flatfile.com) field, how can I call the clearbit API and populate another field with an image url to their logo?**
  - Currently this is best accomplished via a row `compute`.
  - Eventually we will build in Clearbit-integrated fields.
- **When adding an EmailField, if I specify “showSpamScore: true” I want a second, non-matcheable, readonly column to be added immediately after `email` called Spam Score. On input of any email I want to update the spam score field with the results from an API.**
  - To get similar behavior use row `compute` to fake a computed field like the previous three examples.
  - The result is possible but this implementation is currently not possible with the SDK.
  - Implementing this behavior requires composite fields or changes to the SchemaDDL so that a single Field call can emit to underlying fields
- **Can I round a number to two decimal places and simultaneously add a warning saying “this number was rounded to two decimal places: original number 90.090293**
  - This needs to be done via `recordCompute` or `batchRecordsCompute`. We currently only allow mutating data and simultaneously adding message in those hooks.
- **How can I generate an error if an email is an invalid format that says “Email is invalid format”**
  - This would be accomplished with `validate`.
- **How can I normalize a phone number and use a nearby country field to “hint” which country the phone number may belong to get a more accurate result? The country field must be normalized to an ISO code first.**
  - At first glance this could work as a row `compute` to add Country code to phone numbers.
  - In a future version of the SDK, this probably requires hooks to influence the matching system.
- **Can this be used to customize the schema based on the user that is logging in?**
  - No. That wouldn't result in the proper user experience because the schema is for every user.
  - To customize behavior per user requires writing custom react editors for fields that specialize based on the logged-in user, then tying these editors or other custom functionality in with SchemaIL. We haven't written these custom fields, nor tied them in with SchemaIL.
- **Can the SDK be used to generate dynamic schemas tied to my ORM or database definition?**
  - Currently this may be possible, but it isn't recommended.
  - Eventually this will be possible by writing tools that translate from ORM or database DDL to schemaIL. We are currently solidifying the core functionality of the platform and this will remain out of scope for the foreseeable future.

### Glossary
#### Sheet
A `Sheet` object describes the desired characteristics or "shape" of data that you expect for an individual CSV file or sheet in an excel file. A Sheet can be thought of as roughly analogous to a database table.  
#### Field
A `Field` object represents a column of data in a `Sheet`.  They are similar to columns in a database.  Fields can be configured to clean, transform and validate incoming data through options and hooks.
#### Data Hook®
Data Hooks® are the Flatfile copyrighted term for code that runs on `Field`s and `Sheet`s to transform and validate data.
#### Field Hook
Field hooks are Data Hook®s that run on individual fields.  There are three field-level hooks:
#### Workbook
A Workbook is a collection of Sheets.  The Sheets of a Workbook can be optionally linked together via `ForeignKey`.  A Workbook is similar to a database schema.

