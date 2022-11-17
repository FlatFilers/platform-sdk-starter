import {
  BaseFieldOptions,
  Field,
  Message,
  TextField,
} from '@flatfile/configure'

const urlRegex =
  /[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

export default function Url(options?: BaseFieldOptions<any>): Field<any, any> {
  return TextField({
    validate: (url: string) => {
      if (!urlRegex.test(url)) {
        return [new Message(`Input must be a URL`, 'warn', 'validate')]
      }
    },
    ...options,
  })
}
