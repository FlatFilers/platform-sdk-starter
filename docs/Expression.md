# The expression language by example

The expression language is the flatfile creation that allows concise code to be evaluated with the same syntax, whether that code is executing in a test in node, in a datahook in a validate function, or on our server for a sheetCompute.

Let's dive in

```
When(GreaterThan(Val(), 5), Error(" val is greater than 5"))
```

What's going on there... a lot

`Val()` is a special function, that references a variable for this interpret context.. more on that later.
We'll start from the inside `GreaterThan(Val(), 5)` runs `Val()` and returns true or false if it is greater or less than 5.

Let me explain a simpler expression first
```
When(true, Error(" val is greater than 5")
```
`When` is a conditional, based on the value of the first argument, it will conditionally return the expression in the second argument.

This all seems complex and a long way of saying 
`if(val > 5) {return error("val greater than 5");}`

The magic happens with this, because we aren't actually executing the code immediately.  We can execute the code immmediately, or we can send that same parse tree to the server and execute it there.

for a `validate` hook we execute it immediately, and `Val()` is the value being validated.

For a sheetCompute, or groupConstraint, we send the parse tree to the server for execution there.

# The expression language for validate Field hooks

The easiest place to use the expression language is for `validate` field hooks. 

let's take the above example and put it in a test Sheet
```
const SimpleSheet = new Sheet(
  'SimpleSheet',
  {age: NumberField({validate: ErrorWhen(LessThan(Val(), 21), "too young to drink")},
)
```


note, when used in a `validate` function, there are special MessageConditionals `ErrorWhen`,`ErrorUnless`, `WarnWhen`, `WarnUnless`, `InfoWhen`, `InfoUnless` that should be used.  `ErrorWhen` returns a function that accepts a value and calls the validate function on the expression, making `Val()` a valid way of accessing the argument for `validate`.

# GroupByField
```
const ItemSummary = new Sheet(
  'ItemSummary',
  {
  orderID: NumberField({}),  //parent item
  itemId:  NumberField({}),
  price:   NumberField({}),
  orderTotal: GroupByField('orderId', compute: Sum(GetColumn('price', Group())))
  }
)
```

this sheet looks fairly straight forward until we get to GroupByField.

the first argument is the column to group on
`compute` for GroupByField will be interpreted on the Flatfile server, once per group, with all relevant rows exposed as `Group()`.  `GetColumn` returns a list of values for the column from the set sent in.  `Sum` returns the sum of values passed in


# GroupConstraintSet
```
const MixedRowSheet = new Sheet(
  'MixedRows',
  {
  parentId: NumberField({}),
  rowType: TextField({}), //can be header or item
  colForHeader:  TextField({}),  // required per header row
  colForItem:   NumberField({}), //unique per parentId for rowType = item
  //the following field is just a placeholder to recieve errors
  validityErrors: GroupByField('parentId', compute: 
     GroupConstraintSet(
        [Group(), When(Equal(Count(Match({'rowType':'header'}), Group())), 0), 
		                Error("At least 1 rowType='header' required")],
        [Group(), When(Equal(Count(Match({'rowType':'item'}), MatchResult())), 0), 
                        Error("At least 1 rowType='item' required")],
        [Match({'rowType':'item'}), 
		         Unless(Equal(Count(MatchResult()), Count(Uniq(GetColumn('colForItem', MatchResult())))), 
                        Error("colForItem must be unique across parentId"))]))
  }
)
```


Wow, a lot going on there
`GroupConstraintSet` -- take arguments as (applicableSet, condition), add all Messages together and apply to field.

note we use `When` here to differentiate from `ValidateWhen`.  Still not sure how to handle this naming collision. 

for the first argument
```
	    [Group(), When(Equal(Count(Match({'rowType':'header'}), Group())), 0), 
		                               Error("At least 1 rowType='header' required")],
```
this will match each row in Group with `rowType`=`'header'` and count them.  if the count is 0, add an Error message of "header required".


```
        [Group(), When(Equal(Count(Match({'rowType':'item'}), MatchResult())), 0), 
		                               Error("At least 1 rowType='item' required")],
```
the second argument does much the same for rowType.  note `MatchResult()` which is the same as the condition used as the first argument of the array


```
        [Match({'rowType':'item'}), 
		         Unless(Equal(Count(MatchResult()), Count(Uniq(GetColumn('colForItem', MatchResult())))), 
                        Error("colForItem must be unique across parentId"))]))
```
the third argument only applies to rows where `rowType`=`'item'`.  this enforces that `colForItem` is unique within the group.






