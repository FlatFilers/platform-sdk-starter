# SmartDateField

## Why

The `SmartDateField` lets you work with operations on `Date`s as objects, without worrying about parsing dates, or formatting dates.  Currently the `SmartDateField` can parse [16 date types](./DateField.spec.ts#L43-L60) without any format strings.  This lets you concentrate on business logic, without worrying about incoming date formats.  This lets you confidently perform arithmetic and comparisons in `compute`, `recordCompute`, `batchRecordsCompute`, and `validate` on `Date`s.  `SmartDateField` has an `fString` argument that controls how the date is serialized after `validate` is finished.  Flatfile users no longer have to convert in and out of dates to maintain formatting.

## What

There are comprehensive tests for `SmartDateField`, the most demonstrative being [DateSheet.spec.ts](./DateSheet.spec.ts) .  This shows how dates can be compared as first class objects in a `recordCompute` function, and then formatted to a different persistence format with `fString`.


### Assumptions made

We will add options to override these assumption as needed.

Dates without an Time of Day (TOD) and without a timezone (TZ)  will be interpreted as 00:00:00 in GMT.  By default JS dates are formatted to 00:00:00 in the local timezone, this leads to inconsistent results based on how the server is setup.  00:00:00 is also the the behavior of pandas timestamp

Dates with a TOD and without a TZ will be interpreted as that TOD in GMT.

Dates with a TOD and TZ will be interpreted with that TOD and TZ.

Dates that can't be explicitly parsed will throw an error and remain as the original string.

Please report bugs where this behavior isn't the case.

## Installing SmartDateField in an existing Flatfile project

`SmartDateField` is currently in public alpha.  This exact code will work currently and against future versions of Flatfile... but we might update the behavior of the `SmartDateField` that is distributed going forward.  This lets us get feedback from users quickly, without locking us into supporting temporary design decisions.

First copy the whole of [SmartDateField.ts](./SmartDateField.ts) into your repo at `src/SmartDateField.ts`  then in `src/index.ts` (or relevant template file where you want to use `SmartDateField` you can import `SmartDateField` by adding the line

`import { SmartDateField } from './SmartDateField'`

Then:


You must edit the `package.json` at the project root and 
change the line for

 `@flatfile/configure`
to 


`"@flatfile/configure": "^0.4.8",`

additionally you must add the following dependencies:
```
    "dependencies": {
        "chrono-node": "^2.4.1",
        "date-fns": "^2.29.3",
        "date-fns-tz": "^1.3.7"
    }
```

then run `npm install`

Reference the [package.json](../../package.json) include on this branch (soon to be main).

## Using `fString`

You can control the serialization format of `SmartDateField` with the `fString` option.

```
    before: SmartDateField({ required: true, fString: 'yyyy-MM-dd' }),
```

`fString` is a format string adhering to [Unicode Technical Standard #35](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).  You can read more in the [Date-fns docs](https://date-fns.org/v2.29.3/docs/format).  At some future point we might add support for [python/pandas format strings](https://docs.python.org/3/library/datetime.html#strftime-and-strptime-behavior). 

## Using `extraParseString`
Sometimes SmartDateField can't parse a date because it doesn't know how, or parsing would require an assumption that isn't reliable.  For those cases you can use `extraParseString`.
```
SmartDateField({extraParseString:"yyyyMMdd"})
```
Will try to parse all incoming dates normally, if it still can't parse the date, it will try to parse with the parse string. so for the above configured field, the string `'20080302'` parses to `new Date('2008-03-02T00:00:00.000Z')`


## Supported date formats

| Format       | Example           | Explanation                                         |
|:-------------|:------------------|-----------------------------------------------------|
| DDMonYY      | 09 Feb, 2009      | Day-Month abbreviation-Year with leading zeros      |
| iso full     | Feb142009         | '2009-02-26T00:00:00.000Z'                          |
| D/M/YY       | 22/2/2009         | Day-Month-Year with no leading zeros                |
| DD Mon, YYYY | 16 Feb, 2009      | Day with leading zeros, Month abbreviation, Year    |
| DD/MM/YY     | 18/02/2009        | Day-Month-Year with leading zeros (                 |
| M/D/YY       | 2/21/2009         | Month-Day-Year with no leading zeros                |
| MM/DD/YY     | 02/17/2009        | Month-Day-Year with leading zeros                   |
| Mon DD, YYYY | Feb 15, 2009      | Month abbreviation, Day with leading zeros, Year    |
| MonDDYY      | Feb072009         | Month abbreviation-Day-Year with leading zeros      |
| Month D, Yr  | February 20, 2009 | Month name-Day-Year with no leading zeros           |
| YY/M/D       | 2009/2/23         | Year-Month-Day with no leading zeros                |
| YY/MM/DD     | 2009/02/19        | Year-Month-Day with leading zeros                   |
| bM/bD/YY     | 2/24/2009         | Month-Day-Year with spaces instead of leading zeros |

