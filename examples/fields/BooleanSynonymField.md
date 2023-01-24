# BooleanSynonymField

BooleanSynonymField lets you specify custom synonyms for boolean values.  This need is so common we decided to encapsulate the logic into a field

## Use
```
spanishBoolean : BooleanSynonymField({
      trueSubstitutes: ['si', 'affirmative'],
      falseSubstitutes: ['nay', 'non'],
    })
```

how does our field behave
| raw         | output |
|:------------|:-------|
| si          | true   |
| true        | true   |
| yes         | true   |
| affirmative | true   |
| nay         | false  |
| non         | false  |


"yes" and "true" return `true` because BooleanSynonymField augments the base BooleanField
