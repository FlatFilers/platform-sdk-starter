import * as _ from 'lodash';
import {
  EmailField,
  Sheet,
  TextField,
  Workbook,
  IHookPayload,
  Message
} from '@flatfile/configure'
import { CategoryAndBoolean } from './index'

import { NumberField } from '@flatfile/configure'
//import { WorkbookTester } from '@flatfile/schema/WorkbookTester'

const BaseFieldArgs = {
  required: true,
  description: 'This is a Number Field',
}


export class WorkbookTester {
  public workbook: Workbook;
  public testSheet;
  constructor(public readonly fields: any, public readonly hooks: any) {
    const TestSheet = new Sheet('test', fields, hooks)
    const TestWorkbook = new Workbook({
      name: `Test Workbook`,
      namespace: 'test',
      sheets: {
        TestSheet,
      },
    })
    this.workbook = TestWorkbook
    this.testSheet = TestSheet
  }

  public async checkRows(rawDs:any[]): Promise<void> {
    const targets = Object.keys(this.workbook.options.sheets)
    const rows =  _.map(rawDs, (rawData:any, i:number) => {
	return {row: {rawData, rowId: i+1}, info:[]}
    });
    const slug = this.workbook.options.namespace + '/' + targets[0];
    const formattedpayload = {
      schemaSlug: slug,
      rows
    } as IHookPayload
    const result = await this.workbook.handleLegacyDataHook(formattedpayload)
    console.log('fields', this.testSheet.fields)
    console.log('schemaIL', this.testSheet.toSchemaIL('test', targets[0]))
    console.log('JSONSchema', this.testSheet.toJSONSchema(this.workbook.options.namespace, targets[0]))
    console.log('result', result);
    // add unique check based on comparing the result 
  }



  public async checkRowResult({
    rawData,
    expectedOutput,
    message,
  }: {
    rawData: any
    expectedOutput?: any
    message?: any
  }): Promise<void> {
    const targets = Object.keys(this.workbook.options.sheets)
    const formattedpayload = {
      schemaSlug: this.workbook.options.namespace + '/' + targets[0],
      rows: [{ row: { rawData, rowId: 1 }, info: [] }],
    } as IHookPayload
    const result = await this.workbook.handleLegacyDataHook(formattedpayload)

    expectedOutput &&
      expect(result[0].row.rawData).toMatchObject(expectedOutput)
    message && expect(result[0].info[0].message).toBe(message)
  }
  public async checkRowMessage({
    rawData,
    message,
  }: {
    rawData: any
    message?: any
  }): Promise<void> {
    const targets = Object.keys(this.workbook.options.sheets)
    const formattedpayload = {
      schemaSlug: this.workbook.options.namespace + '/' + targets[0],
      rows: [{ row: { rawData, rowId: 1 }, info: [] }],
    } as IHookPayload
    const result = await this.workbook.handleLegacyDataHook(formattedpayload)
    expect(message).toBeTruthy()
    if(message) {
      console.log("result[0]", result)
    }
    message && expect(result[0].info[0].message).toBe(message)
  }

}

export class FieldTester {
  public workbook
  constructor(public readonly field: any) {
    const TestSheet = new Sheet(
      'test',
      {'a': NumberField(field)},
      {})

    const TestWorkbook = new Workbook({
      name: `Test Workbook`,
      namespace: 'test',
      sheets: {
        TestSheet,
      },
    })
    this.workbook = TestWorkbook
  }

  public async checkRowResult({
    rawData,
    expectedOutput,
    message,
  }: {
    rawData: any
    expectedOutput?: any
    message?: any
  }): Promise<void> {
    const targets = Object.keys(this.workbook.options.sheets)
    const formattedpayload = {
      schemaSlug: this.workbook.options.namespace + '/' + targets[0],
      rows: [{ row: { rawData, rowId: 1 }, info: [] }],
    } as IHookPayload
    const result = await this.workbook.handleLegacyDataHook(formattedpayload)

    expectedOutput &&
      expect(result[0].row.rawData).toMatchObject(expectedOutput)
    message && expect(result[0].info[0].message).toBe(message)
  }

  public async checkFieldResult(
    inputVal:any,
    expectedOutputVal:any,
  ): Promise<void> {
    const targets = Object.keys(this.workbook.options.sheets)
    const rawData = {a:inputVal};
    const formattedpayload = {
      schemaSlug: this.workbook.options.namespace + '/' + targets[0],
      rows: [{ row: { rawData, rowId: 1 }, info: [] }],
    } as IHookPayload
    const result = await this.workbook.handleLegacyDataHook(formattedpayload)

    const resultVal = result[0].row.rawData['a'];
    expect(resultVal).toBe(expectedOutputVal);
  }

  public async checkFieldMessage(
    inputVal:any,
    expectedMessage:any,
  ): Promise<void> {
    const targets = Object.keys(this.workbook.options.sheets)
    const rawData = {a:inputVal};
    const formattedpayload = {
      schemaSlug: this.workbook.options.namespace + '/' + targets[0],
      rows: [{ row: { rawData, rowId: 1 }, info: [] }],
    } as IHookPayload
    const result = await this.workbook.handleLegacyDataHook(formattedpayload)

    expect(expectedMessage).toBeTruthy()
    expectedMessage && expect(result[0].info[0].message).toBe(expectedMessage)
  }

  public async matchFieldMessage(
    inputVal:any,
    expectedMessage:Message,
  ): Promise<void> {
    const targets = Object.keys(this.workbook.options.sheets)
    const rawData = {a:inputVal};
    const formattedpayload = {
      schemaSlug: this.workbook.options.namespace + '/' + targets[0],
      rows: [{ row: { rawData, rowId: 1 }, info: [] }],
    } as IHookPayload
    const result = await this.workbook.handleLegacyDataHook(formattedpayload)

    expect(expectedMessage).toBeTruthy()
    expectedMessage && expect(result[0].info[0]).toMatchObject(expectedMessage)
  }

  public async testFullHooks(inputVal:string|undefined, outputVal:number|undefined|null): Promise<void> {
    await this.checkRowResult({rawData:{a:inputVal}, expectedOutput: {a:outputVal}});
  }

  public async testFull(inputVal:string|undefined, outputVal:number|undefined|null, message:string): Promise<void> {
    await this.checkRowResult({rawData:{a:inputVal},  expectedOutput: {a:outputVal}, message});
  }

}


// First sets of Workbook Tests
describe('Field Hook ->', () => {
  describe('onCast()', () => {
    test('correctly casts object to default number', async () => {
      const rawData = { firstNumber: { a: 'asdf' } }
      const expectedOutput = { firstNumber: 0 }

      const TestSchema = new WorkbookTester(
        {
          firstNumber: NumberField({
            ...BaseFieldArgs,
            onCast: (v) => {
              if (isNaN(Number(v))) {
                return 0
              }

              return Number(v)
            },
          }),
        },
        {}
      )

      await TestSchema.checkRowResult({ rawData, expectedOutput })
    })
    test('Test actual schema', async () => {
      const rawData = { firstNumber: { a: 'asdf' } }
      const expectedOutput = { firstNumber: 0 }

      const TestSchema = new WorkbookTester(
	CategoryAndBoolean,
      )

      await TestSchema.checkRowResult({ rawData, expectedOutput })
    })
  })
})
