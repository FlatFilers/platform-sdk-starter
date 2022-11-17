import { TextField, Sheet } from '@flatfile/configure'

const removeExtraSpaces = new Sheet('removeExtraSpaces', {
  departmentName: TextField({
    compute: (value: any) => {
      return value.replace(/\s{2,}/g, ' ')
    },
  }),
})
