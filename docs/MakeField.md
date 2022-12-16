# Guide to making fields

Flatfile fields are built around composable extensibility with fine grained functions that are easily built upon

`MakeField` lets you create first class `Field`s to build data import workflows custom suite to your needs.

## How do I package common defaults into a field.

Imagine you want to validate that a field is a valid email. We will consider an email valid when it includes an `@` symbol

You can write an inline validate function for a field like this.

```
new Sheet('Person', {
   email: TextField({
	validate: (val: string) => {
		const emailRegex = /[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/
        if (!emailRegex.test(val)) {
          return [
            new Message(
              `${val} is not formatted like an email`,
              'warn',
              'validate'
            ),
          ]
        }
	}
})
```

If you find yourself using this field frequently you can create your own email Field.

```
export const EmailField = MakeField(TextField, {
	validate: (val: string) => {
		const emailRegex = /[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/
        if (!emailRegex.test(val)) {
          return [
            new Message(
              `'${val}' is not formatted like an email`,
              'warn',
              'validate'
            ),
          ]
        }
	}
})
```

Then you can use this EmailField in any place as a first class field

```
new Sheet('Person', {
   email: EmailField({required:true})
   }
})
```

Note that we passed in the `required:true` flag.

## Adding validation methods ontop of one-another

imagine you want to validate that an email ends with `.edu`, do you have to start from scratch? No. Here's what passing in an a validate option to email field would look like.

```
new Sheet('Person', {
   email: EmailField({required:true,
	validate: (val) =>  {
		if(!val.endsWith(".edu")) {
	      return [
            new Message(
              `'${val}' must end with a '.edu' domain`,
              'warn',
              'validate'
            ),
          ]
		}
	}
   })
})
```

Then both validations will be run, so the string "3627 Gentle Ln" would have the following warnings:
"'3627 Gentle Ln' is not formatted like an email" and
"'3627 Gentle Ln' must end with a .edu domain"

## Extending extended fields

You can also create a new field with this behavior built in

```
export const EduEmailField = MakeField(EmailField, {
	validate: (val) =>  {
		if(!val.endsWith(".edu")) {
	      return [
            new Message(
              `'${val}' must end with a '.edu' domain`,
              'warn',
              'validate'
            ),
          ]
		}
	}
})
```

## What about extending `compute` hooks

`Compute` hooks are functions that go from `T` to `T`. With `MakeField` extending `compute` hooks are applied successively.
Some examples

```
const Add10Field = MakeField(NumberField({}), {compute:(v:number) => v + 10})
Add10Field().verifyResult('5', 15)

Add10Field({compute:(v:number) => v / 5}).verifyResult('5', 3) // 15 / 3

const AlsoAdd200Field = MakeField(Add10Field, {compute:(v:number) => v + 200})
AlsoAdd200Field({}).verifyResult('5', 215) //'5' => 15 => 215
```

## What if I want to extend a field that does a lot of things I want, but some things I don't

What if you have a field that you like the compute hook, but not the validate hook., and you want to write a field with a simpler validate hook. In this case you must selectively pull in the hook you like and put it on top of a simpler base field

```
const WeirdValidateMathChainField = MakeField(AlsoAdd200Field, {
	validate: (val) => {
	  if (val % 2 === 0) {
		  return [
            new Message(
              `'${val}' must be odd`
              'warn',
              'validate'
            ),
          ]
	  }
	},
	compute: (v) => Math.pow(v, 2)
	})
//note that we are basing this on the much simpler NumberField
const SelectivelyComposedField = MakeField(NumberField, {compute:WeirdValidateMathChainField.options.compute})
```

Whoa, what happened here, won't we just get a compute of `Math.pow(v, 2)`, no. You will get the fully constructed chain of computes that `WeirdValidateMathChainField` had.

## What if I want to add easily configurable related options

```js
const UniqueAndRequiredField = MakeField(
  TextField,
  {},
  {
    customizer: (customizerOpts: { uniqueAndRequired: boolean }) => {
      if (uniqueAndRequired) {
        return { unique: true, required: true }
      } else {
        return {}
      }
    },
    customizerDefaults: { uniqueAndRequired: false },
  }
)
```

## What if I want to customize behavior of hooks

You can add your own options that allow shorthand configuration of fields. Let's make a regex validator field

```js
const RegexCustomizerField = MakeField(
  TextField,
  {},
  {
    customizer: (customizerOpts: {
      acceptRegexp: RegExp,
      rejectString: string,
    }) => {
      const validateFunc = (val: string) => {
        if (!acceptRegexp.test(val)) {
          return [new Message(`'${val}' ${rejectString}`, 'warn', 'validate')]
        }
      }
      return { validate: validateFunc }
    },
    //note, this default regexp will always return true
    customizerDefaults: {
      acceptRegexp: /.*/,
      rejectString: "It' Saul Goodman",
    },
  }
)

const InstantiatedEmailField = RegexCustomizerField({
  acceptRegexp: /[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/,
  rejectString: 'is not formatted like an email',
})
```

## What about cast functions

Cast functions are tricky to write and require deliberate thought. cast functions have no default extension method and are only replaced in whole. Cast functions are particularly difficult to write because of the multitude of possible incoming types

There are two main composition methods `NullCastCompose` and `ValCastCompose`

`NullCastCompose` runs a second `cast` function, when the first one returned null. The second function is called with the same arguments as the incoming raw value. It gives you another bite at the apple

```
const SimpleBooleanCast = (
  raw: string | undefined | null | boolean
): boolean | null => {
  if (typeof raw === 'boolean') {
    return raw
  } else if (typeof raw === 'string') {
	if (raw === 'true') {
		return true
	} else if (raw === 'false') {
		return false
	}
  }
  return null
}

const extraTaxBooleanCast = (raw: string | undefined | null | boolean) => {
	if (raw === 'Non Taxable') {
		return false
	} else if (raw === "taxable') {
		return true
	}
	return null
}

const TaxBooleanCast = NullCastCompose(SimpleBooleanCast, extraTaxBooleanCast)
```

`ValCastCompose` allows for additional refinement from a cast that returns a value. It only calls the second cast function when the first cast function returns a value

```
const stripCurrencyMarks = (val: string) => _.without(val, '$', ',', '€')
const CurrencyCast = ValCastCompose(ValCastCompose(StringCast, stripCurrencyMarks), NumberCast)
```

in the above code, we first make sure that we are getting a string without currency marks ValCastCompose(StringCast, stripCurrencyMarks), then send the result into NumberCast. If any function returns null, the whole cast function returns null

## Docstrings

We recommend writing extensive docstrings for your Fields like this:

```
 /**
 * A function to join fields into one with a seperator (e.g: ["John", "Smith"] becomes "John Smith")
 * @constructor
 * @param {Array<string>} fieldsToJoin - an array of field values to join.
 * @param {string} separator - what value is used between joined string (e.g, ' ', '-', ',').
 * @return {string} result is a string value of the new field
 */

 /**
 * A field that strips common currency characters from incoming data and returns a number for future fields
 * @param {FiledArgs} All of the regular Field options
 */
export const CurrencyField = MakeField(NumberField, {cast:CurrencyCast})
```
