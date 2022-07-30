const dfns = require('date-fns');
import countries from './countries.js'

/**
 * Helper function to determine if a value is null or undefined.
 * Useful in if/else statments or ternaries.
 *
 * @param {*} val - Any object/value
 */
export const isNil = (val) => val === null || val === undefined || val === "";

/**
 * Helper function to determine if a value is NOT null or undefined.
 * Useful in if/else statments or ternaries.
 *
 * @param {*} val - Any object/value
 */
export const isNotNil = (val) => !isNil(val);

export function splitNames(record) {
    const firstName = record.get('firstName')
    const lastName = record.get('lastName')                
    if (isNotNil(firstName) && isNil(lastName)) {
        if (firstName.includes(" ")) {
            const parts = firstName.split(" ");
            record
                .set("firstName", parts[0])
                .addComment("firstName", "Full name was split")
                .set("lastName", parts.slice(1, parts.length).join(" ").trim())
                .addComment("lastName", "Full name was split");
        }
    }
}

export function emailOrPhoneRequired(record) {
    const email = record.get('email')
    const phone = record.get('phone')

    if (isNil(email) && isNil(phone)) {
        record
            .addWarning('email', 'Must provide either phone or email')
            .addWarning('phone', 'Must provide either phone or email');
    }
}

export function dateFormatter(record) {
    const date = record.get('createDate')
    if (isNotNil(date)) {
        if (Date.parse(date)) {
            const thisDate = dfns.format(new Date(date), "yyyy-MM-dd");
            const realDate = dfns.parseISO(thisDate);
        if (dfns.isDate(realDate)) {
            record
                .set('createDate', thisDate)
                .addComment('createDate', 'Automatically formatted')
        } else {
            record.addError('createDate', 'Invalid Date')
        }
        }
    }
}

export function countryAndZipCodeFormatter(record) {
    const countryName = record.get('country')
    const postalCode = record.get('postalCode')

    if (isNotNil(countryName)) {
    const countryCode = countries.get(countryName.toLowerCase());

    if (isNotNil(countryCode)) {
        record
        .set("country", countryCode)
        .addComment("country", "Country was automatically formatted");
    }
    }

    if (
    record.get("country") === "US" &&
    isNotNil(postalCode) &&
    postalCode.length < 5
    ) {
    const padded = postalCode.padStart(5, "0");

    record
        .set("postalCode", padded)
        .addComment("postalCode", "Zipcode was padded with zeroes");
    }

}