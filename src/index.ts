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
  import { instrumentTypeOptions } from '../src/common/types'
  import { SetValWhen, RCChain, createReferenceId, validateRegex, RequiredWhen, ValidateNumberValueRange  } from '../src/common/common'
  import { bicRegex } from '../src/common/regex'
  
  
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
  const FinancialInstitutions = new Sheet(
    'Financial Institutions',
    {
      referenceId: TextField({
        label: 'Reference Id',
        required: false,
        unique: true,
        primary: true,
        description: 'Reference Id of the Finacial Institution',
        annotations: {
          default: false,
                },
        stageVisibility: {
          mapping: false,
          review: true,
          export: true
        }
      }),
  
      name: TextField({
        label: 'Name',
        description: 'The name of the Financial Institution',
        required: true,
        unique: true,
        primary: false,
        annotations: {
          default: false,
                },
        stageVisibility: {
          mapping: true,
          review: true,
          export: true
        }
      }),
  
      shortCode: TextField({
        label: 'Short Code',
        description:
          'A short code representing the Financial Institution. *Must be unique',
        required: true,
        unique: true,
        primary: false,
        annotations: {
          default: false,
                },
        stageVisibility: {
          mapping: true,
          review: true,
          export: true
        }
      }),
  
      institutionType: OptionField({
        label: 'Institution Type',
        description: 'The type of Financial Institution defined by the firm',
        required: false,
        options: {
          'CUSTODIAN': 'CUSTODIAN',
          'EXECUTING-BROKER': 'EXECUTING-BROKER',
          'PRIME-BROKER': 'PRIME-BROKER',
        },
        unique: false,
        primary: false,
        annotations: {
          default: false,
                },
        stageVisibility: {
          mapping: true,
          review: true,
          export: true
        }
      }),
  
      partytype: OptionField({
        label: 'Party Type',
        options: {
          'ATS': 'ATS',
          'EXECUTING-BROKER': 'EXECUTING-BROKER',
          'EMS': 'EMS',
        },
        description:
          'Party type of the financial institution',
        required: false,
        unique: false,
        primary: false,
        annotations: {
          default: false,
                },
        stageVisibility: {
          mapping: true,
          review: true,
          export: true
        }
      }),

      executionmethod: OptionField({
        label: 'Execution Method',
        description: 'The execution method of the broker',
        options: {
          'FILE': 'FILE',
          'FIX': 'FIX',
          'MANUAL': 'MANUAL',
        },
        required: false,
        unique: false,
        primary: false,
        annotations: {
          default: false,
                },
        stageVisibility: {
          mapping: true,
          review: true,
          export: true
        }
      }),
  
      fixconnectiontype: OptionField({
        label: 'Fix Connection Type',
        description: '',
        options: {
          'CONDITIONAL-ORDERS': 'CONDITIONAL-ORDERS',
          'HIGH-TOUCH': 'HIGH-TOUCH',
          'LOW-TOUCH': 'LOW-TOUCH',
          'STAGING': 'STAGING',
        },
        required: false,
        unique: false,
        primary: false,
        annotations: {
          default: false,
                },
        stageVisibility: {
          mapping: true,
          review: true,
          export: true
        }
      }),
  
      crossingnetwork: OptionField({
        label: 'Crossing Network',
        description: 'The dark pool that this financial institution represents',
        options: {
          'BIDS': 'BIDS',
          'BLOCKCROSS': 'BLOCKCROSS',
          'LIQUIDNET': 'LIQUIDNET',
          'LUMINX': 'LUMINX',
          'POSIT': 'POSIT',
        },
        required: false,
        unique: false,
        primary: false,
        annotations: {
          default: false,
                },
        stageVisibility: {
          mapping: true,
          review: true,
          export: true
        }
      }),
  
      fixcode: TextField({
        label: 'Fix Code',
        description: 'Provided by Itiviti',
        required: false,
        unique: false,
        primary: false,
        annotations: {
          default: false,
                },
        stageVisibility: {
          mapping: true,
          review: true,
          export: true
        }
      }),
  
      instrumenttype: OptionField({
        label: 'Instrument Type',
        description:
          'Must be a valid aggregate or RefID from FetchInstrumentTypes',
        options: {...instrumentTypeOptions},
        required: false,
        unique: false,
        primary: false,
        annotations: {
          default: false,
                },
        stageVisibility: {
          mapping: true,
          review: true,
          export: true
        }
      }),
  
      region: OptionField({
        label: 'Region',
        description: 'Region the broker trades are in',
        options: {
          'AMERICAS': 'Americas',
          'ASIA': 'Asia',
          'AFRICA': 'Africa',
          'OCEANIA': 'Oceania',
          'EUROPE': 'Europe',
        },
        required: false,
        unique: false,
        primary: false,
        annotations: {
          default: false,
                },
        stageVisibility: {
          mapping: true,
          review: true,
          export: true
        }
      }),

      dtcids: NumberField({
        label: 'DTC IDs',
        description: 'DTC Identifier',
        required: false,
        unique: false,
        primary: false,
        annotations: {
          default: false,
                },
        stageVisibility: {
          mapping: true,
          review: true,
          export: true
        },
        validate: (v: number) => { return ValidateNumberValueRange(v, 0, 99999999) }
      }),
  
      posttrademethod: OptionField({
        label: 'Post Trade Method',
        options: {
          CTM: 'CTM',
          MANUAL: 'Manual',
        },
        required: false,
        unique: false,
        primary: false,
        annotations: {
          default: false,
                },
        stageVisibility: {
          mapping: true,
          review: true,
          export: true
        }
      }),
  
      bic: TextField({
        label: 'BIC',
        description: 'The bank identification code. Must be alphanumeric',
        required: false,
        unique: false,
        primary: false,
        annotations: {
          default: false,
                },
        stageVisibility: {
          mapping: true,
          review: true,
          export: true
        },
        validate: (v: string) => { return validateRegex(v, bicRegex, 'Invalid BIC value') }
      }),
    },
    {
      recordCompute:  (record, _session, _logger) => {
        createReferenceId("FINANCIAL_INSTITUTION", 'name', 'referenceId', record)
        SetValWhen('institutionType', ['CUSTODIAN', 'PRIME-BROKER'], 'executionmethod', null)(record)  
        SetValWhen('institutionType', ['CUSTODIAN', 'PRIME-BROKER'], 'instrumenttype', null)(record)
        SetValWhen('institutionType', ['CUSTODIAN', 'PRIME-BROKER'], 'partytype', null)(record)
        SetValWhen('fixconnectiontype', ['HIGH-TOUCH', 'LOW-TOUCH', 'STAGING'], 'crossingnetwork', null)(record)
        SetValWhen('executionmethod', ['FILE','MANUAL'], 'fixconnectiontype', null)(record)
        RequiredWhen('institutionType', 'EXECUTING-BROKER', 'partytype')(record)
        RequiredWhen('institutionType', 'EXECUTING-BROKER', 'shortCode')(record)
        RequiredWhen('institutionType', 'EXECUTING-BROKER', 'instrumenttype')(record)
        RequiredWhen('institutionType', 'EXECUTING-BROKER', 'executionmethod')(record)
        RequiredWhen('institutionType', 'EXECUTING-BROKER', 'posttrademethod')(record)
        RequiredWhen('executionmethod', 'FIX', 'fixconnectiontype')(record)
        RequiredWhen('executionmethod', 'FIX', 'fixcode')(record)
        RequiredWhen('fixconnectiontype', 'CONDITIONAL-ORDERS', 'crossingnetwork')(record)
        
      }         
    }
  )
  
  
  // const BasicSheetPortal = new Portal({
  //   name: 'BasicSheetPortal',
  //   sheet: 'BasicSheet'
  // })
  
  export default new SpaceConfig({
    name: 'Ridgeline Testing 3 Sheets',
    workbookConfigs: {
      'basic':new Workbook({
        name: 'Ridgeline Test 3 Sheets',
        namespace: 'Ridgeline 3 Sheets',
        sheets: {
          Models,
          AssetClass,
          FinancialInstitutions,
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