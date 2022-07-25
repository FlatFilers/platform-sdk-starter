# Flatfile Platform SDK Starter kit
Basic starter project for the Flatfile Platform SDK

## Introduction
The platform SDK allows you to configure your Flatfile installation and deploy from the command line.

## Sample Schema
```
const TestSchema = new Workbook(
  name: 'My first workbook',
  namespace: 'My company',
  sheets: {
	  orders: new Sheet(
	    'orders', 
          {orderId: NumberField({required:true, description:'order id primary key', unique:true}),
	       customerId: NumberField({required:true, description:'foreign key to customer id'}),
	       price: NumberField({required:true})}, {})})
```

## Getting Started

### Configure the environment
1. Create a `.env` file in the project root using the `.env.example` file as a template.
2. Follow these [instructions](https://support.flatfile.com/hc/en-us/articles/4406299638932-How-can-I-create-API-Keys-) to generate an **Access Key ID** and **Secret Access Key**
3. Add the Access Key ID to your `.env` file as the `FLATFILE_ACCESS_KEY_ID` variable
4. Add the Secret Access Key to your `.env` file as the `FLATFILE_SECRET` variable
5. Login to Flatfile and [find your team ID](https://support.flatfile.com/hc/en-us/articles/6097149079188-Where-is-my-TeamID-What-other-IDs-do-I-need-to-know-)
6. Add the Team ID to your `.env` file as the `FLATFILE_TEAM_ID` variable

### Deploy the Schema
1. Login to Flatfile and [find your team ID](https://support.flatfile.com/hc/en-us/articles/6097149079188-Where-is-my-TeamID-What-other-IDs-do-I-need-to-know-)
2. From the root directory of this project run `npx --yes @flatfile/cli publish ./src/index.ts --team <YOUR_TEAM_ID>`


1. From the root directory of this project run `npm run deploy`

Then navigate over to your dashboard and see newly deployed workspace

Include screenshot of data table from deployed schema
## Concepts
The Flatfile hook system has been designed to enable fine grained functions to be used in combination to perform regular data validation and normalization tasks.  Flatfile is building out a comprehensive standard library so that developers can plug in the proper functions without having to write them from scratch.  This standard lib is leveraged by HDDL to describe implementations concisely.

  The data pipeline orders data transformations sos that functions at each point can be typed as strictly with the most strictly prescribed functionality.

![Event Sequence diagram](/assets/Event-Sequence.png)

  1. Matching takes place.  At this point we have rows of fields with names mapped to sheet field names.  Currently there is no ability to influence matching from the SDK
  2. field cast, functions here take a string or undefined and return either the primitive type specified by the field, or undefined.
  3. field empty, functions here allow a field to provide a default value. this function returns the primitive type of the field or undefined.
  4. field compute functions receive a single FNUT value and return a value of the same type
  5. row compute,  functions receive a row with all required fields FNUT and optional fields maybe typed.  Best used to compute derived values, can also be used to update existing fields.
  6. field validate, functions receive a FNUT value and return annotations for the corresponding cell
  7. row validate, functions receive the full row.

  if any function for a field throws an error, further processing is stopped for that field (what about the row?)

The most common custom written hooks that we expect to see are row compute and field validate

  We expect users to very rarely write cast, these are some of the easiest and most important to add to FFL.
  most `empty`s will be implemented via `default` FFL

## FAQ

* I can lowercase an email field anytime input is provided by a file or manual entry
  *This is a good use for field `compute`.  This function will be idempotent (running it over and over on the same input produces the same output and state)

* I can check the type and size of an url and return an error if the linked file is > 5mb or not an image
  * Currently this is best accomplished with a text field named `s3_url` that will match to the URL provided in the upload, and a  row `compute` that stores the size of the download to `s3_url_size`,  `s3_url_size` should have an `validate` of less than 5M.

  * In the near future this will be handled with a computed filed that takes `s3_url` as an input and outputs `s3_url_size`

  * In the longer term this will be handled by a `SmartURLCapture` field that stores URLs to a synced s3 bucket and provides metadata about the download including size.  The `validate` will run on the size property of the `SmartURLCapture` field

* Using a domain field, I can call the clearbit API and populate another field with an image url to their logo.
  * Currently this is best accomplished via a row `compute`.
  * Eventually we will build in Clearbit integrated fields

* When adding an EmailField, if I specify “showSpamScore: true” I want a second, non-matcheable, readonly column to be added immediately after `email` called Spam Score. On input of any email I want to update the spam score field with the results from an API.
  * To get similar behavior use row `compute` to fake a computed field like the previous three examples
  * The result is possible but this implementation is currently not possible with the SDK
  * Implementing this behavior requires composite fields or changes to the SchemaDDL so that a single Field call can emit to underlying fields
  

* I can round a number to two decimal places and simultaneously add a warning saying “this number was rounded to two decimal places: original number 90.090293
  * This would be best accomplished with field `compute`.  It is unclear if the warning would be lost the next time a row was editted (because `compute` would then receive the already rounded version, and there wouldn't be anything to warn about).  
  * This usecase speaks to the need to maintain an `original` value and `output` value.  Currently our system conflates the two.
* I can generate an error if an email is an invalid format that says “Email is invalid format”
  * This would be accomplished with `validate`
* I can normalize a phone number and use a nearby country field to “hint” which country the phone number may belong to get a more accurate result. The country field must be normalized to an ISO code first.
  * At first glance this could work as a row `compute` to add Country code to phone numbers.
  * In a future version of the SDK, this probably requires hooks to influence the matching system.
  
* Can this be used to customize the schema based on the user that is logging in.
  * No.  That wouldn't result in the proper user experience because the schema is for every user.
  * To customize behavior per user requires writing custom react editors for fields that specialize based on the loggedin user, then tieing these editors or other custom functionality in with SchemaIL.  We haven't written these custom fields, nor tied them in with SchemaIL
* Can the SDK be used to generate dynamic schemas tied to my ORM or database definition
  * Currently this may be possible but isn't recommended
  * Eventually this will be possible by writing tools that translate from ORM or database DDL to schemaIL.  We are currently solidifying the core functionality of the platform and this will remain out of scope for months.
  
  
  
