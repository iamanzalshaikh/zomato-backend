Final Zomato Clone API Endpoints
Specification
BASE URL
https://api.yourdomain.com/api/v1
STANDARD RESPONSE FORMAT
SUCCESS RESPONSE
{
}
"success": true,
"message": "Success",
"data": {},
"meta": {}
ERROR RESPONSE
{
}
"success": false,
"message": "Validation Error",
"errors": []
1. AUTH APIs
Untitled
1
REGISTER USER
POST /auth/register
BODY
{
}
"fullName": "John Doe",
"email": "john@gmail.com",
"mobile": "9999999999",
"password": "password123",
"role": "customer"
LOGIN USER
POST /auth/login
BODY
{
}
"email": "john@gmail.com",
"password": "password123"
SEND OTP
POST /auth/send-otp
VERIFY OTP
POST /auth/verify-otp
Untitled
2
REFRESH TOKEN
POST /auth/refresh-token
LOGOUT USER
POST /auth/logout
FORGOT PASSWORD
POST /auth/forgot-password
RESET PASSWORD
POST /auth/reset-password
2. USERS APIs
GET PROFILE
GET /users/profile
UPDATE PROFILE
PATCH /users/profile
Untitled
3
UPLOAD PROFILE IMAGE
POST /users/profile-image
ADD ADDRESS
POST /users/address
BODY
{
}
"label": "Home",
"fullAddress": "Andheri West",
"latitude": 19.076,
"longitude": 72.8777
UPDATE ADDRESS
PATCH /users/address/:addressId
DELETE ADDRESS
DELETE /users/address/:addressId
GET FAVORITE RESTAURANTS
GET /users/favorites
Untitled
4
ADD FAVORITE RESTAURANT
POST /users/favorites/:restaurantId
REMOVE FAVORITE RESTAURANT
DELETE /users/favorites/:restaurantId
GET USER ORDERS
GET /users/orders
DELETE ACCOUNT
DELETE /users/delete-account
3. RESTAURANTS APIs
CREATE RESTAURANT
POST /restaurants
GET ALL RESTAURANTS
GET /restaurants
QUERY PARAMS
?page=1
&limit=10
Untitled
5
&sort=rating
&lat=19.076
&lng=72.8777
GET RESTAURANT DETAILS
GET /restaurants/:restaurantId
SEARCH RESTAURANTS
GET /restaurants/search?q=burger
GET NEARBY RESTAURANTS
GET /restaurants/nearby
UPDATE RESTAURANT
PATCH /restaurants/:restaurantId
DELETE RESTAURANT
DELETE /restaurants/:restaurantId
UPDATE RESTAURANT STATUS
PATCH /restaurants/status/:restaurantId
Untitled
6
GET RESTAURANT ANALYTICS
GET /restaurants/analytics/:restaurantId
4. MENU CATEGORY APIs
CREATE CATEGORY
POST /menu/categories
GET CATEGORIES
GET /menu/categories/:restaurantId
UPDATE CATEGORY
PATCH /menu/categories/:categoryId
DELETE CATEGORY
DELETE /menu/categories/:categoryId
5. MENU ITEMS APIs
CREATE MENU ITEM
POST /menu/items
Untitled
7
BODY
{
}
"restaurantId": "ObjectId",
"categoryId": "ObjectId",
"itemName": "Burger",
"price": 299,
"foodType": "veg"
GET MENU ITEMS
GET /menu/items/:restaurantId
GET SINGLE MENU ITEM
GET /menu/items/details/:itemId
UPDATE MENU ITEM
PATCH /menu/items/:itemId
DELETE MENU ITEM
DELETE /menu/items/:itemId
TOGGLE AVAILABILITY
PATCH /menu/items/availability/:itemId
Untitled
8
SEARCH FOOD ITEMS
GET /menu/search?q=pizza
6. CART APIs
GET CART
GET /cart
ADD TO CART
POST /cart/add
BODY
{
}
"restaurantId": "ObjectId",
"menuItemId": "ObjectId",
"quantity": 2,
"addons": []
UPDATE CART ITEM
PATCH /cart/update/:itemId
REMOVE CART ITEM
Untitled
9
DELETE /cart/remove/:itemId
CLEAR CART
DELETE /cart/clear
APPLY COUPON
POST /cart/apply-coupon
REMOVE COUPON
DELETE /cart/remove-coupon
7. ORDERS APIs
CREATE ORDER
POST /orders/create
BODY
{
}
"paymentMethod": "ONLINE",
"deliveryAddressId": "ObjectId",
"couponId": "ObjectId"
Untitled
10
GET ORDER DETAILS
GET /orders/:orderId
GET USER ORDERS
GET /orders/user/history
TRACK ORDER
GET /orders/track/:orderId
CANCEL ORDER
PATCH /orders/cancel/:orderId
UPDATE ORDER STATUS
PATCH /orders/status/:orderId
ASSIGN RIDER
PATCH /orders/assign-rider/:orderId
VERIFY DELIVERY OTP
POST /orders/verify-delivery-otp
Untitled
11
GET ACTIVE ORDERS
GET /orders/active
REQUEST REFUND
POST /orders/refund-request
8. PAYMENTS APIs
CREATE PAYMENT ORDER
POST /payments/create-order
VERIFY PAYMENT
POST /payments/verify
PAYMENT WEBHOOK
POST /payments/webhook
INITIATE REFUND
POST /payments/refund
Untitled
12
GET PAYMENT DETAILS
GET /payments/:paymentId
ADD MONEY TO WALLET
POST /payments/wallet/add-money
GET WALLET TRANSACTIONS
GET /payments/wallet/history
9. RIDERS APIs
REGISTER RIDER
POST /riders/register
RIDER LOGIN
POST /riders/login
GET AVAILABLE ORDERS
GET /riders/available-orders
Untitled
13
ACCEPT ORDER
PATCH /riders/accept-order/:orderId
REJECT ORDER
PATCH /riders/reject-order/:orderId
UPDATE LOCATION
PATCH /riders/location
BODY
{
}
"latitude": 19.076,
"longitude": 72.8777
PICKUP ORDER
PATCH /riders/pickup-order/:orderId
COMPLETE DELIVERY
PATCH /riders/complete-delivery/:orderId
GET RIDER EARNINGS
GET /riders/earnings
Untitled
14
GET DELIVERY HISTORY
GET /riders/history
10. COUPONS APIs
CREATE COUPON
POST /coupons
GET COUPONS
GET /coupons
VALIDATE COUPON
POST /coupons/validate
UPDATE COUPON
PATCH /coupons/:couponId
DELETE COUPON
DELETE /coupons/:couponId
Untitled
15
11. REVIEWS APIs
ADD REVIEW
POST /reviews
UPDATE REVIEW
PATCH /reviews/:reviewId
DELETE REVIEW
DELETE /reviews/:reviewId
GET RESTAURANT REVIEWS
GET /reviews/restaurant/:restaurantId
GET RIDER REVIEWS
GET /reviews/rider/:riderId
12. NOTIFICATIONS APIs
GET USER NOTIFICATIONS
GET /notifications
Untitled
16
MARK NOTIFICATION READ
PATCH /notifications/read/:notificationId
MARK ALL READ
PATCH /notifications/read-all
DELETE NOTIFICATION
DELETE /notifications/:notificationId
13. SUPPORT APIs
CREATE SUPPORT TICKET
POST /support/tickets
GET USER TICKETS
GET /support/tickets
GET TICKET DETAILS
GET /support/tickets/:ticketId
Untitled
17
ADD TICKET REPLY
POST /support/tickets/reply
UPDATE TICKET STATUS
PATCH /support/tickets/:ticketId
14. ADMIN APIs
ADMIN LOGIN
POST /admin/login
GET DASHBOARD ANALYTICS
GET /admin/dashboard
GET ALL USERS
GET /admin/users
BLOCK USER
PATCH /admin/users/block/:userId
UNBLOCK USER
Untitled
18
PATCH /admin/users/unblock/:userId
GET ALL RESTAURANTS
GET /admin/restaurants
APPROVE RESTAURANT
PATCH /admin/restaurants/approve/:restaurantId
REJECT RESTAURANT
PATCH /admin/restaurants/reject/:restaurantId
GET ALL RIDERS
GET /admin/riders
APPROVE RIDER
PATCH /admin/riders/approve/:riderId
REJECT RIDER
PATCH /admin/riders/reject/:riderId
Untitled
19
GET ALL ORDERS
GET /admin/orders
FORCE CANCEL ORDER
PATCH /admin/orders/cancel/:orderId
15. ANALYTICS APIs
GET SALES ANALYTICS
GET /analytics/sales
GET ORDER ANALYTICS
GET /analytics/orders
GET USER ANALYTICS
GET /analytics/users
GET DELIVERY ANALYTICS
GET /analytics/delivery
Untitled
20
16. SEARCH APIs
GLOBAL SEARCH
GET /search?q=burger
SEARCH RESTAURANTS
GET /search/restaurants?q=kfc
SEARCH FOOD ITEMS
GET /search/foods?q=pizza
GET TRENDING SEARCHES
GET /search/trending
17. SOCKET EVENTS
CUSTOMER EVENTS
order_created
order_confirmed
rider_assigned
rider_location_update
order_picked_up
order_delivered
Untitled
21
RESTAURANT EVENTS
new_order
order_cancelled
order_updated
RIDER EVENTS
delivery_assigned
pickup_confirmed
order_completed
18. COMMON QUERY PARAMS
PAGINATION
?page=1&limit=10
SORTING
?sort=rating&order=desc
FILTERS
?foodType=veg
?priceMin=100
?priceMax=500
19. COMMON STATUS CODES
Code
Meaning
Success
Untitled
22
200
Code
201
400
401
403
404
422
500
Meaning
Created
Bad Request
Unauthorized
Forbidden
Not Found
Validation Error
Internal Server Error
FINAL NOTES
This document contains the final production-oriented API endpoint structure
for:
Customer App
Restaurant Panel
Rider App
Admin Panel
Payment System
Wallet System
Order Engine
Notification System
Analytics
Search System
This API specification is suitable for backend development and frontend
integration.
Untitled
23