import * as FF from "@flatfile/configure";
import { FlatfileRecord } from "@flatfile/hooks";
import { v4 as uuidv4 } from "uuid";

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

const validateMaxLength =
    (len: number) => (value: string) => (): void | FF.Message => {
        if (value.length > len) {
            return new FF.Message(
                `Cannot be more than ${len} characters.`,
                "warn",
                "validate",
            );
        }

        return;
    };

const validateWholeNumber = (value: number) => (): void | FF.Message => {
    if (value % 1 !== 0) {
        return new FF.Message("Whole numbers only.", "error", "validate");
    }

    return;
};

const validateRangeInclusive =
    (min: number, max: number) => (value: number) => (): void | FF.Message => {
        if (isFalsy(value >= min && value <= max)) {
            return new FF.Message(
                `Value must be between ${min} and ${max}.`,
                "error",
                "validate",
            );
        }

        return;
    };

const validateRegex =
    (regex: RegExp) => (value: string) => (): void | FF.Message => {
        if (isFalsy(regex.test(value))) {
            return new FF.Message(
                "Value does not meet required format.",
                "warn",
                "validate",
            );
        }

        return;
    };

const validatePositive = (value: number) => (): void | FF.Message => {
    if (value < 0.01) {
        return new FF.Message(
            "Value must be at least 1 cent.",
            "error",
            "validate",
        );
    }

    return;
};

const validateUpcOrEan = (value: string) => (): void | FF.Message => {
    if (isFalsy(/\d{12,13}/g.test(value))) {
        return new FF.Message("Must be 12 or 13 digits.", "error", "validate");
    }

    // any 12-digit UPC can be converted into a 13-digit EAN
    const padded: string = value.padStart(13, "0");

    const allDigits: ReadonlyArray<number> = padded.split("").map(Number);
    const checksumDigit: number = (allDigits as Array<number>).pop() ?? 0;

    const evenDigits: ReadonlyArray<number> = allDigits.filter(
        (_value, index) => index % 2 === 0,
    );
    const oddDigits: ReadonlyArray<number> = allDigits.filter(
        (_value, index) => index % 2 !== 0,
    );
    const sumEvens: number = evenDigits.reduce((acc, digit) => acc + digit, 0);
    const sumOdds: number = oddDigits.reduce((acc, digit) => acc + digit, 0);
    const remainder: number = (sumOdds * 3 + sumEvens) % 10;

    if (10 - remainder !== checksumDigit) {
        return new FF.Message("Invalid UPC or EAN.", "error", "validate");
    }

    return;
};

/*
 * Record Hooks
 */

const defaultUUID =
    (key: string) =>
        (record: FlatfileRecord): FlatfileRecord => {
            const value = record.get(key);

            if (isNil(value)) {
                record
                    .set(key, uuidv4())
                    .addComment(key, "Value was autogenerated for you.");
            }

            return record;
        };

/*
 * Helpers
 */

/**
 * Easily pass the result of one function as the input of another.
 *
 * @example
 * pipe(fn1, fn2, ...);
 */
const pipe = (...fns: Array<any>) => fns.reduce((acc, fn) => fn(acc));

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

const ReviewsSheet = new FF.Sheet(
    "Reviews",
    {
        review_id: FF.TextField({
            label: "Review Id",
            description: "The unique ID of the review.",
            unique: true,
            validate: (value) => {
                const ensureMaxLength = validateMaxLength(50)(value);
                const ensureValidChars = validateRegex(/[\w-_]+/g)(value);

                return runValidations(ensureMaxLength, ensureValidChars);
            },
        }),
        handle: FF.TextField({
            label: "Display Name",
            description: "The user's nickname on the review.",
            default: "Anonymous",
            compute: (value) => pipe(value, trim),
            validate: (value) => {
                const ensureMaxLength = validateMaxLength(40)(value);

                return runValidations(ensureMaxLength);
            },
        }),
        title: FF.TextField({
            label: "Title",
            description: "The user-entered review title.",
            required: true,
            compute: (value) => pipe(value, trim),
            validate: (value) => {
                const ensureMaxLength = validateMaxLength(60)(value);

                return runValidations(ensureMaxLength);
            },
        }),
        date: FF.DateField({
            label: "Date",
            description: "The date the user wrote the review.",
            required: true,
        }),
        location: FF.TextField({
            label: "Location",
            description: "The physical location of the reviewer.",
            default: "Undisclosed",
            annotations: {
                default: true,
            },
            compute: (value) => pipe(value, trim),
            validate: (value) => {
                const ensureMaxLength = validateMaxLength(40)(value);

                return runValidations(ensureMaxLength);
            },
        }),
        body: FF.TextField({
            label: "Body",
            description: "The main body or comments on the review.",
            required: true,
            compute: (value) => pipe(value, trim),
        }),
        rating: FF.NumberField({
            label: "Rating",
            description: "The star rating value.",
            required: true,
            validate: (value) => {
                const ensureWholeNumber = validateWholeNumber(value);
                const ensureBetween1and5 = validateRangeInclusive(1, 5)(value);

                return runValidations(ensureWholeNumber, ensureBetween1and5);
            },
        }),
        is_buyer_verified: FF.BooleanField({
            label: "Verified Buyer?",
            description: "States whether or not the user is a verified buyer.",
            default: false,
            annotations: {
                default: true,
            },
        }),
        status: FF.OptionField({
            label: "Status",
            description: "Valid status of the review.",
            required: true,
            options: {
                approved: "Approved",
                pending: "Pending",
                rejected: "Rejected",
            },
        }),
    },
    {
        allowCustomFields: true,
        readOnly: true,
        recordCompute: (record, _session, _logger) => {
            const defaultReviewId = defaultUUID("review_id");

            return runRecordHooks(defaultReviewId)(record);
        },
    },
);

