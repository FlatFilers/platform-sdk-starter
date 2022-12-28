# Platform SDK Starter

The platform SDK starter is a way to configure your Flatfile Workbook in code.

Visit [the Guides](https://flatfile.com/docs/guides/) to learn more about using Flatfile and the Platform SDK Starter.

## Getting Started

Visit [CLI quickstart](https://flatfile.com/docs/get-started/quickstart/) and follow instructions to sign up for a Flatfile account and run this code locally.

### 1. Introduction to Workbooks

<!-- TODO what are workbooks? -->

Here is an example of a fully functional Flatfile **Workbook** that we'll use in this example to demonstrate importing employee data.

<!-- TODO highlight what's inside here -->

```js
const Employees = new Sheet(
  'Employees',
  {
    firstName: TextField({
      label: 'First Name',
      required: true,
      description: 'Given Name'
    }),
    lastName: TextField(),
    fullName: TextField(),

    stillEmployed: BooleanField(),
    department: OptionField({
      label: 'Department',
      options: {
        engineering: { label: 'Engineering' },
        hr: 'People Ops',
        sales: 'Revenue',
      },
      matchStrategy: 'exact',
    }),
    fromHttp: TextField({ label: 'Set by batchRecordCompute' }),
    salary: NumberField({
      label: 'Salary',
      description: 'Annual Salary in USD',
      required: true,
      validate: (salary: number) => {
        const minSalary = 30_000
        if (salary < minSalary) {
          return [
            new Message(
              `${salary} is less than minimum wage ${minSalary}`,
              'warn',
              'validate'
            ),
          ]
        }
      },
    }),
  },
  {
    allowCustomFields: true,
    recordCompute: (record) => {
      const fullName = `{record.get('firstName')} {record.get('lastName')}`
      record.set('fullName', fullName)
      return record
    },
    batchRecordsCompute: async (payload: FlatfileRecords<any>) => {
      const response = await fetch('https://api.us.flatfile.io/health', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })
      const result = await response.json()
      payload.records.map(async (record: FlatfileRecord) => {
        record.set('fromHttp', result.info.postgres.status)
      })
    },
  }
)

const BaseSheet = new Sheet(
  'BaseSheet',
  {
    firstName: TextField(),
    middleName: TextField('Middle'),
    lastName: TextField(),
    email: TextField({
      unique: true,
      primary: true
    })
  },
  {
    previewFieldKey: 'email',
  }
)

const LinkedSheet = new Sheet(
  'LinkedSheet',
  {
    email: LinkedField({
      unique: true,
      label: 'Email',
      primary: true,
      sheet: BaseSheet,
      upsert: false,
    }),
    firstName: TextField(),
    middleName: TextField('Middle'),
    lastName: TextField(),
  },
)

...
```

[View full source code](examples/workbooks/FullExample.ts)

The above code will generate a **Workbook** that looks like this:
![Sample Data upload](/assets/SampleImportErrors.png)

### 2. Deploy the Schema

Follow these steps to deploy a **Workbook** and view it in your **Dashboard**. Because your secret keys are being used, Flatfile will know to create your first **Workspace** in the correct place.

1. From the root directory of this project run `npm install` to install all necessary packages.
2. Run `npm run deploy`
3. To see the newly deployed **Workbook**, open your [Dashboard](app.flatfile.com) and have a look.

#### Sample Workbook explained

Now, let's take a closer look at the example **Workbook** we just deployed, starting with the **Fields**. This **Workbook** uses all five built-in Flatfile fields to represent a **Workbook** used to receive employee data:

1. `TextField`: a string of text
2. `NumberField`: a numerical value
3. `DateField`: a date
4. `OptionField`: a field with a set of pre-defined values
5. `BooleanField`: a true / false field
6. `LinkedField`: a field that links two sheets together

### Field options

Let's take a closer look at some of the options we've set on these fields:

#### TextField

```js
firstName: TextField({
  required: true,
  description: 'Given name',
})
```

Here we've indicated that the `firstName` field is required, and we've given it a human-readable description.

#### NumberField

```js
salary: NumberField({
  label: 'Salary',
  description: 'Annual Salary in USD',
  required: true,
  validate: (salary: number) => {
    const minSalary = 30_000
    if (salary < minSalary) {
      return [
        new Message(
          `${salary} is less than minimum wage ${minSalary}`,
          'warn',
          'validate'
        ),
      ]
    }
  },
}),
```

Here we've indicated that the `salary` field is required, and we've given it a human-readable description.

We also provide a `validate` function that defines what we consider to be a valid value for this field. In this case, we've decided that `salary` must be greater than or equal to $30,000. We also provide a human-readable message to be displayed when the validation criterion is not met.

<!-- TODO Date Field? -->

#### OptionField

```js
department: OptionField({
  label: 'Department',
  options: {
    engineering: { label: 'Engineering' },
    hr: 'People Ops',
    sales: 'Revenue',
  },
  matchStrategy: 'exact',
}),
```

Here we provide a pre-defined list of values that this field can have. We have also included the `matchStrategy` flag, which determines whether Flatfile should only accept exact matches when automatically matching your OptionField options, or whether Flatfile should also use [historical matches and fuzzy matches](https://support.flatfile.com/hc/en-us/articles/8579991586324-Matching) while automatically matching your options. If this is not set, your OptionField will use historical and fuzzy matches to automatically match options for this field.

If a `default` value is provided for an `OptionField` we check that is a value provided in `options`.

If you want to have an option value of the empty string `''`, you must set that as a default like this.
```
    emptyExample : OptionField({
      options:{eng:"Eng_Display_Label4", hr:"HR", "":"empty"},
      default: ''
    })
```

<!-- TODO what does `label` do? -->

<!-- TODO Boolean Field? -->

#### LinkedField

```js
email: LinkedField({
    label: 'First Name',
    sheet: BaseSheet,
    upsert: false
}),
```

Here we define which field is linked to another template, along with the sheet this field should be linked to. We have also set `upsert: false` which disables the default upsert behavior and will display an error on this sheet if a value imported in the LinkedField does not exist on the parent sheet. For more information about our Relational Data feature, visit our [Relational Data Guide](https://support.flatfile.com/hc/en-us/articles/8606584859284-Relational-Data).

```js
const BaseSheet = new Sheet(
  'BaseSheet',
  {
    firstName: TextField({
      unique: true,
      primary: true,
    }),
    middleName: TextField('Middle'),
    lastName: TextField(),
    email: TextField(),
  },
  {
    previewFieldKey: 'email',
  }
)
```

Here we define the sheet we are linking to, and on the sheet set the `previewFieldKey` option that will display on the original template. Note: `LinkedField` can currently only be implemented in Workspaces, which is why this example doesn't have a portal deployed for the LinkedSheet and BaseSheet sheets.

### Sheet options

Next, let's look at the options that we've set on the sheet itself:

```js
const Employees = new Sheet(
  'Employees',
  ...
  {
    allowCustomFields: true,
    recordCompute: (record) => {
      const fullName = `{record.get('firstName')} {record.get('lastName')}`
      record.set('fullName', fullName)
      return record
    },
    batchRecordsCompute: async (payload: FlatfileRecords<any>) => {
      const response = await fetch('https://api.us.flatfile.io/health', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })
      const result = await response.json()
      payload.records.map(async (record: FlatfileRecord) => {
        record.set('fromHttp', result.info.postgres.status)
      })
    },
  }
)
...
```

<!--

TODO: fill out this section

First we specify two options on the sheet: `allowCustomFields` and `readOnly`.

`allowCustomFields`: explain what this does and what its default value is


-->

Here <!-- TODO change to "Next" after above section is filled out -->we define our **Data Hooks&reg;**, functions which operate on user-inputted data and perform transformations on it to meet your system's needs. There are two types of **Data Hooks&reg;** in this example: a `recordCompute` hook and a `batchRecordsCompute` hook.

```js
recordCompute: (record) => {
  const fullName = `{record.get('firstName')} {record.get('lastName')}`
  record.set('fullName', fullName)
  return record
}
```

`recordCompute` is a **Data Hook** which runs synchronously for each record. In this example, we use the values of the `firstName` and `lastName` fields to generate and set the derived `fullName` field.

```js
batchRecordsCompute: async (payload: FlatfileRecords<any>) => {
  const response = await fetch('https://api.us.flatfile.io/health', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })
  const result = await response.json()
  payload.records.map(async (record: FlatfileRecord) => {
    record.set('fromHttp', result.info.postgres.status)
  })
}
```

`batchRecordsCompute` is a **Data Hook** which runs after all `recordCompute` calls have finished and receives the full list of processed rows, at which point you can perform bulk operations on them. This is a good place to put slower operations that benefit from batching, such as external HTTP requests. In this example, we fetch a single value from an API and write it to each record.

### 3. Get into the details

#### Knowing which hooks to use

`validate` should be used in most cases where you want to confirm that user-inputted data matches your specifications. For most fields, you probably want to use `validate`. This function gets the proper type per field, and lets you add messages to the cell, including errors, warnings, and rejections, so the user can correct errors themselves. Validate can’t change data, it can only send messages. Compute must be used if you want to perform any type of transformation

`recordCompute` and `batchRecordsCompute` should only be used for cases where you must modify user-inputted data or generate new values not provided by the user but needed for your systems. For simple row work (that doesn't make HTTP calls) use `recordCompute`. If you need to make an a call to an external API, reach for `batchRecordsCompute` on sheet, as this allows you to request info about multiple values at once for increased performance.

#### Parsing, casting, and field conversion.

<!-- TODO: explain what a cast function is and how it is used for parsing input -->

We have written sensible default implementations of cast functions for TextField, NumberField, and DateField. We wrote extensive tests to document and verify their behavior. Refer to [the CastFunction tests](https://github.com/FlatFilers/platform-sdk-mono/blob/main/packages/configure/src/stdlib/CastFunctions.spec.ts) to see more.

When our default `cast` function can't parse an incoming value in a reliable way, the cast function throws an error. The error message shows up in the UI and the original value is stored in the table so users can edit that value into a proper type.

#### Field functions best practices

`field.compute` should be idempotent and converge to the same value after calling on the same input, calling the same compute function on the output from the last invocation should return the original input.

```
compute:(v:string) => {return v.toLocaleLowerCase()}
```

is a good function, since `compute("ASDF") === compute('asdf') === 'asdf'`.

<!-- TODO provide an example of a bad function -->

### 4. Test your stuff

We are big believers in Test Driven Development at Flatfile. Well written tests help you reason about the behavior of complex systems.

We extensively used tests while developing this SDK, look here <!-- TODO: where? -->. We encourage you to use our testing system to speed up your development.

Running tests on a **Sheet** or **Workbook** is much faster than deploying to Flatfile and manually uploading data to verify behavior. Another added benefit is your tests will stay in this repo and help you make better decisions as you update your **Sheets** and **Workbooks** to reflect changing business requirements.

Stay tuned for future releases where we will add even more capabilities to our testing system.

### 5. Advanced Topics

#### Concepts

The Flatfile **Data Hook** system has been designed to enable fine-grained functions to be used in combination to perform regular data validation and normalization tasks. Flatfile is building out a comprehensive standard library so that developers can plug in the proper functions without having to write them from scratch. This standard library is leveraged by HDDL to describe implementations concisely.

The Flatfile data pipeline orders data transformations so that functions at each point can be strictly typed with the most strictly prescribed functionality. This strict typing leads to more reliable functions that don't have surprise missing, undefined, or weird values.
![Event Sequence diagram](/assets/Event-Sequence.png)

<!-- TODO add numbers to the diagram corresponding with below -->

1. Matching takes place. At this point we have rows of fields with names mapped to sheet field names. Currently there is no ability to influence matching from the SDK
2. `field:cast`: functions here take a string or undefined and return either the primitive type specified by the field, null, or throw an error.
3. `field:default`: if `cast` returned null (but didn't throw an error), a default value is filled in for the field
4. `field:compute`: functions receive a single fully present value and return a value of the same type <!-- TODO add an example of this to the example project -->
5. `recordCompute`: functions receive a row with all required fields fully present and optional fields typed `optional?:string`. Best used to compute derived values, but can also be used to update existing fields.
6. `batchRecordsCompute`: asynchronous (HTTP/api) calls are made to fill in values from external services. This takes `records` so it is easier to make bulk calls.
7. `field:validate`: functions receive a fully present value and return annotations for the corresponding cell

If any of the above functions for a field throws an error, further processing is stopped for that field. <!-- TODO: what about the row? -->

The most common custom written hooks that we expect to see are row compute and field validate.

We expect users to very rarely write their own cast functions; these are some of the easiest and most important to add to FFL.

#### Async functions

`recordCompute` is synchronous and only operates on one row at a time. In practice this isn't a big limitation because synchronous functions generally run extremely quickly in the node runtime.

`batchRecordsCompute` runs after all `recordCompute` have finished, and only operates on batches of records. We made this engineering decision to encourage bulk operations when making external HTTP calls which tend to be slow.

#### SDK philosophy

We are writing this SDK to enable skilled practitioners to quickly implement powerful transformations that take unstructured data from untrusted sources and shape that data into a clean, normalized format for input into many systems. This is the core of what Flatfile builds and we take it seriously. We also take our relationship with customers seriously, balancing putting tools in your hands quickly with supporting existing use cases. We are here to listen to your feedback and build tools for you.

This initial release of the SDK is purposely limited in scope to include only the pieces we are most sure about. We intend to rapidly release new functionality to the SDK and our platform as our understanding grows and we have time to put the best tools in front of you.

When releasing pieces to the SDK our thought process is guided by the following principles:

1. Does this solve a problem in an extensible way? Will we paint ourselves into a corner to solve a current problem?
2. Can we support this code for the next 6 months until a breaking release?
3. Does this work as we expect it to?

## Extra Docs
Links to more in-depth documentation we have written about features.

* [SmartDateField](./examples/fields/SmartDateField.README.md)

---

### FAQ

- **How can I lowercase an email field anytime input is provided by a file or manual entry?**
  - This is a good use for field `compute`. This function will be idempotent (running it over and over on the same input produces the same output and state)
- **Why can't I check for nulls in a `validate` function?**
  - You can't check for `null` or `undefined` in a validate function, because validate functions are never called with a value that isn't of the field's type.  The way to check for `null` is to set `required:true` on the field, this works for 95% of field use cases, this will flag an error at the review stage for fields provided with a `null` value.  Having this strict typing makes `validate` functions less error prone and less repetitious.  If we allowed `null` or `undefined` to propagate to `validate`,  every user provided function would have to start with checking for `null` or `undefined`, users who didn't do this would either see a typing error, or worse suffer unreliable code that was deployed.
  - **What do I do if I want to check for null or undefined in a validate function?**
    - The only place the built in `required` behavior doesn't work is when a `recordCompute` or `batchRecordsCompute` function was expected to provide a value for a field, and failed.  In that case, you are already writing a `recordCompute` or `batchRecordsCompute` function, check for the `null` there.
- **How can check the type and size of an url and return an error if the linked file is > 5mb or not an image?**
  - Currently this is best accomplished with a text field named `s3_url` that will match to the URL provided in the upload, and a row `compute` that stores the size of the download to `s3_url_size`, `s3_url_size` should have an `validate` of less than 5mb.
  - In the near future this will be handled with a computed field that takes `s3_url` as an input and outputs `s3_url_size`.
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

## Glossary

### Sheet

A `Sheet` object describes the desired characteristics or "shape" of data that you expect for an individual CSV file or sheet in an excel file. A Sheet can be thought of as roughly analogous to a database table.

### Field

A `Field` object represents a column of data in a `Sheet`. They are similar to columns in a database. Fields can be configured to clean, transform and validate incoming data through options and hooks.

### Data Hook®

Data Hooks® are the Flatfile copyrighted term for code that runs on `Field`s and `Sheet`s to transform and validate data.

### Field Hook

Field hooks are Data Hook®s that run on individual fields.

### Workbook

A Workbook is a collection of Sheets. The Sheets of a Workbook can be optionally linked together via `ForeignKey`. A Workbook is similar to a database schema.

## Object Reference

Technically taken from SchemaIL interfaces

### BaseFields

The base fields closely mirror primitive types and vary primarily by their default cast functions. Read [the CastFunction tests](https://github.com/FlatFilers/platform-sdk-mono/blob/main/packages/configure/src/stdlib/CastFunctions.spec.ts) for explicit understanding of cast function behavior.

#### TextField

Persists strings. Defaults to `StringCast` `cast`.

#### NumberField

Persists numbers. Defaults to `NumberCast` `cast`

#### BooleanField

Persists booleans. Defaults to `BooleanCast` `cast`

#### DateField.

Persists Dates. Defaults to `DateCast` `cast`

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

Is a value for this field required after the `default` stage of field hooks. If set to true, an error will be thrown and registered as such on the cell for that value, no further processing will take place for that field.

#### Primary

Is this field the primary key for a sheet, or part of a composite primary key (not currently supported). Primary implies unique too.

#### Unique

Is this field required to be unique across the whole sheet. We have chosen to treat a field with multiple `null`s as still unique. [Tests and comments](https://github.com/FlatFilers/platform-sdk-mono/blob/main/packages/configure/src/ddl/Sheet.ts#L41-L46)

#### `cast`

`cast` transforms input into the type specified by the field.

#### `default`

The default value for this field

#### `compute`

`compute` takes the type specified by the field and returns the type specified by the field.

#### `validate`

`validate` takes the type specified by the field and returns validation messages. This is the most commonly used field hook. Validate can’t change data, it can only send messages. Compute must be used if you want to perform any type of transformation

#### Other Field Options

##### Description

Long form description that appears in the UI upon hover of the field name.

##### Annotations

Annotations are automatically filled in messages that the platform sdk provides when `default` or `compute` changes a value. Following independent options set as an object - `{}`

###### default

If set to `true` insertions of the `default` value will be annotated with an info message of `defaultMessage`

###### defaultMessage

The message to use when a `default` value is inserted. If none specified, defaults to 'This field was automatically given a default value of'

###### compute

If set to `true` instances where `compute` changes the value of a field will be annotated with an info message of `computeMessage`

###### computeMessage

The message to use when a `compute` changes a value. if none specified, defaults to 'This value was automatically reformatted - original data:'

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

## SheetTester®

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

### transformField(fieldName: string, value: string)

This takes a field name and value and returns the transformed value based on all sheet operations:

```js
expect(await testSheet.transformField('age', '10')).toEqual(20)
```

### testRecord(record: object)

This takes a full record and returns the transformed record based on all sheet operations:

```js
const inputRow = { firstName: 'foo', age: '10', testBoolean: 'true' }

const expectedOutputRow = { age: 20, firstName: 'FOO', testBoolean: true }
const res = await testSheet.testRecord(inputRow)
expect(res).toMatchObject(expectedOutputRow)
```

### testRecords(record: object[])

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
