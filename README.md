# Flatfile Platform SDK Starter kit
Basic starter project for the Flatfile Platform SDK

## Introduction
- Platform SDK is the tool used to configure both the Flatfile Portal product and the Workspaces product
- You will use this to define the ideal target structure of the data in your system and Flatfile will
  take care of mapping any user provided data to this structure
- This is an opinionated piece of software based on our extensive experience shaping unstructured messy data into clean data you can trust to import into your system.  Because of that philosophy many of our functions and processing flows are strict and nuanced.  We strive to provide sensible defaults, sound core concepts that can be extended, and especially to not do unexpected things with your data.


## Getting Started



## Sample Workbook
```
const Employees = new Sheet('Employees', {
    firstName: TextField({
      required: true,
      description: 'Given name',}),
    lastName: TextField({}),
    fullName: TextField({}),
    stillEmployed: BooleanField(),
    department: OptionField({
      label: 'Department',
      options: {
        engineering: 'Engineering',
        hr: 'People Ops',
        sales: 'Revenue'}}),
    startDate: DateField('Start Date'),
    salary: NumberField({
      label: 'Salary',
      required: true,
      validate: (salary: number) => {
        const minSalary = 30_000
        if (salary < minSalary) {
          return [
            new Message(
              `${salary} is less than minimum wage ${minSalary}`,
...			  
```
[Full Example](src/examples/FullExample.ts)
![Sample Data upload](/assets/SampleImportErrors.png)


