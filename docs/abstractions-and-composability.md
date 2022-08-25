# Abstractions and Composability examples


## Original example
``` TS
const us_states = [   
{ name: "Alabama", code_2: "AL" },
  { name: "Alaska", code_2: "AK" },
  { name: "American Samoa", code_2: "AS" },
  { name: "Arizona", code_2: "AZ" },
  { name: "Arkansas", code_2: "AR" },
  { name: "California", code_2: "CA" },
  { name: "Colorado", code_2: "CO" },
  { name: "Connecticut", code_2: "CT" },
  { name: "Delaware", code_2: "DE" },
  { name: "District of Columbia", code_2: "DC" },
  { name: "Federated States of Micronesia", code_2: "FM" },
];

module.exports = async ({recordBatch, session, logger}) => {
  recordBatch.records.forEach((record) => {
    var currentState = record.get('state')
    if (currentState) {
      if (!us_states.find((c) => c.code_2 === currentState)) {
        const suggestion = us_states.find(
          (c) => c.name.toLowerCase().indexOf(currentState.toLowerCase()) !== -1
        );
        var newState = suggestion ? suggestion.code_2 : currentState
        record.set('state', newState)
        record.addComment('state', 'State was automatically formatted')
        if (!suggestion) {
        record.addError('state', 'US State is not valid')
    }
      }
    }
  }) 
}
```

Ok, this looks like it's going from a two letter state code to a full state name, or the other way around.

well this depends on the state being in a field named `state`.  We have to change the code if state ends up in `region`.

## First pass in Platform SDK

``` TS
import { StringCast, CastCompose } from '@flatfile/configure'

const Employees = new Sheet(
  'Employees',
  {
    firstName: TextField({required: true,}),
    state: TextField({cast:CastCompose(StringCast, (val: string) => {
	const US_States = [
		["AL", "Alabama"],
		["AK", "Alaska"],
		["AS", "American Samoa"],
		["AZ", "Arizona"],
		["AR", "Arkansas"],
		["CA", "California"],
		["CO", "Colorado"],
		["CT", "Connecticut"],
		["DE", "Delaware"],
		["DC", "District of Columbia"],
		["FM", "Federated States of Micronesia"],
	];
	const stateDict: Record<string, string> = fromPairs(US_States);
	const fullStateName = stateDict[val];
	if (fullStateName === undefined) {
		throw new Error(`'${val}' not a valid US State`)
	}
	return fullStateName;
}
)})},
{});
``` 

Ok this looks nice, we can see that we are only doing this for a single field, and we can do other casts, computes, and validations for different fields.


## Second pass in Platform-SDK

What about the second time we want to use this
Flatfile StdLib
``` TS
import { StringCast, CastCompose } from '@flatfile/configure'
export const StateCast = CastCompose(StringCast, (val: string) => {
	const US_States = [
		["AL", "Alabama"],
		["AK", "Alaska"],
		["AS", "American Samoa"],
		["AZ", "Arizona"],
		["AR", "Arkansas"],
		["CA", "California"],
		["CO", "Colorado"],
		["CT", "Connecticut"],
		["DE", "Delaware"],
		["DC", "District of Columbia"],
		["FM", "Federated States of Micronesia"],
	];
	const stateDict: Record<string, string> = fromPairs(US_States);
	const fullStateName = stateDict[val];
	if (fullStateName === undefined) {
		throw new Error(`'${val}' not a valid US State`)
	}
	return fullStateName;
}
);

```

``` TS
import { StateCast } from '@flatfile/stdlib
const Employees = new Sheet(
  'Employees',
  {
    firstName: TextField({required: true,}),
    state: TextField({cast: StateCast})},
{});
``` 

Ahh, now that's more like it.  The `employees` sheet looks tight, if you want to dig into StateCast you can, but now `employeees` just conveys the intent of "Cast this as a State".

## Extending StateCast
What about countries?
``` TS
export const CountryCast = CastCompose(StringCast, (val: string) => {
	const Countries = [
		["US", "United States"],
		["FR", "France"],
		["DE", "Germany"],
		["UK", "United Kingdom"],
	];
	const countryDict: Record<string, string> = fromPairs(Countries);
	const fullCountryName = stateDict[val];
	if (fullCountryName === undefined) {
		throw new Error(`'${val}' not a valid country`)
	}
	return fullCountryName;
}
);
```

Well that works, but it's not satisfying.  We had to rewrite a lot of the code specifically.  

## Building blocks for building blocks
This abbreviation thing seems generally useful.  Let's treat it as a generic concept.  Enter `SubstitutionCast`

``` TS

export CountryCast = SubstitutionCast([["US", "United States"],
		["FR", "France"],
		["DE", "Germany"],
		["UK", "United Kingdom"]], (invalid:str) => `'${invalid}' not a valid Country Code`)
		
export StateCast = SubstitutionCast( [
		["AL", "Alabama"],
		["AK", "Alaska"],
		["AS", "American Samoa"],
		["AZ", "Arizona"],
		["AR", "Arkansas"],
		["CA", "California"],
		["CO", "Colorado"],
		["CT", "Connecticut"],
		["DE", "Delaware"],
		["DC", "District of Columbia"],
		["FM", "Federated States of Micronesia"],
	], (invalid:str) => `'${invalid}' not a valid US State`);

```

And we use it just like any other cast function

``` TS
import { StateCast, CountryCast } from '@flatfile/stdlib
const Employees = new Sheet(
  'Employees',
  {
    firstName: TextField({required: true,}),
    state: TextField({cast: StateCast})},
    country: TextField({cast: CountryCast})},
{});
```


## This makes investing in the small stuff worthwhile

Now what if we want fuzzy matching for these Substitutions.  Well previously we would have had to modify reams of data hooks, and write small bits of code over and over again.  Now we can just add it onto `SubstitutionCast` and everyone gets that functionality for free.  This means it makes sense to write better core functions because they will get used more.

Here is what using fuzzy matching with `SubstituionCast` will look like


``` TS
import { StateCast, CountryCast } from '@flatfile/stdlib
const Employees = new Sheet(
  'Employees',
  {
    firstName: TextField({required: true,}),
    state: TextField({cast: StateCast({fuzzy:true})})},
{});
```

Just `{fuzzy:true}`, that's it.  Everywhere



