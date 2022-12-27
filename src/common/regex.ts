

const validDate = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/;
const regex_ddmmyyyy = /^(0[1-9]|[1-2][0-9]|31(?!(?:0[2469]|11))|30(?!02))(0[1-9]|1[0-2])([12]\d{3})$/; //DDMMYYYY

const ticker = /^[A-Za-z]*$/;
const cusip = /^[a-zA-Z0-9]{9}$/;
const regex_yyyy_mm_dd = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/ //YYYY-MM-DD
const regex_mm_dd_yyyy =
  /(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d/ //mm/dd/yyyy
const shortName = /^[[A-Z0-9]{1,12}$/
const firstNameLastName = /^[a-zA-Z]+ [A-Za-z-]+$/
const firstName = /^[a-zA-Z-]+$/
const isin = new RegExp('^[a-zA-Z0-9]{12}$', '')
const sedol = new RegExp('^[a-zA-Z0-9]{7}$', '')
const figi = new RegExp('^[a-zA-Z0-9]{12}$', '')
const osi = new RegExp('^[a-zA-Z0-9]{21}$', '')
const calendar = new RegExp('^[a-zA-Z\\s]*$', '')

const bicRegex = new RegExp('^[A-Za-z0-9]*$', '')
const delisted = /delisted/i


export { validDate, ticker, cusip, isin, sedol, figi, osi, regex_ddmmyyyy,calendar, bicRegex, shortName, firstNameLastName, regex_yyyy_mm_dd, firstName, delisted};