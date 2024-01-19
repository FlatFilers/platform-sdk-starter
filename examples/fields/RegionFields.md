# RegionFields

`CountryField` and `StateField` are two region fields.  Both fields convert between common formats.

## StateField
StateField outputs a state in two formats - `two-letter` or `full`. 


### `two-letter`
| raw     | output |
|:--------|:-------|
| ak      | AK     |
| MS      | MS     |
| Ri      | RI     |
| Alabama | AL     |

### `full`
| raw     | output       |
|:--------|:-------------|
| ak      | Alaska       |
| MS      | Mississippi  |
| Ri      | Rhode Island |
| Alabama | Alabama      |

Instantiate StateField as follows
```
state: StateField({ stateFormat: 'two-letter' })
```

## CountryField

CountryField has three options for `countryFormat` - `iso-2`, `iso-3`, `full`

### `iso-2`
| raw    | output |
|:-------|:-------|
| us     | US     |
| USA    | US     |
| USa    | US     |
| France | FR     |

### `iso-3`
| raw    | output |
|:-------|:-------|
| us     | USA    |
| USA    | USA    |
| USa    | USA    |
| France | FRA    |

### `full`
| raw    | output                   |
|:-------|:-------------------------|
| us     | United States of America |
| USA    | United States of America |
| USa    | United States of America |
| France | France                   |


Instantiate `CountryField` like this
```
country: CountryField({'countryFormat':'iso-2'})
```
