import _ from 'lodash'

import { FlatfileRecords, FlatfileSession, IPayload } from '@flatfile/hooks'
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

  public async testRecord(recordBatch: {}) {
    const transformedRecords = await this.transformRecords([recordBatch])
    return transformedRecords.records[0].value
  }

  public async testRecords(recordBatch: any[]) {
    const transformedRecords = await this.transformRecords(recordBatch)

    return transformedRecords.records.map((r) => r.value)
  }
}
