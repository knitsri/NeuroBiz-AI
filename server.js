import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import twilio from 'twilio';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config();

// Initialize Firebase client SDK on backend
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.VITE_FIREBASE_APP_ID || ""
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate-image', async (req, res) => {
  const { 
    userId, 
    product, 
    promoType, 
    discount, 
    businessType, 
    instagram, 
    whatsapp, 
    simulate 
  } = req.body;
  
  if (simulate) {
    if (simulate === 429) {
      return res.status(429).json({
        error: "QUOTA_EXCEEDED",
        message: "Image generation quota exceeded. Please try again later."
      });
    }
    if (simulate === 401 || simulate === 403) {
      return res.status(simulate).json({
        error: "AUTHENTICATION_ERROR",
        message: "Authentication failed. Invalid API key configuration."
      });
    }
    if (simulate === 404) {
      return res.status(404).json({
        error: "MODEL_NOT_FOUND",
        message: "Requested image generation model could not be found."
      });
    }
    if (simulate >= 500) {
      return res.status(simulate).json({
        error: "INTERNAL_ERROR",
        message: "Internal server error from image provider. Please try again."
      });
    }
  }

  if (!product) {
    return res.status(400).json({ error: "Product name is required" });
  }

  const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!cfAccountId || !cfApiToken) {
    return res.status(500).json({
      error: "CONFIGURATION_ERROR",
      message: "Cloudflare credentials CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are missing on the server."
    });
  }

  try {
    // Construct prompt
    let categoryText = businessType || "general retail";
    let prompt = `A clean, professional, high-end commercial product advertising photography background for a product.
Product: ${product}
Category: ${categoryText}
Visual elements: Sleek product placement, elegant lighting, professional studio setup, beautiful product styling.
Design style: High-resolution commercial photography, clean depth of field, vibrant colors, premium advertising background.
CRITICAL: Do NOT include any text, product names, slogans, numbers, discount percentages, prices, letters, badges, logos, or CTA text in the image. The image must contain only the product and its aesthetic studio background.`;

    // Call Cloudflare Workers AI with retries and exponential backoff
    const model = '@cf/black-forest-labs/flux-1-schnell';
    const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/${model}`;
    
    let response;
    let imageBuffer = null;
    const maxRetries = 3;
    const retryCodes = [429, 502, 503, 504];

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (simulate === 'retry-503') {
          response = {
            ok: false,
            status: 503,
            text: async () => "Service Unavailable (Simulated)"
          };
        } else if (simulate === 'retry-429') {
          response = {
            ok: false,
            status: 429,
            text: async () => "Rate Limit Exceeded (Simulated)"
          };
        } else {
          response = await fetch(cfUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${cfApiToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
          });
        }

        const status = response.status;
        const willRetry = retryCodes.includes(status) && attempt < maxRetries;

        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          
          if (contentType.includes('application/json')) {
            const jsonResponse = await response.json();
            const base64Image = jsonResponse.result?.image;
            if (!base64Image) {
              throw new Error("No image data found in Cloudflare JSON response result.");
            }
            imageBuffer = Buffer.from(base64Image, 'base64');
          } else {
            // Fallback for binary image bytes
            const arrayBuffer = await response.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
          }

          if (!imageBuffer || imageBuffer.byteLength === 0) {
            throw new Error("Empty image received from Cloudflare Workers AI.");
          }
          break;
        }

        // Retry temporary errors (429, 502, 503, 504)
        if (willRetry) {
          const backoffMs = 2000 * Math.pow(2, attempt); // 2s, 4s, 8s
          await delay(backoffMs);
          continue;
        }

        // Handle terminal API errors
        if (status === 401 || status === 403) {
          return res.status(status).json({
            error: "AUTHENTICATION_ERROR",
            message: "Authentication failed. Invalid Cloudflare API token."
          });
        }
        
        if (retryCodes.includes(status)) {
          return res.status(503).json({
            error: "IMAGE_MODEL_BUSY",
            message: "The image generation model is temporarily busy. Please try again in a few minutes."
          });
        }

        const errText = await response.text();
        throw new Error(`Cloudflare API returned status ${status}: ${errText}`);

      } catch (err) {
        const willRetry = attempt < maxRetries;

        // Retry network failures
        if (willRetry) {
          const backoffMs = 2000 * Math.pow(2, attempt);
          await delay(backoffMs);
          continue;
        }
        throw err;
      }
    }

    if (!imageBuffer) {
      throw new Error("Failed to retrieve image buffer after retries.");
    }

    // Convert generated image buffer directly to Base64 data URL
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const downloadUrl = `data:image/png;base64,${base64Image}`;

    // Return structured JSON to client
    res.json({
      success: true,
      imageUrl: downloadUrl,
      caption: instagram || "",
      campaignType: promoType,
      discount: Number(discount)
    });
  } catch (error) {
    console.error("Image generation or save error:", error);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: error.message || "Failed to generate campaign assets."
    });
  }
});

app.post('/api/send-whatsapp', async (req, res) => {
  const { to, message } = req.body;
  
  if (!to || !message) {
    return res.status(400).json({ error: "Recipient ('to') and 'message' are required." });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return res.status(500).json({
      error: "CONFIGURATION_ERROR",
      message: "Twilio credentials are missing on the server."
    });
  }

  try {
    const client = twilio(accountSid, authToken);
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const formattedFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

    const twilioResponse = await client.messages.create({
      from: formattedFrom,
      to: formattedTo,
      body: message
    });

    return res.json({
      success: true,
      sid: twilioResponse.sid
    });
  } catch (error) {
    console.error("Twilio send error:", error);
    return res.status(500).json({
      error: "SEND_ERROR",
      message: error.message || "Failed to send WhatsApp message."
    });
  }
});

app.post('/api/create-order', async (req, res) => {
  const { procurementId, amount } = req.body;

  if (!procurementId || amount === undefined || amount === null) {
    return res.status(400).json({ error: "procurementId and amount are required fields." });
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: "amount must be a valid positive number." });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error("Razorpay Config Error: Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in environment.");
    return res.status(500).json({
      error: "CONFIGURATION_ERROR",
      message: "Razorpay credentials are not configured on the server."
    });
  }

  try {
    const rzp = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const amountInPaise = Math.round(numericAmount * 100);

    const order = await rzp.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: procurementId
    });

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId
    });
  } catch (error) {
    console.error("Razorpay create-order backend error:", error);
    return res.status(500).json({
      error: "CREATE_ORDER_ERROR",
      message: error.message || "Failed to create Razorpay Test Mode order."
    });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  const { procurementId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!procurementId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing required signature verification fields." });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error("Razorpay Config Error: Missing credentials in environment during verification.");
    return res.status(500).json({
      error: "CONFIGURATION_ERROR",
      message: "Razorpay credentials are not configured on the server."
    });
  }

  try {
    // Generate signature verify string
    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      console.error("Razorpay verification failed: Signature mismatch.");
      return res.status(400).json({ error: "SIGNATURE_MISMATCH", message: "Razorpay signature verification failed." });
    }

    // Verification succeeded: Update corresponding procurement document in Firestore
    const requestDocRef = doc(db, 'procurements', procurementId);
    const requestSnapshot = await getDoc(requestDocRef);

    if (!requestSnapshot.exists()) {
      console.error(`Firestore Error: Procurement request document with ID ${procurementId} not found.`);
      return res.status(404).json({ error: "DOCUMENT_NOT_FOUND", message: "Procurement request document not found." });
    }

    const requestData = requestSnapshot.data();

    // Update status and payment tags in Firestore
    await updateDoc(requestDocRef, {
      paymentStatus: "Paid",
      paymentId: razorpay_payment_id,
      paymentDate: new Date().toISOString()
    });

    // Send WhatsApp notification to the Vendor
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'vendor'),
        where('businessName', '==', requestData.vendor)
      );
      const userSnapshot = await getDocs(usersQuery);
      if (!userSnapshot.empty) {
        const vendorData = userSnapshot.docs[0].data();
        if (vendorData.phone) {
          const waMessage = `💳 Payment received.

Business: ${requestData.businessName}
Item: ${requestData.item}
Quantity: ${requestData.quantity}

You may now prepare the shipment.`;

          const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          const formattedTo = vendorData.phone.startsWith('whatsapp:') ? vendorData.phone : `whatsapp:${vendorData.phone}`;
          const formattedFrom = process.env.TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:') ? process.env.TWILIO_WHATSAPP_NUMBER : `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;

          await client.messages.create({
            from: formattedFrom,
            to: formattedTo,
            body: waMessage
          });
        }
      }
    } catch (whatsappErr) {
      console.error("WhatsApp notification dispatch failed after successful payment:", whatsappErr);
    }

    return res.json({ success: true, message: "Payment verified and document updated successfully." });
  } catch (error) {
    console.error("Razorpay verification backend error:", error);
    return res.status(500).json({
      error: "VERIFY_PAYMENT_ERROR",
      message: error.message || "An error occurred during Razorpay payment verification."
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
