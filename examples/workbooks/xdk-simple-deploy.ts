import { Sheet, Workbook, TextField, Message } from '@flatfile/configure'

const TestSheet = new Sheet(
  'TestSheet',
  {
    firstName: TextField('First Name'),
    middleName: TextField('Middle'),
    lastName: TextField({
      label: 'Last Name',
      compute: (val: string): string => {
        if (val == 'bar') {
          return 'baz'
        }
        return val
      },
      validate: (val: string): void | Message[] => {
        if (val === 'Rock') {
          throw 'Rock is not allowed!!!'
        }
      },
    }),
  },
  {
    previewFieldKey: 'middleName',
    recordCompute: (record) => {
      const firstName = String(record.get('firstName'))
      if (firstName) {
        if (firstName && firstName.includes(' ')) {
          const components = firstName.split(' ')
          if (components.length > 1 && components[1] !== '') {
            record.set('firstName', components[0])
            record.set('lastName', components[1])

            record
              .addInfo('firstName', 'Full name was split')
              .addInfo('lastName', 'Full name was split')
          }
        }
      }
    },
  }
)

const WB = new Workbook({
  name: 'Sheet from SDK',
  namespace: 'xdk-test',
  sheets: {
    TestSheet,
  },
})



//I would expect that BulkAction gets deployed somehow
export class BulkAction implements Mountable {
  //What object to listen on, what event name to listen too
  public listenOn = [WB, "bulkEventName"]

  public respond(ev:Event) {
    //many event body
  }
}

//do we have to add BulkAction to WB.  How do we make sure that BulkAction gets deployed?

  export default WB;
