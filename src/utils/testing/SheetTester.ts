import _ from 'lodash'
import { IRecordInfo, TRecordData, TPrimitive,  FlatfileRecords, FlatfileSession, IPayload } from '@flatfile/hooks'
import { Workbook } from '@flatfile/configure'

export class SheetTester {
  public workbook
  public sheetName
  private testSession: IPayload
  constructor(
    public readonly passedWorkbook: Workbook,
    public readonly passedSheetName: string
  ) {
    this.sheetName = `${passedWorkbook.options.namespace}/${passedSheetName}`
    this.workbook = passedWorkbook
    this.testSession = {
      schemaSlug: '',
      workspaceId: '',
      workbookId: '',
      schemaId: 1,
      uploads: [''],
      endUser: '',
      envSignature: '',
      rows: [],
    }
  }

  private async transformRecord(recordBatch: {}) {
    const session = new FlatfileSession({
      ...this.testSession,
      schemaSlug: this.sheetName,
    })

    const iRaw = [{ rawData: recordBatch, rowId: 1 }]

    const inputRecords = new FlatfileRecords(iRaw)

    await this.workbook.processRecords(inputRecords, session)
    return inputRecords.records[0]?.toJSON()
  }

  private async transformRecords(recordBatch: Record<string, any>[]) {
    const session = new FlatfileSession({
      ...this.testSession,
      schemaSlug: this.sheetName,
    })
    const iRaw = recordBatch.map((rawData, index) => {
      return { rawData, rowId: index }
    })

    const inputRecords = new FlatfileRecords(iRaw)

    await this.workbook.processRecords(inputRecords, session)
    return inputRecords
  }

  public async transformField(
    pkey: string,
    value: any,
    other = {},
    errOn = 'error'
  ) {
    const { fields } = this.workbook.options.sheets[this.passedSheetName]

    const labelKeyMap: Record<string, any> = Object.keys(fields)
      .map((k) => [fields[k].options.label, k])
      .reduce((acc, [l, k]) => {
        const label = l === '' ? k : l
        return { ...acc, [label]: k }
      }, {})

    const defaultCastMap = Object.keys(fields)
      .map((k) => [fields[k].options.default, k])
      .reduce((acc, [l, k]) => {
        return { ...acc, [k]: l }
      }, {})

    const transformRecord = async (override: Record<string, any>) =>
      this.transformRecord({
        ...defaultCastMap,
        ...override,
      })

    const transform = async (pkey: string, value: any) => {
      const key = labelKeyMap[pkey] ?? pkey
      const out = await transformRecord({ [key]: value, ...other })

      const firstErr = out.info.find(
        (m) => m.field === key && m.level === errOn
      )
      if (firstErr) {
        throw firstErr.message
      }
      return out.row.rawData[key]
    }

    return transform(pkey, value)
  }

  public async testRecord(record: {}) {
    const transformedRecords = await this.transformRecords([record])
    return transformedRecords.records[0].value
  }

  public async testRecords(recordBatch: Record<string, any>[]) {
    const transformedRecords = await this.transformRecords(recordBatch)

    return transformedRecords.records.map((r) => r.value)
  }
  public async testMessage(record: {}) {
    const transformedRecords = await this.transformRecords([record])
    return transformedRecords.records.map((r) => r.toJSON().info)[0]
  }
  public async testMessages(recordBatch: Record<string, any>[]) {
    const transformedRecords = await this.transformRecords(recordBatch)
    return transformedRecords.records.map((r) => r.toJSON().info)
  }

}

export type InfoObj = IRecordInfo<TRecordData<TPrimitive>, string | number>

export const removeUndefineds = (obj:Record<string, any>) => _.pickBy(obj, _.identity)
export const matchMessages = (messages:InfoObj[], field?:string, message?:string, level?:string): false| any[] => {

  const results = _.filter(messages, removeUndefineds({field,message,level}))
  if (results.length > 0) {
    return results
  }
  return false
}

export const matchSingleMessage = (
  messages:InfoObj[], field?:string, message?:string, level?:string): false| any => {
  const results = matchMessages(messages, field, message, level)
  if (results === false) {
    return false
  }
  if (results.length === 1) {
    return results[0]
  }
  if (results.length > 1) {
    throw new Error("more than one message returned")
  }
  if (results.length === 0) {
    //unreachable
    return false
  }
  //unreachable
  return false
}

//use the match functions like
//     const res = await testSheet.testMessage(inputRow)
//    expect(matchSingleMessage(res, 'numField', 'more than 5', 'error')).toBeTruthy()
