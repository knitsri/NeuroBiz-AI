import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
        
        console.log(`Cloudflare AI Response:
  - Model: ${model}
  - HTTP Status: ${status}
  - Attempt: ${attempt} (max: ${maxRetries})
  - Will Retry: ${willRetry}`);

        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          console.log(`Cloudflare AI Response OK. Content-Type: ${contentType}`);
          
          if (contentType.includes('application/json')) {
            const jsonResponse = await response.json();
            const base64Image = jsonResponse.result?.image;
            if (!base64Image) {
              throw new Error("No image data found in Cloudflare JSON response result.");
            }
            console.log("CLOUDFLARE_IMAGE_GENERATION_SUCCESS");
            console.log(`Cloudflare AI response shape keys: ${Object.keys(jsonResponse)}`);
            imageBuffer = Buffer.from(base64Image, 'base64');
          } else {
            // Fallback for binary image bytes
            const arrayBuffer = await response.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
            console.log("CLOUDFLARE_IMAGE_GENERATION_SUCCESS (binary)");
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
        console.log(`Cloudflare AI Response (Network Error):
  - Model: ${model}
  - HTTP Status: Network Error (${err.message})
  - Attempt: ${attempt} (max: ${maxRetries})
  - Will Retry: ${willRetry}`);

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