### Configure the environment
1. Create a `.env` file in the project root using the `.env.example` file as a template.
2. Follow these [instructions](https://docs.flatfile.com/api-reference/rest#managing-access-keys) to generate an **Access Key ID** and **Secret Access Key**
3. Add the Access Key ID to your `.env` file as the `FLATFILE_ACCESS_KEY_ID` variable
4. Add the Secret Access Key to your `.env` file as the `FLATFILE_SECRET` variable
5. Login to Flatfile and [find your team ID](https://support.flatfile.com/hc/en-us/articles/6097149079188-Where-is-my-TeamID-What-other-IDs-do-I-need-to-know-)
6. Add the Team ID to your `.env` file as the `FLATFILE_TEAM_ID` variable

### Deploy the Schema
1. Login to Flatfile and [find your team ID](https://support.flatfile.com/hc/en-us/articles/6097149079188-Where-is-my-TeamID-What-other-IDs-do-I-need-to-know-)
2. From the root directory of this project run `npx --yes @flatfile/cli publish ./src/index.ts --team <YOUR_TEAM_ID>`


3. From the root directory of this project run `npm run deploy`

Then navigate over to your dashboard and see newly deployed workspace

### Sample Workbook explained

This workbook uses the 6 builtin Flatfile fields `TextField`, `NumberField`, `DateField`, `OptionField`, `BooleanField`, to represent a workbook used to receive employee data.  There are a couple of interesting things to note about this Sheet and Workbook:

Note that `fullName` is computed from `firstName` and `lastName`.  The `onChange` function gets the whole row to modify.
Look at the `validate` function on the `salary` field, salary must be greater than 30,000.

department, look at the `categories` option.  This takes keys of database value and Values of labels for those keys.

We expect users to commonly override Validate to match their internal usecases,  Less commonly we expect recordCompute and batchRecordsCompute to be used.  Further intricacies of the hook processing system are explained at the end of this document.

## What datahooks do I want to use?
Per field, you probably want `validate` this function gets the proper type per field, and lets you add messages to the cell, including errors, warnings, and rejections.  For simple row work (that doesn't make HTTP calls) use `recordCompute` on sheet.  If you need to make an a call to an external API, reach for `batchRecordsCompute` on sheet, this allows you to request info about multipel values at once for increased performance.

### A note on parsing, casting, and field conversion.

We have written sensible default implementations of cast functions for TextField, NumberField, and DateField.  We wrote extensive tests to document and verify their behavior.  Please refer to [the CastFunction tests](https://github.com/FlatFilers/platform-sdk-mono/blob/main/packages/configure/src/stdlib/CastFunctions.spec.ts) to see more.

When our default `cast` function can't parse an incoming value in a reliable way, the cast function throws an error, the error message shows up in the UI, and the original value is stored in the table so users can edit that value into a proper type.

### Testing

We are big believers in Test Driven Development at Flatfile.  Well written tests help you reason about the behavior of complex systems.  We extensively used tests while developing this SDK, look here.  We encourage you to use our testing system to speed your development.  Running tests on a Sheet or Workbook is much faster than deploying to Flatfile, and manually uploading data to verify behavior.  Your tests will stay in this repo and help you make better decisions as you update your sheets and workbooks to reflect changing business requirements. Stay tuned for future releases we will add even more capabilities to our testing system.  

## Advanced Topics

### Concepts
The Flatfile hook system has been designed to enable fine grained functions to be used in combination to perform regular data validation and normalization tasks.  Flatfile is building out a comprehensive standard library so that developers can plug in the proper functions without having to write them from scratch.  This standard lib is leveraged by HDDL to describe implementations concisely.

The data pipeline orders data transformations so that functions at each point can be typed as strictly with the most strictly prescribed functionality.  This strict typing leads to more reliable functions that don't have surprise missing, undefined, or weird values.



![Event Sequence diagram](/assets/Event-Sequence.png)

  1. Matching takes place.  At this point we have rows of fields with names mapped to sheet field names.  Currently there is no ability to influence matching from the SDK
  2. field cast, functions here take a string or undefined and return either the primitive type specified by the field, null, or throw an error.
  3. field default, if `cast` returned null (but didn't throw an error), a default value is filled in for the field
  4. field compute functions receive a single fully present value and return a value of the same type
  5. `recordCompute`,  functions receive a row with all required fields fully present and optional fields typed `optional?:string`.  Best used to compute derived values, can also be used to update existing fields.
  6. `batchRecordsCompute` asynchronous (http/api) calls are made to fill in values from external services.  This takes `records` so it is easier to make bulk calls.
  7. field `validate`, functions receive a fully present value and return annotations for the corresponding cell


  if any function for a field throws an error, further processing is stopped for that field (what about the row?)

The most common custom written hooks that we expect to see are row compute and field validate

We expect users to very rarely write cast, these are some of the easiest and most important to add to FFL.

### Async functions
`recordCompute` is synchronous and only operates on one row at a time, in practice this isn't a big limitation because synchronous functions generally run extremely quickly in the node runtime.

`batchRecordsCompute` runs after all `recordCompute` hasve finished, and only operates on batches of records.  We made this engineering decision to encourage bulk operations when making external HTTP calls which tend to be slow.


### Best practices
Use field functions as much as possible.
field.compute should be idempotent and converge to the same value after calling on the same input, calling the same compute function on the output from the last invocation should return the original input
`compute:(v:string) => {return v.toLocaleLowerCase()}` is a good function `compute("ASDF") === compute('asdf') === 'asdf'`

## SDK philosophy

We are writing this SDK to enable skilled practitioneers to quickly implement powerful transformations that take unstructured data from untrusted data and shape that data into clean normalized data for input into many systems.  This is the core of what Flatfile builds and we take it seriously.  We also take our relationship with customers seriously, balancing putting tools in your hands quickly with supporting existing usecases.  We are here to listen to your feedback and build tools for you.

This initial release of the SDK is purposely limited in scope to include only the pieces we are most sure about.  We intend to rapidly release new functionality to the SDK and our platform as our understanding grows and we have time to put the best tools in front of you.

When releasing pieces to the SDK our thought process is guided by he following principles.

1. Does this solve a problem in an extensible way... Will we paint ourselves into a corner to solve a current problem
2. Can we support this code for the next 6 months until a breaking release.
3. Does this work as we expect it to.

# What breaks at major releases? (6 months.. 1 year,  2 years)


Our expectation is that major concepts will remain the same between releases??
Additional non breaking functionality will be rapidly added in minor releases.
When we move to a new major release, we will continue supporting the old release with security additions and gauruntee it will still run for 2 years on our platform.  New functionality will no longer be released to previous major releases.  We will do everything we can to facilitate upgrading your codebase to the new major release.



## FAQ

* How can I lowercase an email field anytime input is provided by a file or manual entry
  *This is a good use for field `compute`.  This function will be idempotent (running it over and over on the same input produces the same output and state)

* How can check the type and size of an url and return an error if the linked file is > 5mb or not an image
  * Currently this is best accomplished with a text field named `s3_url` that will match to the URL provided in the upload, and a  row `compute` that stores the size of the download to `s3_url_size`,  `s3_url_size` should have an `validate` of less than 5M.
  * In the near future this will be handled with a computed filed that takes `s3_url` as an input and outputs `s3_url_size`
  * In the longer term this will be handled by a `SmartURLCapture` field that stores URLs to a synced s3 bucket and provides metadata about the download including size.  The `validate` will run on the size property of the `SmartURLCapture` field
* Using a domain name (www.flatfile.com) field, I can call the clearbit API and populate another field with an image url to their logo.
  * Currently this is best accomplished via a row `compute`.
  * Eventually we will build in Clearbit integrated fields
* When adding an EmailField, if I specify “showSpamScore: true” I want a second, non-matcheable, readonly column to be added immediately after `email` called Spam Score. On input of any email I want to update the spam score field with the results from an API.
  * To get similar behavior use row `compute` to fake a computed field like the previous three examples
  * The result is possible but this implementation is currently not possible with the SDK
  * Implementing this behavior requires composite fields or changes to the SchemaDDL so that a single Field call can emit to underlying fields
  

* I can round a number to two decimal places and simultaneously add a warning saying “this number was rounded to two decimal places: original number 90.090293
  * This needs to be done via `recordCompute` or `batchRecordsCompute` we currently only allow mutating data and simultaneously adding message in those hooks.
* How can I generate an error if an email is an invalid format that says “Email is invalid format”
  * This would be accomplished with `validate`
* How can I normalize a phone number and use a nearby country field to “hint” which country the phone number may belong to get a more accurate result. The country field must be normalized to an ISO code first.
  * At first glance this could work as a row `compute` to add Country code to phone numbers.
  * In a future version of the SDK, this probably requires hooks to influence the matching system.
  
* Can this be used to customize the schema based on the user that is logging in.
  * No.  That wouldn't result in the proper user experience because the schema is for every user.
  * To customize behavior per user requires writing custom react editors for fields that specialize based on the loggedin user, then tieing these editors or other custom functionality in with SchemaIL.  We haven't written these custom fields, nor tied them in with SchemaIL
* Can the SDK be used to generate dynamic schemas tied to my ORM or database definition
  * Currently this may be possible but isn't recommended
  * Eventually this will be possible by writing tools that translate from ORM or database DDL to schemaIL.  We are currently solidifying the core functionality of the platform and this will remain out of scope for months.
  
  
  
