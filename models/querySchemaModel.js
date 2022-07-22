const productProfiile = {
    productName: 1,
    currency: 1,
    quantity: 1,
    basePrice: 1,
    discountedPrice: 1,
    description: 1,
    totalLikes: 1,
    rating: 1,
    images: 1,
    isAvailable: 1,
    isTodaysSpecial: 1,
    color: 1
};

const userFullProfile = {
    email: 1,
    userName: 1,
    fullName: 1,
    phoneCode: 1,
    countryCode: 1,
    contactNumber: 1,
    codeContactNumber: 1,
    registeredFrom: 1,
    status: 1,
    isContactNumberVerified: 1,
    badgeCount: 1,
    receiveSms: 1,
    firstTimeOrderFromAppUsed: 1

};

const orderProfile = {
    productArray: 1,
    totalPrice: 1,
    discount: 1,
    deliveryCharge: 1,
    orderType: 1,
    basicInfo: 1,
    deliveryInfo: 1,
    pickUpInfo: 1,
    paymentType: 1,
    aggregateStatus: 1,
}

const productProfileList = {
    _id: "$_id",
    productName: "$productName",
    currency: "$currency",
    quantity: "$quantity",
    basePrice: "$basePrice",
    discountedPrice: "$discountedPrice",
    description: "$description",
    totalLikes: "$totalLikes",
    rating: "$rating",
    images: "$images",
    isAvailable: "$isAvailable",
    isTodaysSpecial: "$isTodaysSpecial",
    ageGroup: '$ageGroup',
    gender: '$gender',
    createdAt: "$createdAt",
    updatedAt: "$updatedAt",
    totalProductsAvailable: "$totalProductsAvailable",
    totalProductsSold: "$totalProductsSold",
    productListNumber: "$productListNumber",
    productCode: "$productCode",
};

module.exports = {
    productProfiile,
    userFullProfile,
    orderProfile,
    productProfileList
}