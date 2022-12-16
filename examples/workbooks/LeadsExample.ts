import * as FF from "@flatfile/configure";
import { FlatfileRecord } from "@flatfile/hooks";

/*
 * Types
 */

type Nil = null | undefined;

type Falsy = null | undefined | false | "" | 0;

/*
 * Guards
 */

/**
 * Helper function to determine if a value is null.
 * Useful in if/else statements or ternaries.
 *
 * @param {*} x - Any object/value
 *
 * @example
 * if (isNull(x)) {
 *   ...
 * } else {
 *   ...
 * }
 */
export const isNull = (x: unknown): x is null => x === null;

/**
 * Helper function to determine if a value is undefined.
 * Useful in if/else statements or ternaries.
 *
 * @param {*} x - Any object/value
 *
 * @example
 * if (isUndefined(x)) {
 *   ...
 * } else {
 *   ...
 * }
 */
export const isUndefined = (x: unknown): x is undefined => x === undefined;

/**
 * Helper function to determine if a value is null, undefined or an empty string.
 * Useful in if/else statements or ternaries.
 *
 * @param {*} x - Any object/value
 *
 * @example
 * if (isNil(x)) {
 *   ...
 * } else {
 *   ...
 * }
 */
export const isNil = (x: unknown): x is Nil =>
    isNull(x) || isUndefined(x) || (isString(x) && x === "");

/**
 * Helper function to determine if a value is NOT null or undefined.
 * Useful in if/else statements or ternaries.
 *
 * @param {*} x - Any object/value
 *
 * @example
 * if (isNotNil(x)) {
 *   ...
 * } else {
 *   ...
 * }
 */
export const isNotNil = <T>(x: T | Nil): x is T => !isNil(x);

/**
 * Helper function to determine if a value is falsy.
 * Useful in if/else statements or ternaries.
 *
 * @param {*} x - Any object/value
 *
 * @example
 * if (isFalsy(x)) {
 *   ...
 * } else {
 *   ...
 * }
 */
export const isFalsy = (x: unknown): x is Falsy =>
    x === 0 || Number.isNaN(x) || x === false || isNil(x);

/**
 * Helper function to determine if a value is truthy.
 * Useful in if/else statements or ternaries.
 *
 * @param {*} x - Any object/value
 *
 * @example
 * if (isTruthy(x)) {
 *   ...
 * } else {
 *   ...
 * }
 */
export const isTruthy = (x: unknown): x is true => !isFalsy(x);

/**
 * Helper function to determine if a value is a string.
 * Useful in if/else statements or ternaries.
 *
 * @param {*} x - Any object/value
 *
 * @example
 * if (isString(x)) {
 *   ...
 * } else {
 *   ...
 * }
 */
export const isString = (x: unknown): x is string => typeof x === "string";

/**
 * Helper function to determine if a value is a number.
 * Useful in if/else statements or ternaries.
 *
 * @param {*} x - Any object/value
 *
 * @example
 * if (isNumber(x)) {
 *   ...
 * } else {
 *   ...
 * }
 */
export const isNumber = (x: unknown): x is number => typeof x === "number";

/*
 * Field Validations
 */

const validateEmail = (value: string) => (): void | FF.Message => {
    if (!value.includes("@")) {
        return new FF.Message("Invalid email address.", "warn", "validate");
    }

    return;
};

/*
 * Record Hooks
 */

const emailOrPhoneRequired = (record: FlatfileRecord): FlatfileRecord => {
    const email = record.get("email");
    const phone = record.get("phone");

    if (isNil(email) && isNil(phone)) {
        record.addWarning(["email", "phone"], "Must have either phone or email.");
    }

    return record;
};

