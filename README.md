
# Quickstart
Use this quickstart guide to get up and running with Flatfile. You'll learn how to get your access keys, configure your environment, and deploy an example project for importing employee data.

### 1. Establish Access

After you create your account in Flatfile, we create a **Team ID**, an **Access Key ID**, and a **Secret Access Key** for you. You will need this information to configure your environment.

1. [Sign up](https://api.flatfile.io/auth/github) or [Sign in](app.flatfile.com) to Flatfile.
2. [Locate](https://support.flatfile.com/hc/en-us/articles/6097149079188-Where-is-my-TeamID-What-other-IDs-do-I-need-to-know-) your Flatfile **Team ID** and write it down.
3. [Generate](https://docs.flatfile.com/api-reference/rest#managing-access-keys)  an **Access Key ID** and **Secret Access Key**.


### 2. Configure your environment

1. Create a `.env` file in the project root using the `.env.example` file as a template.
2. Add the Access Key ID to your `.env` file as the `FLATFILE_ACCESS_KEY_ID` variable
4. Add the Secret Access Key to your `.env` file as the `FLATFILE_SECRET` variable
6. Add the Team ID to your `.env` file as the `FLATFILE_TEAM_ID` variable
7. Add the Environment you want to deploy to in your `.env` file as the `FLATFILE_ENV` variable. It defaults to 'test' and you can add 'prod' when you're ready to deploy to production.


### 3. Introduction to Workbooks

<!-- TODO what are workbooks? -->

Here is an example of a fully functional Flatfile **Workbook** that we'll use in this example to demonstrate importing employee data.

<!-- TODO highlight what's inside here -->

```js
const Employees = new Sheet(
  'Employees',
  {
    firstName: TextField({
      required: true,
      description: 'Given name',
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
    readOnly: true,
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

[View full source code](src/examples/FullExample.ts)

The above code will generate a workbook that looks like this:
![Sample Data upload](/assets/SampleImportErrors.png)


### 4. Deploy the Schema

Follow these steps to deploy a Workbook and view it in your Dashboard. Because your secret keys are being used, Flatfile will know to create your first Workspace in the correct place.

1. From the root directory of this project run `npm run deploy`
2. To see the newly deployed **Workbook**, open your [Dashboard](app.flatfile.com) and have a look.

#### Sample Workbook explained

Now, let's take a closer look at the example **Workbook** we just deployed, starting with the **Fields**. This **Workbook** uses all six built-in Flatfile fields to represent a workbook used to receive employee data:

1. `TextField`: a string of text
2. `NumberField`: a numerical value
3. `DateField`: a date
4. `OptionField`: a field with a set of pre-defined values
5. `BooleanField`: a true / false field

### Field options

Let's take a closer look at some of the options we've set on these fields:

#### TextField

```js
firstName: TextField({
  required: true,
  description: 'Given name',
})
```

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

Here we've indicated that the `firstName` field is required, and we've given it a human-readable description.

We alsol provide a `validate` function that defines what we consider to be a valid value for this field. In this case, we've decided that `salary` must be greater than or equal to 30,000. We also provide a human-readable message to be dipslayed when the validation criterion is not met.

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
}),
```

Here we provide a pre-defined list of values that this field can have.
<!-- TODO what does `label` do? -->


<!-- TODO Boolean Field? -->


### Sheet options

Next, let's look at the options that we've set on the sheet itself:

```js
const Employees = new Sheet(
  'Employees',
  ...
  {
    allowCustomFields: true,
    readOnly: true,
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

`readOnly`: explain what this does and what its default value is

-->

Here <!-- TODO change to "Next" after above section is filled out -->we define our Data Hooks&reg;, functions which operate on user-inputted data and perform transformations on it to meet your system's needs. There are two types of Data Hooks&reg; in this example: a `recordCompute` hook and a `batchRecordsCompute` hook.

```js
recordCompute: (record) => {
  const fullName = `{record.get('firstName')} {record.get('lastName')}`
  record.set('fullName', fullName)
  return record
}
```

`recordCompute` is a Data Hook which runs synchronously for each record. In this example, we use the values of the `firstName` and `lastName` fields to generate and set the derived `fullName` field.

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

`batchRecordsCompute` is a Data Hook which runs after all `recordCompute` calls have finished and receives the full list of processed rows, at which point you can perform bulk operations on them. This is a good place to put slower operations that benefit from batching, such as external HTTP requests. In this example, we fetch a single value from an API and write it to each record.

### 5. Get into the details

#### Knowing which hooks to use

`validate` should be used in most cases where you want to confirm that user-inputted data matches your specifications. For most fields, you probably want to use `validate`. This function gets the proper type per field, and lets you add messages to the cell, including errors, warnings, and rejections, so the user can correct errors themselves.

`recordCompute` and `batchRecordsCompute` should only be used for cases where you must modify user-inputted data or generate new values not provided by the user but needed for your systems. For simple row work (that doesn't make HTTP calls) use `recordCompute`. If you need to make an a call to an external API, reach for `batchRecordsCompute` on sheet, as this allows you to request info about multiple values at once for increased performance.

#### Parsing, casting, and field conversion.

<!-- TODO: explain what a cast function is and how it is used for parsing input -->
We have written sensible default implementations of cast functions for TextField, NumberField, and DateField. We wrote extensive tests to document and verify their behavior. Please refer to [the CastFunction tests](https://github.com/FlatFilers/platform-sdk-mono/blob/main/packages/configure/src/stdlib/CastFunctions.spec.ts) to see more.

When our default `cast` function can't parse an incoming value in a reliable way, the cast function throws an error, the error message shows up in the UI, and the original value is stored in the table so users can edit that value into a proper type.

#### Field functions best practices

`field.compute` should be idempotent and converge to the same value after calling on the same input, calling the same compute function on the output from the last invocation should return the original input.

```
compute:(v:string) => {return v.toLocaleLowerCase()}
```

is a good function, since `compute("ASDF") === compute('asdf') === 'asdf'`.
<!-- TODO provide an example of a bad function -->

### 6. Test your stuff

We are big believers in Test Driven Development at Flatfile. Well written tests help you reason about the behavior of complex systems. We extensively used tests while developing this SDK, look here <!-- TODO: where? -->. We encourage you to use our testing system to speed your development. Running tests on a Sheet or Workbook is much faster than deploying to Flatfile, and manually uploading data to verify behavior. Your tests will stay in this repo and help you make better decisions as you update your sheets and workbooks to reflect changing business requirements. Stay tuned for future releases we will add even more capabilities to our testing system.

### 7. Advanced Topics

#### Concepts

The Flatfile Data Hook system has been designed to enable fine-grained functions to be used in combination to perform regular data validation and normalization tasks. Flatfile is building out a comprehensive standard library so that developers can plug in the proper functions without having to write them from scratch. This standard library is leveraged by HDDL to describe implementations concisely.

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

`batchRecordsCompute` runs after all `recordCompute` hasve finished, and only operates on batches of records. We made this engineering decision to encourage bulk operations when making external HTTP calls which tend to be slow.

#### SDK philosophy

We are writing this SDK to enable skilled practitioneers to quickly implement powerful transformations that take unstructured data from untrusted sources and shape that data into a clean, normalized format for input into many systems. This is the core of what Flatfile builds and we take it seriously. We also take our relationship with customers seriously, balancing putting tools in your hands quickly with supporting existing usecases. We are here to listen to your feedback and build tools for you.

This initial release of the SDK is purposely limited in scope to include only the pieces we are most sure about. We intend to rapidly release new functionality to the SDK and our platform as our understanding grows and we have time to put the best tools in front of you.

When releasing pieces to the SDK our thought process is guided by he following principles.

1. Does this solve a problem in an extensible way? Will we paint ourselves into a corner to solve a current problem?
2. Can we support this code for the next 6 months until a breaking release?
3. Does this work as we expect it to?

---
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
