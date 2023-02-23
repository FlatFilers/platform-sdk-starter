const ReviewsSheet = new FF.Sheet(
    "Reviews",

const ProductsSheet = new FF.Sheet(
    "Products",

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