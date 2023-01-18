# SmartDateField

## Why

The `SmartDateField` lets you work with operations on `Date`s as objects, without worrying about parsing dates, or formatting dates.  Currently the `SmartDateField` can parse [12
date types](./SmartDateField.spec.ts#L221-L235) without any format strings.  This lets you concentrate on business logic, without worrying about incoming date formats.  This lets you confidently perform arithmetic and comparisons in `compute`, `recordCompute`, `batchRecordsCompute`, and `validate` on `Date`s.  `SmartDateField` has an `formatString` argument that controls how the date is serialized after `validate` is finished.  Flatfile users no longer have to convert in and out of dates to maintain formatting.

## What

There are comprehensive tests for `SmartDateField`, the most demonstrative being [DateSheet.spec.ts](./DateSheet.spec.ts).  This shows how dates can be compared as first class objects in a `recordCompute` function, and then formatted to a different persistence format with `formatString`.


### Assumptions made

We will add options to override these assumption as needed.

Dates without an Time of Day (TOD) and without a timezone (TZ)  will be interpreted as 00:00:00 in GMT.  By default JS dates are formatted to 00:00:00 in the local timezone, this leads to inconsistent results based on how the server is setup.

Dates with a TOD and without a TZ will be interpreted as that TOD in GMT.

Dates with a TOD and TZ will be interpreted with that TOD and TZ.

Dates that can't be explicitly parsed will throw an error and remain as the original string.

Please report bugs where this behavior isn't the case.

## Installing SmartDateField in an existing Flatfile project

### Note: SmartDateField is in public alpha

`SmartDateField` is currently in public alpha.  This exact code will work currently and against future versions of Flatfile, but we might update the behavior of the `SmartDateField` that is distributed going forward.  Please send any feedback or ideas for improvement to support@flatfile.com.

First copy the whole of [SmartDateField.ts](./SmartDateField.ts) into your repo at `src/SmartDateField.ts`  then in `src/index.ts` (or relevant template file where you want to use `SmartDateField`) you can import `SmartDateField` by adding the line

`import { SmartDateField } from './SmartDateField'`

Then:


You must edit the `package.json` at the project root and 
change the line for

 `@flatfile/configure`
to 

`"@flatfile/configure": "^0.5.2",`

additionally you must add the following dependencies:
```
    "dependencies": {
        "chrono-node": "^2.4.1",
        "date-fns": "^2.29.3",
        "date-fns-tz": "^1.3.7",
        "lodash": "^4.17.21",
    }
```

then run `npm install && npm update`

Reference the [package.json](../../package.json).

## Locale
You can instantiate a field with a locale argument of `"en"` `"fr"` `"nl"` `"ru"` or `"de"` this controls some default parsing behavor, `en` is the default.  Behavior that changes includes words used for months and days.  It also controls the default order of ambiguous month/day in Dates.

For the string `'06/02/09'`, `en` expects day first, then month yielding February 6th
                             `fr` expects month first, yielding June 2nd.

## Using `formatString`

You can control how dates are converted back to strings with the formatString option. formatString represents the date format you want to egress, and specifies how dates should be displayed to the user in the data table.


```
    before: SmartDateField({ required: true, formatString: 'yyyy-MM-dd' }),
```

`formatString` is a format string adhering to [Unicode Technical Standard #35](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).  You can read more in the [Date-fns docs](https://date-fns.org/v2.29.3/docs/format).


### Errors when using `formatString`

You need to be careful when selecting an `formatString` to make sure it agrees with the locale parsing format.  If it doesn't, you will seen an error on publish like this: 
the field of `SmartDateField({locale:'fr', formatString:"MM-dd-yy'"})` will yield an error like

```
castVal Wed Feb 04 2009 19:00:00 GMT-0500 (Eastern Standard Time) becomes 02-05-09 after egressFormat, which when cast gives Fri May 01 2009 20:00:00 GMT-0400 (Eastern Daylight Time)
/Users/paddy/platform-sdk-starter/.flatfile/build.js:57356
        throw new Error(`Error: instantiating a SmartDateField with an formatString of ${formatString}, and locale of '${locale2}'.  will result in data loss or unexpected behavior`);
              ^

Error: Error: instantiating a SmartDateField with an formatString of MM-dd-yy', and locale of 'fr'.  will result in data loss or unexpected behavior
```

In this case we have a field with locale of `fr`.  with an formatString of MM-dd-yy.  This format string doesn't agree with the locale.  This can lead to unexpected behavior.

If we didn't have this check, the following unwanted behavior could occur...
You start with a file containing "Feb 5th 2009" which is parsed as a date, then presented and saved as 02-05-09.  if this same value is pasted into the table, it is parsed next as May 2nd 2009.  This is unexpected behavior so we throw an error.



## Using `extraParseString`
Sometimes SmartDateField can't parse a date because it doesn't know how, or parsing would require an assumption that isn't reliable.  For those cases you can use `extraParseString`.
```
SmartDateField({extraParseString:"yyyyMMdd"})
```
Will try to parse all incoming dates normally, if it still can't parse the date, it will try to parse with the parse string. so for the above configured field, the string `'20080302'` parses to `new Date('2008-03-02T00:00:00.000Z')`

## Supported date formats
SmartDateField will parse the following formats with no configuration out of the box.
| Format       | Example                  | Explanation                                          |
|:-------------|:-------------------------|------------------------------------------------------|
| MonDDYY      | Feb072009                | Month abbreviation-Day-Year with leading zeros       |
| Mon DD, YYYY | Feb 15, 2009             | Month abbreviation, Day with leading zeros, Year     |
| DDMonYY      | 09 Feb, 2009             | Day-Month abbreviation-Year with leading zeros       |
| MM/DD/YY     | 02/17/2009               | Month-Day-Year with leading zeros - non ambiguous    |
| DD/MM/YY     | 17/02/2009               | Day-Month-Day with leading zeros - non ambiguous     |
| YY/MM/DD     | 2009/02/19               | Year-Month-Day with leading zeros                    |
| Month D, Yr  | February 20, 2009        | Month name-Day-Year with no leading zeros            |
| M/D/YY       | 2/21/2009                | Month/Day/Year with no leading zeros - non ambiguous |
| D/M/YY       | 22/2/2009                | Day-Month-Year with no leading zeros - non ambiguous |
| YY/M/D       | 2009/2/23                | Year/Month/Day with no leading zeros - non ambiguous |
| bM/bD/YY     | ' 2/24/2009'             | Month-Day-Year with leading spaces non ambiguous     |
| ISO Full     | 2009-02-26T00:00:00.000Z | Fully specified date with time and timezone          |
