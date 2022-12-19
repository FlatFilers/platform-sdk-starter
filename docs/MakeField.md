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
## What happens when I have a default validate function, and the user passes in a validate function
With out a custom written customizer argument to `makeField`, the passed in validate function would replace any other validate functions.

If you want to build fields that merge `cast`, `compute`, and validate function check our advanced guide on extending fields.

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

