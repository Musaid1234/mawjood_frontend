# PayTabs Frontend Setup Guide

## Quick Start

The PayTabs integration is now complete and ready to use. Follow these steps to test it:

### 1. Ensure Backend is Running

Make sure your backend server is running with the correct environment variables:

```bash
cd mawjood-backend
npm run dev
```

### 2. Required Environment Variables

The backend should have these variables in `.env`:

```env
PAYTABS_SERVER_KEY="SNJ9L6R9LD-JL9K2N6LKL-2RNL6H2RWZ"
PAYTABS_PROFILE_ID="120336"
PAYTABS_API_URL="https://secure.paytabs.sa"
PAYTABS_CURRENCY="SAR"
PAYTABS_CALLBACK_URL="http://localhost:5000/api/payments/paytabs/callback"
PAYTABS_RETURN_URL="http://localhost:3000/dashboard/payments/success"
FRONTEND_URL="http://localhost:3000"
```

### 3. Test the Payment Flow

1. **Login to Dashboard**
   - Navigate to `http://localhost:3000/dashboard`

2. **Go to Subscriptions**
   - Click on "Subscriptions" in the sidebar
   - Or go to `http://localhost:3000/dashboard/subscriptions`

3. **Select a Plan**
   - Choose any available subscription plan
   - Click "Subscribe Now"

4. **Select Business**
   - Choose one of your businesses from the dropdown
   - Note: Business must be APPROVED status
   - Click "Confirm Subscription"

5. **Complete Payment**
   - You'll be redirected to PayTabs payment page
   - Use test card: `4111 1111 1111 1111`
   - Expiry: Any future date (e.g., 12/25)
   - CVV: Any 3 digits (e.g., 123)

6. **Payment Result**
   - You'll be redirected back to:
     - Success: `/dashboard/payments/success`
     - Failed: `/dashboard/payments/failed`
     - Pending: `/dashboard/payments/pending`

## Test Card Numbers

### Successful Payments

```
Card: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
```

```
Card: 5500 0000 0000 0004
Expiry: 12/25
CVV: 123
```

### Declined Payments

```
Card: 4000 0000 0000 0002
Expiry: 12/25
CVV: 123
```

## Payment Status Pages

### Success Page
- Location: `/dashboard/payments/success`
- Shows: Payment confirmation, amount, transaction reference
- Actions: Go to subscriptions, Back to dashboard

### Failed Page
- Location: `/dashboard/payments/failed`
- Shows: Error message, payment details (if available)
- Actions: Try again, Back to dashboard

### Pending Page
- Location: `/dashboard/payments/pending`
- Shows: Processing message, auto-refreshes every 5 seconds
- Actions: Manual refresh, Back to dashboard

## API Integration

### Create Payment

```typescript
import { paymentService } from '@/services/payment.service';

const response = await paymentService.createPayment({
  businessId: 'business-id',
  amount: 100.00,
  currency: 'SAR',
  description: 'Subscription payment for Premium Plan',
  returnUrl: 'http://localhost:3000/dashboard/subscriptions'
});

// Response contains:
// - paymentId: string
// - redirectUrl: string (PayTabs payment page)
// - transactionRef: string

// Redirect user to payment page
window.location.href = response.data.redirectUrl;
```

### Check Payment Status

```typescript
import { paymentService } from '@/services/payment.service';

const payment = await paymentService.getPaymentById(paymentId);

// Payment object contains:
// - id
// - amount
// - currency
// - status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
// - transactionId
// - description
// - business details
// - createdAt, updatedAt
```

## Troubleshooting

### Issue: "Failed to create payment page"

**Solution:**
1. Check backend logs for errors
2. Verify environment variables are set correctly
3. Ensure PayTabs API is accessible
4. Check server key is valid

### Issue: Payment stuck in PENDING

**Solution:**
1. Wait 5-10 seconds for callback
2. Use "Check Status" button on pending page
3. Check backend logs for callback errors
4. Verify callback URL is accessible

### Issue: Redirected to wrong page after payment

**Solution:**
1. Check `PAYTABS_RETURN_URL` in backend `.env`
2. Ensure it points to correct frontend URL
3. Clear browser cache and try again

### Issue: Business not showing in dropdown

**Solution:**
1. Business must have status = 'APPROVED'
2. Check business approval in admin panel
3. Refresh the page

## Local Development with Callbacks

### Problem
PayTabs can't send callbacks to `localhost`

### Solution 1: Use ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 5000

# Copy ngrok URL (e.g., https://abc123.ngrok.io)
# Update backend .env:
PAYTABS_CALLBACK_URL="https://abc123.ngrok.io/api/payments/paytabs/callback"
```

### Solution 2: Deploy to Test Server

Deploy backend to a publicly accessible server (e.g., Heroku, Railway, DigitalOcean)

## Production Deployment

### 1. Update Environment Variables

```env
# Use production keys
PAYTABS_SERVER_KEY="SBJ9L6R9JB-JL9K2N6LTW-DNTGM26JT9"
PAYTABS_PROFILE_ID="120336"
PAYTABS_API_URL="https://secure.paytabs.sa"
PAYTABS_CURRENCY="SAR"
PAYTABS_CALLBACK_URL="https://api.yourdomain.com/api/payments/paytabs/callback"
PAYTABS_RETURN_URL="https://yourdomain.com/dashboard/payments/success"
FRONTEND_URL="https://yourdomain.com"
```

### 2. Configure PayTabs Dashboard

1. Login to PayTabs merchant dashboard
2. Go to Settings > Payment Page Settings
3. Set Callback URL: `https://api.yourdomain.com/api/payments/paytabs/callback`
4. Set Return URL: `https://yourdomain.com/dashboard/payments/success`
5. Save settings

### 3. Test in Production

1. Use real credit card (small amount)
2. Verify payment callback is received
3. Check payment status in database
4. Verify subscription is activated

## Security Checklist

- [x] Server keys stored in environment variables (not in code)
- [x] Payment callbacks verified with PayTabs API
- [x] HTTPS enabled in production
- [x] Payment amounts validated on backend
- [x] User authorization checked before payment
- [x] Sensitive data not logged
- [x] Error messages don't expose internal details

## Monitoring

### Check Payment Logs

```bash
# Backend logs
cd mawjood-backend
npm run dev

# Look for:
# - "Payment created: {id}"
# - "PayTabs Callback received"
# - "Payment status updated: {status}"
```

### Check Database

```sql
-- View recent payments
SELECT * FROM Payment ORDER BY createdAt DESC LIMIT 10;

-- Check payment status distribution
SELECT status, COUNT(*) FROM Payment GROUP BY status;

-- Find failed payments
SELECT * FROM Payment WHERE status = 'FAILED' ORDER BY createdAt DESC;
```

## Next Steps

1. Test the complete payment flow in development
2. Set up ngrok for callback testing
3. Test with both successful and declined card numbers
4. Monitor payment logs
5. Deploy to staging environment
6. Update to production keys
7. Test in production with small amounts
8. Monitor production payments
9. Set up payment analytics dashboard

## Support

For issues or questions:
1. Check backend logs first
2. Review this documentation
3. Check PayTabs documentation
4. Contact development team

## Additional Resources

- [PayTabs API Documentation](https://site.paytabs.com/en/paytabs-api/)
- [PayTabs Merchant Dashboard](https://merchant.paytabs.sa/)
- [PayTabs Support](mailto:support@paytabs.com)

