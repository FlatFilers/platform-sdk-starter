const isNil = (val) => val === null || val === undefined || val === ""

const isNotNil = (val) => !isNil(val)

function checkMinimum(first, last, email) {
  if (isNotNil(first) && isNotNil(last) && isNotNil(email)) {
    return true
  } else {
    return false
  }
}

export function conditionalFormatting(record) {
    if (checkMinimum(record.get('Borrower First/Middle Name'), record.get('Borrower Last Name/Suffix'), record.get('Borr Email'))) {
        const addy = record.get('Subject Property Address')
        const zip = record.get('Subject Property Zip')
  
        if (isNil(addy) && isNil(zip)) {
          record.addWarning('Subject Property Address', 'Without a property address and zip code, this client will be added as a buyer. Include a property address and zip code if you\'d like this client to receive a homeowner report.')
          record.addWarning('Subject Property Zip', 'Without a property address and zip code, this client will be added as a buyer. Include a property address and zip code if you\'d like this client to receive a homeowner report.')
        } else if (isNotNil(addy) && isNil(zip)) {
          record.addError('Subject Property Zip', 'In order to successfully add this client as a homeowner, please include the 5 digit property zip code. If you\'d like to add this client as a buyer instead, delete the property address field.')
        } else if (isNil(addy) && isNotNil(zip)) {
          record.addError('Subject Property Address', 'Do you have a property address to go with this zip code? Include a property address and zip code if you\'d like this client to receive a homeowner report.')
        } else {
          if (isNotNil(record.get('Total Loan Amount'))) {
            if (isNil(record.get('Interest Rate'))) {
              record.addError('Interest Rate', 'In order to successfully include loan details, please include all highlighted loan fields. If you don\'t have all of the information, we will pull the loan information from public record and use historical averages to estimate the interest rate.')
            }

            if (isNil(record.get('Closing Date'))) {
              record.addError('Closing Date', 'In order to successfully include loan details, please include all highlighted loan fields. If you don\'t have all of the information, we will pull the loan information from public record and use historical averages to estimate the interest rate.')
            }

            if (isNil(record.get('Loan Purpose'))) {
              record.set('Loan Purpose', 'Purchase')
              record.addComment('Loan Purpose', 'Default value')
            }

            if (isNil(record.get('Loan Term'))) {
              record.set('Loan Term', 'thirty')
              record.addComment('Loan Term', 'Defualt value')
            }

            if (isNil(record.get('NMLS Loan Type'))) {
              record.set('NMLS Loan Type', 'ResidentialFirst')
              record.addComment('NMLS Loan Type', 'Default value')
            }
          }
        }
      }
}

export function coborrowerEmailCheck(record) {
  if (isNotNil(record.get('Co-Borrower First/Middle Name')) && isNotNil(record.get('Co-Borrower Last Name/Suffix'))) {
    if (isNil(record.get('Co-Borr Email'))) {
      record.addWarning('Co-Borr Email', 'Coborrowers must have a unique email address to be added to the system along with the borrower.')
    }
  }
}

export function highlyEncouraged(record) {
    const FIELDS = {
      borrower_phone: 'Borr Cell Phone',
      borrower_dob: 'Borr DOB',
      co_borrower_phone: 'Co-Borr Cell Phone',
      co_borrower_dob: 'Co-Borr DOB',
      home_purchase_price: 'Subject Property Purchase Price',
      home_purchase_date: 'Subject Property Purchase Date',
      home_appraised_value: 'Subject Property Appraised Value',
      loan_mortgage_ins_premium: 'Mortgage Insurance Premium',
      loan_first_payment_due_date: 'First Payment Due Date',
      loan_number: 'Loan Number',
    }

    Object.keys(FIELDS).forEach((field) => {
      if (isNil(record.get(FIELDS[field]))) {
        record.addWarning(FIELDS[field], 'Highly Encouraged.')
      }
    })
}

export function miscellaneousPhoneRemover(record) {
  const FIELDS = {
    borrowerPhone: 'Borr Cell Phone',
    coBorrowerFirstName: 'Co-Borr Cell Phone'
  }

  Object.keys(FIELDS).forEach((field) => {
    const value = record.get(FIELDS[field])
    const na_regex = /^[\)\(\*\s-(N/?A)]+$/g
    const phone_validation_regex = /^(\+?\d{1,2})?\s?([-.\s\(])?\d{3}\)?([-.\s\)])?\d{3}[-.\s]?\d{4}$/g
    if (isNotNil(value)) {
      if (na_regex.test(value) || !phone_validation_regex.test(value)) {
        record.set(FIELDS[field], '')
      }
    }
  })  
}