const zipCodeZeroPadding = (record: FlatfileRecord): FlatfileRecord => {
    const postal_code = record.get("postal_code");
    const country = record.get("country");

    if (isNotNil(country) && isNotNil(postal_code)) {
        if (isString(country) && isString(postal_code)) {
            if (country === "US" && postal_code.length < 5) {
                const padded = postal_code.padStart(5, "0");

                record
                    .set("postal_code", padded)
                    .addInfo("postal_code", "Padded with zeros.");
            }
        }
    }

    return record;
};

/*
 * Helpers
 */

/**
 * Easily pass the result of one function to the input of another.
 *
 * @example
 * pipe(fn1, fn2, ...);
 */
const pipe = (...fns: Array<any>) => fns.reduce((acc, fn) => fn(acc));

/**
 * Converts `String.prototype.toLowerCase()` to a normal fn so it can be used with `pipe`.
 *
 * @param {string} value - value to apply operation.
 *
 * @example
 * pipe(value, toLowerCase);
 */
const toLowerCase = (value: string): string => value.toLowerCase();

/**
 * Converts `String.prototype.trim()` to a normal fn so it can be used with `pipe`.
 *
 * @param {string} value - value to apply operation.
 *
 * @example
 * pipe(value, trim);
 */
const trim = (value: string): string => value.trim();

/**
 * Allows us to combine multiple validations in a quick and easy way.
 *
 * @example
 * runValidations(fn1, fn2, fn3, ...);
 */
const runValidations = (...fns: Array<any>): Array<FF.Message> => {
    return fns.reduce((acc, fn) => [...acc, fn()], []).filter(isNotNil);
};

/**
 * Allows us to sequence multiple RecordHooks _synchronously_ on a `FlatfileRecord`.
 *
 * @example
 * runRecordHooks(fn1, fn2, fn3, ...)(record)
 */
export const runRecordHooks =
    (...fns: Array<(x: FlatfileRecord) => void>) =>
        (x: FlatfileRecord) =>
            fns.map((f) => f(x));


/*
 * Main
 */

const LeadsSheet = new FF.Sheet(
    "Leads",
    {
        first_name: FF.TextField({
            label: "First Name",
            description: "Lead's first name.",
        }),
        last_name: FF.TextField({
            label: "Last Name",
            description: "Lead's last name.",
            required: true,
        }),
        email: FF.TextField({
            label: "Email Address",
            description: "Lead's email.",
            unique: true,
            compute: (value) => {
                return pipe(value, trim, toLowerCase);
            },
            validate: (value) => {
                const ensureValidEmail = validateEmail(value);

                return runValidations(ensureValidEmail);
            },
        }),
        phone: FF.TextField({
            label: "Phone Number",
            description: "Lead's phone.",
        }),
        date: FF.DateField({
            label: "Date",
            description: "Date goes here.",
        }),
        country: FF.TextField({
            label: "Country",
            description: "Country goes here",
            cast: FF.CountryCast("iso-2"),
        }),
        postal_code: FF.TextField({
            label: "Postal Code",
            description: "Postal code goes here",
        }),
        opt_in: FF.BooleanField({
            label: "Opt In",
            description: "Opt in goes here",
        }),
        deal_status: FF.OptionField({
            label: "Deal Status",
            description: "Deal status goes here",
            options: {
                prospecting: "Prospecting",
                discovery: "Discovery",
                proposal: "Proposal",
                negotiation: "Negotiation",
                closed_won: "Closed Won",
                closed_lost: "Closed Lost",
            },
        }),
    },
    {
        allowCustomFields: false,
        recordCompute: (record, _session, _logger) => {
            return runRecordHooks(emailOrPhoneRequired, zipCodeZeroPadding)(record);
        },
    },
);

const LeadsPortal = new FF.Portal({
    name: "Leads SDK example",
    sheet: "LeadsSheet",
});

const workbook = new FF.Workbook({
    name: "Workbook - Leads SDK example",
    namespace: "Examples",
    portals: [LeadsPortal],
    sheets: {
        LeadsSheet,
    },
});

export default workbook;
