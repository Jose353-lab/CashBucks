# CashBucks Integration Guide

## M-Pesa Integration (Placeholder)

The CashBucks platform is designed to integrate with M-Pesa for withdrawals. Currently, this is a **placeholder implementation** that needs to be connected to actual M-Pesa APIs.

### Required Setup

1. **Get M-Pesa API Credentials**
   - Register for Safaricom Daraja API: https://developer.safaricom.co.ke/
   - Obtain Consumer Key and Consumer Secret
   - Get your Shortcode and Passkey

2. **Configure Environment Variables**
   Add these to your `.env` file or Management UI Settings → Secrets:
   ```
   MPESA_CONSUMER_KEY=your_consumer_key
   MPESA_CONSUMER_SECRET=your_consumer_secret
   MPESA_SHORTCODE=your_shortcode
   MPESA_PASSKEY=your_passkey
   MPESA_INITIATOR_NAME=your_initiator_name
   MPESA_SECURITY_CREDENTIAL=your_security_credential
   ```

3. **Implementation Location**
   - Create file: `server/services/mpesa.ts`
   - Implement functions:
     - `generateAccessToken()` - Get OAuth token
     - `initiateB2CPayment(phoneNumber, amount)` - Send money to user
     - `queryTransactionStatus(transactionId)` - Check payment status

4. **Update Withdrawal Flow**
   - File: `server/db.ts` → `approveWithdrawal()` function
   - Replace placeholder with actual M-Pesa API call
   - Handle success/failure responses
   - Update transaction status based on M-Pesa response

### Example M-Pesa Integration Code

```typescript
// server/services/mpesa.ts
import axios from 'axios';

const MPESA_BASE_URL = process.env.MPESA_ENV === 'production' 
  ? 'https://api.safaricom.co.ke' 
  : 'https://sandbox.safaricom.co.ke';

export async function generateAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');
  
  const response = await axios.get(
    `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  
  return response.data.access_token;
}

export async function initiateB2CPayment(
  phoneNumber: string, 
  amount: number
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    const token = await generateAccessToken();
    
    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/b2c/v1/paymentrequest`,
      {
        InitiatorName: process.env.MPESA_INITIATOR_NAME,
        SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
        CommandID: 'BusinessPayment',
        Amount: amount,
        PartyA: process.env.MPESA_SHORTCODE,
        PartyB: phoneNumber,
        Remarks: 'CashBucks Withdrawal',
        QueueTimeOutURL: `${process.env.APP_URL}/api/mpesa/timeout`,
        ResultURL: `${process.env.APP_URL}/api/mpesa/result`,
        Occassion: 'Withdrawal'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    return {
      success: true,
      transactionId: response.data.ConversationID
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.errorMessage || error.message
    };
  }
}
```

### Webhook Endpoints

Create these endpoints to handle M-Pesa callbacks:

1. **Result URL**: `/api/mpesa/result`
   - Receives payment success/failure notification
   - Update withdrawal status in database
   - Notify user of result

2. **Timeout URL**: `/api/mpesa/timeout`
   - Handles timeout scenarios
   - Mark withdrawal as failed
   - Refund user's CB Points

---

## SMS Integration (Africa's Talking - Placeholder)

For OTP verification and notifications, integrate Africa's Talking SMS API.

### Required Setup

1. **Get API Credentials**
   - Register at: https://africastalking.com/
   - Get API Key and Username

2. **Environment Variables**
   ```
   AT_API_KEY=your_api_key
   AT_USERNAME=your_username
   AT_SENDER_ID=CashBucks
   ```

3. **Implementation**
   - Create file: `server/services/sms.ts`
   - Implement `sendOTP(phoneNumber, code)` function
   - Implement `sendNotification(phoneNumber, message)` function

---

## Firebase Integration (Optional - Placeholder)

For push notifications and real-time updates.

### Setup

1. Create Firebase project
2. Get service account JSON
3. Add to environment:
   ```
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_CLIENT_EMAIL=your_client_email
   ```

---

## AdSense Integration (Optional)

For monetizing the platform with ads.

1. Get AdSense publisher ID
2. Add ad units to frontend pages
3. Track revenue in admin dashboard

---

## Testing Mode

Currently, all integrations are in **MOCK MODE**:
- Withdrawals are marked as "completed" without actual M-Pesa transfer
- SMS notifications are logged to console
- No real money is transferred

**⚠️ IMPORTANT**: Before going live, implement actual API integrations and test thoroughly in sandbox environments.

---

## Security Considerations

1. **Never expose API keys** in frontend code
2. **Validate all phone numbers** before processing
3. **Implement rate limiting** on withdrawal requests
4. **Add fraud detection** for suspicious patterns
5. **Use HTTPS** for all API communications
6. **Encrypt sensitive data** in database
7. **Implement 2FA** for admin actions

---

## Support

For integration help:
- M-Pesa Daraja: https://developer.safaricom.co.ke/docs
- Africa's Talking: https://help.africastalking.com/
- Firebase: https://firebase.google.com/docs

---

## Next Steps

1. ✅ Complete platform development
2. ⏳ Obtain API credentials from providers
3. ⏳ Implement actual API integrations
4. ⏳ Test in sandbox environments
5. ⏳ Deploy to production
6. ⏳ Monitor and optimize

**Current Status**: Platform ready, integrations pending API credentials