const ProductsSheet = new FF.Sheet(
    "Products",
    {
        product_id: FF.TextField({
            label: "Product Id",
            unique: true,
            compute: (value) => pipe(value, trim),
            validate: (value) => {
                const ensureMaxLength = validateMaxLength(50)(value);
                const ensureValidChars = validateRegex(/[\w-_]+/g)(value);

                return runValidations(ensureMaxLength, ensureValidChars);
            },
        }),
        product_url: FF.TextField({
            label: "Product URL",
            required: true,
            compute: (value) => pipe(value, trim),
            validate: (value) => {
                const ensureMaxLength = validateMaxLength(650)(value);
                const ensureNoSpaces = validateRegex(/^\S+$/g)(value);

                return runValidations(ensureMaxLength, ensureNoSpaces);
            },
        }),
        name: FF.TextField({
            label: "Name",
            required: true,
            compute: (value) => pipe(value, trim),
            validate: (value) => {
                const ensureMaxLength = validateMaxLength(500)(value);

                return runValidations(ensureMaxLength);
            },
        }),
        image_url: FF.TextField({
            label: "Image URL",
            required: true,
            compute: (value) => pipe(value, trim),
            validate: (value) => {
                const ensureMaxLength = validateMaxLength(650)(value);
                const ensureNoSpaces = validateRegex(/^\S+$/g)(value);

                return runValidations(ensureMaxLength, ensureNoSpaces);
            },
        }),
        description: FF.TextField({
            label: "Description",
            required: true,
            compute: (value) => pipe(value, trim),
            validate: (value) => {
                const ensureMaxLength = validateMaxLength(10000)(value);

                return runValidations(ensureMaxLength);
            },
        }),
        category: FF.TextField({
            label: "Category",
            description: "The product's inventory classification.",
            required: true,
            compute: (value) => pipe(value, trim),
            validate: (value) => {
                const ensureMaxLength = validateMaxLength(300)(value);

                return runValidations(ensureMaxLength);
            },
        }),
        brand: FF.TextField({
            label: "Brand",
            required: true,
            compute: (value) => pipe(value, trim),
            validate: (value) => {
                const ensureMaxLength = validateMaxLength(300)(value);

                return runValidations(ensureMaxLength);
            },
        }),
        upc_or_ean: FF.TextField({
            label: "UPC or EAN",
            description: "The 12-digit UPC or 13-digit EAN.",
            required: true,
            validate: (value) => {
                const ensureUpcOrEan = validateUpcOrEan(value);

                return runValidations(ensureUpcOrEan);
            },
        }),
        in_stock: FF.BooleanField({
            label: "In Stock?",
        }),
        price: FF.NumberField({
            label: "Price",
            validate: (value) => {
                const ensureIsPositive = validatePositive(value);

                return runValidations(ensureIsPositive);
            },
        }),
    },
    {
        allowCustomFields: true,
        recordCompute: (record, _session, _logger) => {
            const defaultProductId = defaultUUID("product_id");

            return runRecordHooks(defaultProductId)(record);
        },
    },
);

const ProductsPortal = new FF.Portal({
    name: "Products",
    sheet: "ProductsSheet",
});

const ReviewsPortal = new FF.Portal({
    name: "Reviews",
    sheet: "ReviewsSheet",
});

const workbook = new FF.Workbook({
    name: "Workbook - Products & Reviews SDK example",
    namespace: "Examples",
    portals: [ReviewsPortal, ProductsPortal],
    sheets: {
        ReviewsSheet,
        ProductsSheet,
    },
});

export default workbook;
