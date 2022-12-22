// workbook javascript example with a simple sheet (no sheet options defined)

import {
  BooleanField,
  DateField,
  NumberField,
  OptionField,
  // Portal,
  Sheet,
  SpaceConfig,
  TextField,
  Workbook,
} from '@flatfile/configure'
import { createReferenceId } from '../src/common/common'


const Models = new Sheet(
  'Models',
  {
      referenceId: TextField({
          label: 'Reference Id',
          description: 'Reference Id of Model',
          required: true,
          unique: false,
          annotations: {
              default: false,
          },
          //stageVisibility: {
             // mapping: false,
              //review: true,
              //export: true
          //}
      }),

      name: TextField({
          label: 'Name',
          description: 'Name of Model',
          required: true,
          unique: true,
          annotations: {
              default: false,
          },
          // stageVisibility: {
          //     mapping: true,
          //     review: true,
          //     export: true
          // }
      }),

      targetStyle: OptionField({
          label: 'Target Style',
          description: 'must be "PERCENTAGE"',
          required: true,
          unique: false,
          options: {
              PERCENTAGE: 'PERCENTAGE',
          },
          annotations: {
              default: false,
          },
          //stageVisibility: {
            //  mapping: true,
              //review: true,
              //export: true
          //}
      }),

      valuation: OptionField({
          label: 'Valuation',
          required: true,
          description: 'Valuation of Model',
          unique: false,
          options: {
              STATIC: 'STATIC',
              DYNAMIC: 'DYNAMIC',
          },
          annotations: {
              default: false,
          },
          //stageVisibility: {
            //  mapping: true,
              //review: true,
              //export: true
          //}
      }),

      toleranceType: OptionField({
          label: 'Tolerance Type',
          required: true,
          unique: false,
          options: {
              FLOATING: 'FLOATING',
          },
          annotations: {
              default: false,
          },
          // stageVisibility: {
          //     mapping: true,
          //     review: true,
          //     export: true
          // }
      }),
  },
  {
      recordCompute: (record, _session, _logger) => {
          createReferenceId("INDEX", 'name', 'referenceId', record)
      },
  },
)

const AssetClass = new Sheet(
  'Asset Class',
  {
    assetClassReferenceId: TextField({
      label: 'Asset Class Reference Id',
      required: false,
      unique: true,
      description: 'Reference Id of the Asset Class',
      annotations: {
        default: false,
              },
      // stageVisibility: {
      //   mapping: false,
      //   review: true,
      //   export: true
      // }
    }),
    name: TextField({
      label: 'Asset Class Name',
      required: true,
      unique: true,
      description: 'Name of the Asset Class',
      annotations: {
        default: false,
              },
      // stageVisibility: {
      //   mapping: true,
      //   review: true,
      //   export: true
      // }
    }),
    legacyCodeAssetClass: TextField({
      label: 'Asset Class Legacy Code',
      required: true,
      unique: true,
      description: 'Legacy Short code for the asset class',
      annotations: {
        default: false,
              },
      // stageVisibility: {
      //   mapping: true,
      //   review: true,
      //   export: false
      // }
    })
  },
  {
    previewFieldKey: "assetClassReferenceId",
    recordCompute: (record, _session, _logger) => {
      createReferenceId("ASSET_CLASS", 'name', 'assetClassReferenceId', record)
    },
  },
)


// const BasicSheetPortal = new Portal({
//   name: 'BasicSheetPortal',
//   sheet: 'BasicSheet'
// })

export default new SpaceConfig({
  name: 'Ridgeline Testing',
  workbookConfigs: {
    'basic':new Workbook({
      name: 'RidgelineTest',
      namespace: 'Ridgeline',
      sheets: {
        Models,
        AssetClass,
      },
      // portals: [BasicSheetPortal],
    })
  }
}
)

// export default new Workbook({
//   name: 'BasicSheetWorkbook',
//   namespace: 'basic',
//   sheets: {
//     BasicSheet,
//   },
//   // portals: [BasicSheetPortal],
// })
