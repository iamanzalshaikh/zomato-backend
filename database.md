Final Zomato Clone Database Fields
Specification
1. USERS COLLECTION
{
"_id": "ObjectId",
"fullName": "String",
"email": "String",
"mobile": "String",
"password": "String",
"role": "customer | admin | super_admin | restaurant_owne
r | rider",
"profileImage": "String",
"gender": "male | female | other",
"dateOfBirth": "Date",
"walletBalance": "Number",
"loyaltyPoints": "Number",
"referralCode": "String",
"referredBy": "ObjectId",
"favoriteRestaurants": ["ObjectId"],
"deviceTokens": [
{
"token": "String",
"platform": "android | ios | web"
}
],
"addresses": [
{
"label": "String",
"fullAddress": "String",
"street": "String",
"city": "String",
"state": "String",
"country": "String",
Untitled
1
"pincode": "String",
"latitude": "Number",
"longitude": "Number",
"landmark": "String",
"isDefault": "Boolean"
}
],
"loginProvider": "email | google | apple",
"isEmailVerified": "Boolean",
"isMobileVerified": "Boolean",
"accountStatus": "active | blocked | suspended",
"lastLoginAt": "Date",
"createdAt": "Date",
"updatedAt": "Date",
"isDeleted": "Boolean"
}
2. RESTAURANTS COLLECTION
{
"_id": "ObjectId",
"ownerId": "ObjectId",
"restaurantName": "String",
"slug": "String",
"description": "String",
"logo": "String",
"bannerImages": ["String"],
"phone": "String",
"email": "String",
"cuisines": ["String"],
"tags": ["String"],
"address": {
"street": "String",
"city": "String",
"state": "String",
"country": "String",
"pincode": "String"
Untitled
2
},
"location": {
"type": "Point",
"coordinates": ["Number", "Number"]
},
"latitude": "Number",
"longitude": "Number",
"deliveryRadiusKm": "Number",
"averageDeliveryTime": "Number",
"minimumOrderAmount": "Number",
"packagingCharge": "Number",
"platformCommissionPercentage": "Number",
"gstNumber": "String",
"fssaiLicense": "String",
"openingTime": "String",
"closingTime": "String",
"isOpen": "Boolean",
"supportsCOD": "Boolean",
"supportsOnlinePayment": "Boolean",
"restaurantStatus": "pending | approved | rejected | susp
ended",
"averageRating": "Number",
"totalRatings": "Number",
"totalOrders": "Number",
"createdAt": "Date",
"updatedAt": "Date",
"isDeleted": "Boolean"
}
3. MENU CATEGORIES COLLECTION
{
"_id": "ObjectId",
"restaurantId": "ObjectId",
"categoryName": "String",
"categoryImage": "String",
"sortOrder": "Number",
Untitled
3
"isActive": "Boolean",
"createdAt": "Date",
"updatedAt": "Date"
}
4. MENU ITEMS COLLECTION
{
"_id": "ObjectId",
"restaurantId": "ObjectId",
"categoryId": "ObjectId",
"itemName": "String",
"slug": "String",
"description": "String",
"shortDescription": "String",
"images": ["String"],
"price": "Number",
"discountedPrice": "Number",
"taxPercentage": "Number",
"foodType": "veg | nonveg | egg",
"spiceLevel": "low | medium | high",
"ingredients": ["String"],
"nutritionalInfo": {
"calories": "Number",
"protein": "Number",
"fat": "Number",
"carbs": "Number"
},
"addons": [
{
"name": "String",
"price": "Number",
"isAvailable": "Boolean"
}
],
"availableQuantity": "Number",
"preparationTimeMinutes": "Number",
Untitled
4
"isAvailable": "Boolean",
"isRecommended": "Boolean",
"averageRating": "Number",
"totalOrders": "Number",
"createdAt": "Date",
"updatedAt": "Date",
"isDeleted": "Boolean"
}
5. CARTS COLLECTION
{
"_id": "ObjectId",
"userId": "ObjectId",
"restaurantId": "ObjectId",
"items": [
{
"menuItemId": "ObjectId",
"itemName": "String",
"quantity": "Number",
"price": "Number",
"addons": [
{
"name": "String",
"price": "Number"
}
],
"specialInstructions": "String",
"total": "Number"
}
],
"subtotal": "Number",
"taxAmount": "Number",
"deliveryFee": "Number",
"platformFee": "Number",
"couponDiscount": "Number",
"grandTotal": "Number",
Untitled
5
"appliedCouponId": "ObjectId",
"createdAt": "Date",
"updatedAt": "Date"
}
6. ORDERS COLLECTION
{
"_id": "ObjectId",
"orderNumber": "String",
"customerId": "ObjectId",
"restaurantId": "ObjectId",
"riderId": "ObjectId",
"paymentId": "ObjectId",
"orderSource": "app | web",
"orderItems": [
{
"menuItemId": "ObjectId",
"itemName": "String",
"quantity": "Number",
"price": "Number",
"addons": [
{
"name": "String",
"price": "Number"
}
],
"specialInstructions": "String",
"total": "Number"
}
],
"subtotal": "Number",
"taxAmount": "Number",
"deliveryFee": "Number",
"platformFee": "Number",
"packagingCharge": "Number",
"surgeFee": "Number",
Untitled
6
"couponDiscount": "Number",
"walletDeduction": "Number",
"grandTotal": "Number",
"paymentMethod": "COD | ONLINE | WALLET",
"paymentStatus": "PENDING | AUTHORIZED | CAPTURED | FAILE
D | REFUNDED",
"orderStatus": "PENDING | CONFIRMED | PREPARING | READY_F
OR_PICKUP | RIDER_ASSIGNED | PICKED_UP | ON_THE_WAY | DELIV
ERED | CANCELLED",
"customerAddress": {
"fullAddress": "String",
"latitude": "Number",
"longitude": "Number"
},
"riderLocation": {
"latitude": "Number",
"longitude": "Number"
},
"estimatedPreparationTime": "Number",
"estimatedDeliveryTime": "Date",
"acceptedAt": "Date",
"preparedAt": "Date",
"pickedUpAt": "Date",
"deliveredAt": "Date",
"cancelledAt": "Date",
"cancellationReason": "String",
"refundAmount": "Number",
"deliveryOtp": "String",
"deliveryInstructions": "String",
"timelineLogs": [
{
"status": "String",
"updatedBy": "String",
"timestamp": "Date"
}
],
"fraudFlags": ["String"],
"createdAt": "Date",
Untitled
7
"updatedAt": "Date"
}
7. PAYMENTS COLLECTION
{
"_id": "ObjectId",
"orderId": "ObjectId",
"userId": "ObjectId",
"gateway": "razorpay | stripe | cashfree",
"transactionId": "String",
"gatewayOrderId": "String",
"gatewayPaymentId": "String",
"amount": "Number",
"currency": "String",
"paymentMethod": "UPI | CARD | NETBANKING | WALLET | CO
D",
"paymentStatus": "PENDING | AUTHORIZED | CAPTURED | FAILE
D | REFUNDED",
"gatewayResponse": {},
"webhookPayload": {},
"refundAmount": "Number",
"refundReason": "String",
"refundedAt": "Date",
"retryCount": "Number",
"fraudScore": "Number",
"paidAt": "Date",
"createdAt": "Date"
}
8. RIDERS COLLECTION
{
"_id": "ObjectId",
"userId": "ObjectId",
Untitled
8
"riderCode": "String",
"vehicleType": "bike | cycle | car",
"vehicleNumber": "String",
"drivingLicense": "String",
"aadhaarCard": "String",
"profileImage": "String",
"currentLocation": {
"type": "Point",
"coordinates": ["Number", "Number"]
},
"onlineStatus": "Boolean",
"availabilityStatus": "ONLINE | OFFLINE | AVAILABLE | BUS
Y | ON_DELIVERY",
"currentOrderId": "ObjectId",
"averageRating": "Number",
"totalDeliveries": "Number",
"totalEarnings": "Number",
"todayEarnings": "Number",
"bankAccountDetails": {
"accountHolderName": "String",
"accountNumber": "String",
"ifscCode": "String"
},
"verificationStatus": "pending | approved | rejected",
"lastLocationUpdatedAt": "Date",
"createdAt": "Date",
"updatedAt": "Date"
}
9. RIDER LOCATIONS COLLECTION
{
"_id": "ObjectId",
"riderId": "ObjectId",
"orderId": "ObjectId",
"latitude": "Number",
"longitude": "Number",
Untitled
9
"speed": "Number",
"heading": "Number",
"recordedAt": "Date"
}
10. WALLET TRANSACTIONS
COLLECTION
{
"_id": "ObjectId",
"userId": "ObjectId",
"orderId": "ObjectId",
"transactionType": "CREDIT | DEBIT | REFUND | CASHBACK | 
BONUS",
"amount": "Number",
"balanceBefore": "Number",
"balanceAfter": "Number",
"remarks": "String",
"createdAt": "Date"
}
11. COUPONS COLLECTION
{
"_id": "ObjectId",
"couponCode": "String",
"title": "String",
"description": "String",
"discountType": "PERCENTAGE | FLAT",
"discountValue": "Number",
"minimumOrderAmount": "Number",
"maximumDiscount": "Number",
"usageLimit": "Number",
"usedCount": "Number",
Untitled
10
"validFrom": "Date",
"validTo": "Date",
"applicableRestaurants": ["ObjectId"],
"status": "ACTIVE | EXPIRED | DISABLED",
"createdAt": "Date"
}
12. REVIEWS COLLECTION
{
"_id": "ObjectId",
"orderId": "ObjectId",
"customerId": "ObjectId",
"restaurantId": "ObjectId",
"riderId": "ObjectId",
"foodRating": "Number",
"deliveryRating": "Number",
"restaurantRating": "Number",
"reviewText": "String",
"images": ["String"],
"createdAt": "Date"
}
13. NOTIFICATIONS COLLECTION
{
"_id": "ObjectId",
"userId": "ObjectId",
"notificationType": "ORDER | PAYMENT | PROMOTION | SYSTE
M",
"title": "String",
"message": "String",
"image": "String",
"redirectType": "ORDER | RESTAURANT | OFFER",
"redirectId": "ObjectId",
Untitled
11
"isRead": "Boolean",
"sentAt": "Date",
"readAt": "Date"
}
14. SUPPORT TICKETS COLLECTION
{
"_id": "ObjectId",
"ticketNumber": "String",
"customerId": "ObjectId",
"orderId": "ObjectId",
"issueType": "PAYMENT | DELIVERY | FOOD | REFUND | OTHE
R",
"description": "String",
"images": ["String"],
"status": "OPEN | IN_PROGRESS | RESOLVED | CLOSED",
"assignedAdminId": "ObjectId",
"resolution": "String",
"createdAt": "Date",
"updatedAt": "Date"
}
15. AUDIT LOGS COLLECTION
{
"_id": "ObjectId",
"actorId": "ObjectId",
"actorRole": "String",
"module": "String",
"action": "String",
"entityId": "ObjectId",
"oldData": {},
"newData": {},
"ipAddress": "String",
Untitled
12
"deviceInfo": "String",
"createdAt": "Date"
}
Untitled
13