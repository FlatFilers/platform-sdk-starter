# Guide to making fields

Flatfile fields are built around composable extensibility with fine grained functions that are easily built upon

`makeField` lets you create first class `Field`s to build data import workflows custom suite to your needs.

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
export const EmailField = makeField(TextField(), {
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

## Extending extended fields

You can also create a new field with this behavior built in

```
export const EduEmailField = makeField(EmailField(), {
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


## What if I want to add easily configurable related options

```js

const UniqueAndRequiredField = makeFieldRequired<string,{uniqueAndRequired:boolean}>(
  TextField(),
  {uniqueAndRequired:false},
  (mergedOptions, passedOptions) => {
  if (passedOptions.uniqueAndRequired) {
    const consolidatedOptions = mergeFieldOptions(mergedOptions, { unique: true, required: true })
    return new Field(consolidatedOptions)
  } else {
    return new Field(mergedOptions)
  }
})

```
This lets us call our new `UniqueAndRequiredField` like this `UniqueAndRequiredField({uniqueAndRequired:true})` and have the other options set for us. 


To do this we are adding options to the fieldCreator and  using a `customizer` that interprets those options.  A customizer has the type signature of

```js
customizer: (
    mergedOptions: FieldOnlyOptions<T> & ExtraOptions,
    extraUserOptions: Partial<FieldOnlyOptions<T>> & ExtraOptions,
    baseField: FieldOnlyOptions<T>,
    newDefaults: Partial<FieldOnlyOptions<T>> & ExtraOptions
  ) => Field<T>
```

At it's core, `makeField` and `makeFieldRequired` takes successive levels of options and applies them to create an instantiated field.  nb makeField does no intelligent merging of `cast`, `compute`, or `validate` functions, only assignment, but it give you all the lever to implement your own custom combination decision.  

customizers allow you accept new option names.  The extra option names need to go into the type signature of `makeField` an `makeFieldRequired`, in this case `{uniqueAndRequired:boolean}`.  These extra args are then made available to the customizer function.

The job of the customizer function is to take all the available options and defaults then return a `Field` instance.  Customizer is passed 4 arguments

`mergedOptions` - FieldOnlyOptions overwritten in the following order (last wins), BaseFields, NewDefaults, PassedOptions.
`passedOptions` - What options did the user call this field with
`baseField` - What options were on the original field?
`newDefaults` - What options were added as defaults to this field.

## What's the difference between `makeField` and `makeFieldRequired`.

Both functions take largely the same arguments, `makeFieldRequirements` returns a fieldCreator that must be passed in the new options for the type, and the Field creator is only called via the object syntax, the label only shortcut isn't allowed.

Label shortcut:
`TextField('label name')`
Object syntax
`TextField({required:true, label:'label name'})`


We recommend using `makeFieldRequired` because the type signature is slightly simpler and easier for users of your field to understand.


To write
## Building cast functions with FallbackCast and ChainCast
## Writing a customizer that succesively applies validation functions with mergeValidate
## Help understanding the typing
## philosophy of fields

