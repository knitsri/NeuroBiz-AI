import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { addMarketingCampaign } from '../services/marketing';
import { storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Helper function to convert base64 data URL to a Blob
const dataURLtoBlob = (dataUrl) => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

const getLocalFallbackCampaign = (product, offer, discount) => {
  const title = `${discount}% OFF on ${product}!`;
  const posterHeadline = `${discount}% OFF`;
  const posterSubtitle = `SPECIAL ON ${product.toUpperCase()}`;
  const callToAction = 'ORDER NOW';
  const instagramCaption = `✨ Special Promo Alert! ✨\n\nGet an amazing ${discount}% OFF on our ${product}! Promotion details: ${offer}.\n\nDon't miss out on this exclusive deal. ${callToAction}! 🛍️\n\n#sale #discount #promotion #${product.toLowerCase().replace(/\s+/g, '')}`;
  const whatsappPromotion = `🔥 *SPECIAL PROMOTION* 🔥\n\nEnjoy *${discount}% OFF* on *${product}*!\n👉 Promo Type: ${offer}\n\nLimit: While stock lasts.\n\n*${callToAction}*!`;
  const description = `Discount campaign for ${product}`;

  return {
    id: 'camp-fallback-' + Date.now(),
    product,
    promoType: offer,
    discount,
    title,
    posterHeadline,
    posterSubtitle,
    callToAction,
    instagramCaption,
    whatsappPromotion,
    description
  };
};
import {
  Megaphone,
  Sparkles,
  Camera,
  MessageSquare,
  Copy,
  Check,
  TrendingUp,
  RefreshCw,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Marketing() {
  const { inventory, generateAiCampaign, businessType, currentUser, setActiveMarketing } = useApp();

  const [selectedProduct, setSelectedProduct] = useState('');
  const [promoType, setPromoType] = useState('Clearance Sale');
  const [discount, setDiscount] = useState(20);

  const getCampaignTypes = () => {
    if (businessType === 'restaurant') {
      return [
        "Chef's Special",
        "Today's Special",
        "Weekend Special",
        "Combo Offer",
        "Family Feast",
        "Lunch Special",
        "Dinner Delight",
        "Happy Hours",
        "Festival Special",
        "Limited Time Offer",
        "Buy 1 Get 1"
      ];
    } else if (businessType === 'pharmacy') {
      return [
        "Health Awareness",
        "Wellness Week",
        "Seasonal Offer",
        "Medicine Discount",
        "Combo Savings",
        "Festival Offer",
        "Limited Time"
      ];
    } else {
      return [
        "Clearance Sale",
        "Flat Discount",
        "Buy 2 Get 1",
        "New Arrivals",
        "End of Season Sale",
        "Festive Collection",
        "Weekend Sale",
        "Flash Sale"
      ];
    }
  };

  // Load states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingPoster, setIsRegeneratingPoster] = useState(false);

  const [currentAsset, setCurrentAsset] = useState(null);

  // Synchronize initial selection & restore saved workspace state (owner-scoped)
  useEffect(() => {
    if (!currentUser) {
      setCurrentAsset(null);
      setSelectedProduct('');
      setDiscount(20);
      return;
    }

    const saved = localStorage.getItem(`neurobiz_marketing_workspace_${currentUser.uid}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentAsset(parsed);
        if (parsed.selectedProduct) setSelectedProduct(parsed.selectedProduct);
        if (parsed.promoType) setPromoType(parsed.promoType);
        if (parsed.discount) setDiscount(Number(parsed.discount));
      } catch (e) {
        console.error("Error restoring marketing workspace:", e);
      }
    } else {
      setCurrentAsset(null);
      setSelectedProduct('');
      setDiscount(20);
      if (businessType === 'restaurant') {
        setPromoType("Chef's Special");
      } else if (businessType === 'pharmacy') {
        setPromoType("Wellness Week");
      } else {
        setPromoType("Clearance Sale");
      }
    }
  }, [currentUser, businessType]);

  const handleClearWorkspace = () => {
    setCurrentAsset(null);
    setSelectedProduct('');
    if (businessType === 'restaurant') {
      setPromoType("Chef's Special");
    } else if (businessType === 'pharmacy') {
      setPromoType("Wellness Week");
    } else {
      setPromoType("Clearance Sale");
    }
    setDiscount(20);
    if (currentUser) {
      localStorage.removeItem(`neurobiz_marketing_workspace_${currentUser.uid}`);
    }
    setActiveMarketing(0);
  };

  // Feedback states
  const [copiedType, setCopiedType] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Canvas drawing generator to build base64 Data URLs in real-time matching selections
  const drawCanvasToDataUrl = (product, promoCat, discPct, headline = '', subtitle = '', cta = '') => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    // Theme selections
    let bgCol1 = '#0a0d1a'; // slate-950
    let bgCol2 = '#1e1b4b'; // indigo-900
    let primaryBrandColor = '#6366f1';
    let secondaryBrandColor = '#818cf8';

    if (businessType === 'restaurant') {
      bgCol1 = '#090c0a';
      bgCol2 = '#064e3b'; // green foodie
      primaryBrandColor = '#10b981';
      secondaryBrandColor = '#34d399';
    } else if (businessType === 'clothing') {
      bgCol1 = '#0f172a';
      bgCol2 = '#831843'; // rose fashion
      primaryBrandColor = '#ec4899';
      secondaryBrandColor = '#f472b6';
    }

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, bgCol1);
    grad.addColorStop(0.5, bgCol2);
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // SaaS gridlines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    const spacing = 40;
    for (let x = 0; x < canvas.width; x += spacing) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += spacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Glowing framing borders
    ctx.strokeStyle = primaryBrandColor;
    ctx.lineWidth = 14;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Decorative digital shapes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.beginPath(); ctx.arc(canvas.width * 0.8, canvas.height * 0.2, 220, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(canvas.width * 0.15, canvas.height * 0.85, 170, 0, Math.PI * 2); ctx.fill();

    // NeuroBiz brand tag
    ctx.fillStyle = secondaryBrandColor;
    ctx.font = '900 30px sans-serif';
    ctx.fillText('NEUROBIZ AI', 50, 75);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('SME AUTOPILOT CAMPAIGNS • SECURE DIAGNOSTICS', 50, 100);

    // Main header (grows with Gemini dynamic title)
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 36px sans-serif';
    const displayHeadline = (headline || `${discPct}% OFF ON ${product}!`).toUpperCase();
    ctx.fillText(displayHeadline, 50, 240);

    // Subheader
    ctx.fillStyle = secondaryBrandColor;
    ctx.font = '800 18px sans-serif';
    const displaySubtitle = (subtitle || `CAMPAIGN STAGE: ${promoCat}`).toUpperCase();
    ctx.fillText(displaySubtitle, 50, 310);

    // Details text
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 14px sans-serif';
    const displayCta = cta || 'AI-compiled promotional asset designed to boost local engagement.';
    ctx.fillText(displayCta, 50, 400);
    ctx.fillText('Redeem this voucher at checkout or verify details with manager.', 50, 430);

    // Circular badge
    ctx.beginPath();
    ctx.arc(canvas.width - 150, 240, 80, 0, 2 * Math.PI);
    ctx.fillStyle = primaryBrandColor;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${discPct}%`, canvas.width - 150, 235);
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('DISCOUNT', canvas.width - 150, 260);
    ctx.textAlign = 'left';

    // Poster descriptive info card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fillRect(50, 500, canvas.width - 100, 420);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeRect(50, 500, canvas.width - 100, 420);

    ctx.fillStyle = primaryBrandColor;
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('CAMPAIGN STRATEGY LOG', 85, 550);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 13px sans-serif';
    ctx.fillText(`Target SKU: ${product}`, 85, 600);
    ctx.fillText(`Discount Ratio: ${discPct}% Slash`, 85, 630);
    ctx.fillText(`Solvency Impact: High Clearance Burn Rate`, 85, 660);

    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 12px sans-serif';
    ctx.fillText('Recommended flow: Distribute WhatsApp promotion templates directly to active', 85, 730);
    ctx.fillText('customer phone directories to clear dead stock and minimize storage footprint.', 85, 755);

    // Footer line
    ctx.fillStyle = primaryBrandColor;
    ctx.fillRect(85, 820, canvas.width - 170, 2);
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('NEUROBIZ AUTOPILOT PIPELINE VERIFIED', 85, 850);

    return canvas.toDataURL('image/png');
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedProduct || isGenerating) return;

    setIsGenerating(true);
    setToastType('success');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      // 1. Call async campaign generator in AppContext
      let aiCampaign;
      let showFallbackWarning = false;
      try {
        aiCampaign = await generateAiCampaign(selectedProduct, promoType, discount);
      } catch (geminiError) {
        console.error("Gemini text generation error:", geminiError);
        const errorMsg = geminiError.message || String(geminiError);
        if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('rate limit') || errorMsg.toLowerCase().includes('exhausted')) {
          aiCampaign = getLocalFallbackCampaign(selectedProduct, promoType, discount);
          showFallbackWarning = true;
        } else {
          throw geminiError;
        }
      }

      // 2. Call backend image generator endpoint
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser?.uid || '',
          product: selectedProduct,
          promoType: promoType,
          discount: discount,
          businessType: businessType,
          instagram: aiCampaign.instagramCaption,
          whatsapp: aiCampaign.whatsappPromotion
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        let errorMsg = 'Failed to generate poster image';
        try {
          const errorData = await response.json();
          if (errorData.error === 'IMAGE_MODEL_BUSY') {
            errorMsg = errorData.message || 'The image generation model is temporarily busy. Please try again in a few minutes.';
          } else {
            errorMsg = errorData.message || errorData.error || errorMsg;
          }
        } catch (e) {
          if (response.status === 429) {
            errorMsg = 'Image generation quota exceeded. Please try again later.';
          } else if (response.status === 401 || response.status === 403) {
            errorMsg = 'Authentication failed. Invalid API key configuration.';
          } else if (response.status === 404) {
            errorMsg = 'Requested image generation model could not be found.';
          } else if (response.status === 503) {
            errorMsg = 'The image generation model is temporarily busy. Please try again in a few minutes.';
          } else if (response.status >= 500) {
            errorMsg = 'Internal server error from image provider. Please try again.';
          }
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      // 3. Set to state (uses the Storage URL returned as imageUrl and maps captions to render keys)
      const assetData = {
        ...aiCampaign,
        instagram: aiCampaign.instagramCaption || aiCampaign.instagram || '',
        whatsapp: aiCampaign.whatsappPromotion || aiCampaign.whatsapp || '',
        posterUrl: data.imageUrl,
        selectedProduct,
        promoType,
        discount
      };
      setCurrentAsset(assetData);
      if (currentUser) {
        localStorage.setItem(`neurobiz_marketing_workspace_${currentUser.uid}`, JSON.stringify(assetData));
      }
      setActiveMarketing(1);

      if (showFallbackWarning) {
        setToastType('error');
        setToastMsg('AI text quota reached. Fallback marketing copy generated.');
      } else {
        setToastType('success');
        setToastMsg('AI Marketing Kit compiled successfully!');
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
      let errorMsg = err.message || err;
      if (err.name === 'AbortError') {
        errorMsg = 'Request timed out after 60 seconds.';
      } else if (err.message && err.message.includes('Failed to fetch')) {
        errorMsg = 'Network failure. Cannot connect to image generation server.';
      }
      setToastType('error');
      setToastMsg(errorMsg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } finally {
      clearTimeout(timeoutId);
      setIsGenerating(false);
    }
  };

  const handleRegenerateItem = async () => {
    if (!currentAsset || isRegeneratingPoster) return;

    setIsRegeneratingPoster(true);
    setToastType('success');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const offsetDiscount = Math.min(Number(discount) + (Math.random() > 0.5 ? 5 : -5), 75);

      let aiCampaign;
      let showFallbackWarning = false;
      try {
        aiCampaign = await generateAiCampaign(selectedProduct, promoType, offsetDiscount);
      } catch (geminiError) {
        console.error("Gemini text regeneration error:", geminiError);
        const errorMsg = geminiError.message || String(geminiError);
        if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('rate limit') || errorMsg.toLowerCase().includes('exhausted')) {
          aiCampaign = getLocalFallbackCampaign(selectedProduct, promoType, offsetDiscount);
          showFallbackWarning = true;
        } else {
          throw geminiError;
        }
      }

      // Call backend image generator endpoint
      const response = await fetch(`${API_URL}/api/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser?.uid || '',
          product: selectedProduct,
          promoType: promoType,
          discount: offsetDiscount,
          businessType: businessType,
          instagram: aiCampaign.instagramCaption,
          whatsapp: aiCampaign.whatsappPromotion
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        let errorMsg = 'Failed to regenerate poster image';
        try {
          const errorData = await response.json();
          if (errorData.error === 'IMAGE_MODEL_BUSY') {
            errorMsg = errorData.message || 'The image generation model is temporarily busy. Please try again in a few minutes.';
          } else {
            errorMsg = errorData.message || errorData.error || errorMsg;
          }
        } catch (e) {
          if (response.status === 429) {
            errorMsg = 'Image generation quota exceeded. Please try again later.';
          } else if (response.status === 401 || response.status === 403) {
            errorMsg = 'Authentication failed. Invalid API key configuration.';
          } else if (response.status === 404) {
            errorMsg = 'Requested image generation model could not be found.';
          } else if (response.status === 503) {
            errorMsg = 'The image generation model is temporarily busy. Please try again in a few minutes.';
          } else if (response.status >= 500) {
            errorMsg = 'Internal server error from image provider. Please try again.';
          }
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      const assetData = {
        ...aiCampaign,
        instagram: aiCampaign.instagramCaption || aiCampaign.instagram || '',
        whatsapp: aiCampaign.whatsappPromotion || aiCampaign.whatsapp || '',
        posterUrl: data.imageUrl,
        selectedProduct,
        promoType,
        discount: offsetDiscount
      };
      setCurrentAsset(assetData);
      if (currentUser) {
        localStorage.setItem(`neurobiz_marketing_workspace_${currentUser.uid}`, JSON.stringify(assetData));
      }
      setActiveMarketing(1);

      if (showFallbackWarning) {
        setToastType('error');
        setToastMsg('AI text quota reached. Fallback marketing copy generated.');
      } else {
        setToastType('success');
        setToastMsg('AI Marketing Kit regenerated!');
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
      let errorMsg = err.message || err;
      if (err.name === 'AbortError') {
        errorMsg = 'Request timed out after 60 seconds.';
      } else if (err.message && err.message.includes('Failed to fetch')) {
        errorMsg = 'Network failure. Cannot connect to image generation server.';
      }
      setToastType('error');
      setToastMsg(errorMsg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } finally {
      clearTimeout(timeoutId);
      setIsRegeneratingPoster(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);

    setToastMsg(`Copied ${type === 'instagram' ? 'Instagram Caption' : 'WhatsApp Message'} to Clipboard!`);
    setShowToast(true);
    setTimeout(() => {
      setCopiedType('');
      setShowToast(false);
    }, 2000);
  };

  const triggerDownload = (backgroundImageUrl, fileName) => {
    // Show a toast that compilation/download is starting
    setToastType('success');
    setToastMsg('Compiling poster layers...');
    setShowToast(true);

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    // Allow cross-origin requests
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 1. Draw the generated background image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 2. Determine Theme colors
      let primaryColor = '#6366f1';
      let secondaryColor = '#818cf8';
      if (businessType === 'restaurant') {
        primaryColor = '#10b981';
        secondaryColor = '#34d399';
      } else if (businessType === 'clothing') {
        primaryColor = '#ec4899';
        secondaryColor = '#f472b6';
      }

      // 3. Draw gradient overlay for text readability
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, 'rgba(10, 13, 26, 0.4)');
      grad.addColorStop(0.75, 'rgba(10, 13, 26, 0.65)');
      grad.addColorStop(1, 'rgba(2, 6, 23, 0.9)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 4. Draw Glowing framing borders (SaaS theme)
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 14;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      // 5. Draw Branding Header
      ctx.fillStyle = secondaryColor;
      ctx.font = '900 30px sans-serif';
      ctx.fillText('NEUROBIZ AI', 50, 80);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('SME AUTOPILOT CAMPAIGNS • SECURE DIAGNOSTICS', 50, 105);

      // 6. Main Headline (Campaign Type)
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px sans-serif';
      const headlineText = (currentAsset.title || currentAsset.posterHeadline || promoType).toUpperCase();
      ctx.fillText(headlineText, 50, 240);

      // 7. Subheader (Product Name)
      ctx.fillStyle = secondaryColor;
      ctx.font = '800 20px sans-serif';
      const productText = (currentAsset.product || selectedProduct).toUpperCase();
      ctx.fillText(productText, 50, 300);

      // 8. Circular Discount Badge
      ctx.beginPath();
      ctx.arc(canvas.width - 150, 240, 80, 0, 2 * Math.PI);
      ctx.fillStyle = primaryColor;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 32px sans-serif';
      ctx.textAlign = 'center';
      const discountText = `${currentAsset.discount || discount}%`;
      ctx.fillText(discountText, canvas.width - 150, 235);
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('OFF', canvas.width - 150, 260);
      ctx.textAlign = 'left';

      // 9. CTA / Slogan Info Card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(50, 800, canvas.width - 100, 140);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(50, 800, canvas.width - 100, 140);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SHOP NOW', canvas.width / 2, 860);

      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText('Scan QR Code or visit neurobiz.ai to redeem', canvas.width / 2, 890);
      ctx.textAlign = 'left';

      // 10. Trigger actual download
      const compiledDataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = fileName;
      link.href = compiledDataUrl;
      link.click();

      setToastType('success');
      setToastMsg('Image downloaded successfully with text overlays!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    };
    img.onerror = (e) => {
      console.error("Canvas background load failed:", e);
      // Fallback to downloading raw background image
      const link = document.createElement('a');
      link.download = fileName;
      link.href = backgroundImageUrl;
      link.click();
      setToastType('error');
      setToastMsg('Failed to compile overlays. Downloaded background image.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    };
    img.src = backgroundImageUrl;
  };

  return (
    <div className="pt-20 pl-4 md:pl-72 pr-4 md:pr-8 pb-12 min-h-screen text-slate-100 flex flex-col gap-6 relative">

      {/* Toast popup */}
      {showToast && (
        <div className={`fixed top-20 right-8 z-50 p-4 rounded-xl border text-xs font-bold animate-in slide-in-from-top-4 duration-300 flex items-center gap-2 shadow-xl ${toastType === 'error'
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-450 shadow-rose-950/20'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-450 text-xs font-bold shadow-emerald-950/20'
          }`}>
          {toastType === 'error' ? (
            <AlertCircle className="h-4.5 w-4.5 text-rose-400 font-semibold" />
          ) : (
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 font-semibold" />
          )}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-200">AI Marketing Studio</h2>
        <p className="text-xs text-slate-500">Expose campaign copies and visual posters in a unified, high-fidelity content workspace terminal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Directives Input Form */}
        <div className="lg:col-span-1 glass rounded-3xl p-6 border border-slate-800 h-fit">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-indigo-400" /> Campaign Directives
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* SKU Input / Dropdown based on businessType */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {businessType === 'restaurant' ? 'Menu Item' : 'Target SKU / Product'}
              </label>
              {businessType === 'restaurant' ? (
                <input
                  type="text"
                  required
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  placeholder="Example: Chicken Biryani, Butter Chicken, Paneer Tikka"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                />
              ) : (
                <select
                  required
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs transition-colors cursor-pointer"
                >
                  <option value="" disabled>Select an item...</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.name}>{item.name} ({item.status})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Campaign Category */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Campaign Type</label>
              <select
                value={promoType}
                onChange={(e) => setPromoType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs transition-colors cursor-pointer"
              >
                {getCampaignTypes().map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Discount Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount Magnitude</label>
                <span className="text-xs font-black text-indigo-400">{discount}% OFF</span>
              </div>
              <input
                type="range"
                min="5"
                max="75"
                step="5"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full accent-indigo-500 cursor-ew-resize bg-slate-800 rounded-lg appearance-none h-1"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating || !selectedProduct}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs transition-all duration-300 disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-indigo-600/10 mt-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Drafting Kit...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate AI Marketing Kit</span>
                </>
              )}
            </button>

            {currentAsset && (
              <button
                type="button"
                onClick={handleClearWorkspace}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/5 text-slate-400 hover:text-rose-455 font-bold text-xs transition-all duration-300 mt-2 cursor-pointer"
              >
                <span>Clear Workspace</span>
              </button>
            )}
          </form>
        </div>

        {/* Right Column: Unified Stacked Workspace Output (AI Marketing Kit) */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Main workspace container */}
          {isGenerating ? (
            /* Loader */
            <div className="glass rounded-3xl p-12 border border-slate-800 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="h-10 w-10 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
              <h4 className="text-sm font-bold text-slate-350">NeuroBiz AI Compiling Marketing Kit...</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">Generating custom graphics poster, drafting caption copies, and assembling kit assets.</p>
            </div>
          ) : !currentAsset ? (
            /* Idle Placeholder */
            <div className="glass rounded-3xl p-12 border border-slate-800 text-center flex flex-col items-center justify-center min-h-[400px] border-dashed border-slate-850">
              <Megaphone className="h-12 w-12 text-slate-700 mb-3" />
              <h4 className="text-sm font-bold text-slate-400">Campaign Output Workspace</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">Submit your directives on the left. The system will compile the AI Marketing Poster and social messaging templates stacked on this workspace page.</p>
            </div>
          ) : (
            /* Exposed Stacked Workspace Feed - AI Marketing Kit */
            <div className="space-y-6 animate-in fade-in duration-300">

              {/* 1. MARKETING POSTER (Primary Hero Focus) */}
              <div className="glass rounded-3xl p-6 border border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4.5 w-4.5 text-indigo-400" />
                    <h3 className="text-sm font-extrabold text-slate-200">AI Marketing Poster</h3>
                  </div>
                  <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded-full uppercase">
                    HD Poster (800x1000)
                  </span>
                </div>

                {isRegeneratingPoster ? (
                  <div className="h-96 bg-slate-950 rounded-2xl border border-slate-850 flex flex-col items-center justify-center text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 mb-2" />
                    <span className="text-xs text-slate-500">AI regenerating poster layers...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    {/* Real preview matches download exactly */}
                    <div className="relative rounded-2xl overflow-hidden border border-slate-850/80 bg-slate-950 w-full max-w-[420px] shadow-2xl aspect-[4/5] flex items-center justify-center">
                      <img
                        src={currentAsset.posterUrl}
                        alt="NeuroBiz AI generated Poster preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />

                      {/* Premium UI Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/45 p-6 flex flex-col justify-between text-left pointer-events-none select-none">
                        {/* Top Section */}
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-xs font-black tracking-widest text-indigo-400 uppercase">NEUROBIZ AI</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">AUTOPILOT KIT</div>
                          </div>

                          {/* Circle Discount Badge */}
                          <div className={`h-16 w-16 rounded-full flex flex-col items-center justify-center border-2 border-white/90 text-white font-extrabold shadow-lg ${businessType === 'restaurant' ? 'bg-emerald-500 shadow-emerald-500/25' :
                            businessType === 'clothing' ? 'bg-pink-500 shadow-pink-500/25' :
                              'bg-indigo-650 shadow-indigo-650/25'
                            }`}>
                            <span className="text-lg leading-none">{currentAsset.discount || discount}%</span>
                            <span className="text-[7px] tracking-wider leading-none uppercase">OFF</span>
                          </div>
                        </div>

                        {/* Bottom Section */}
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <h2 className="text-xl font-black text-white leading-tight drop-shadow-md">
                              {(currentAsset.title || currentAsset.posterHeadline || promoType).toUpperCase()}
                            </h2>
                            <h3 className="text-xs font-extrabold text-indigo-300 drop-shadow-sm uppercase">
                              {currentAsset.product || selectedProduct}
                            </h3>
                          </div>

                          {/* CTA Overlay Card */}
                          <div className="py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-center text-white font-black text-xs uppercase tracking-widest shadow-md">
                            SHOP NOW
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 w-full border-t border-slate-850 pt-3">
                      <button
                        type="button"
                        onClick={handleRegenerateItem}
                        className="px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-250 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Regenerate Poster</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerDownload(currentAsset.posterUrl, `${currentAsset.product.toLowerCase().replace(/\s+/g, '_')}_poster.png`)}
                        className="px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-650/15"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Poster PNG</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. INSTAGRAM CAPTION CARD */}
              <div className="glass rounded-3xl p-6 border border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4.5 w-4.5 text-indigo-400" />
                    <h3 className="text-sm font-extrabold text-slate-200">Instagram Caption</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(currentAsset.instagram, 'instagram')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-250 text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    {copiedType === 'instagram' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedType === 'instagram' ? 'Copied' : 'Copy Caption'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/45 border border-slate-850 text-xs text-slate-350 leading-relaxed whitespace-pre-wrap select-all">
                  {currentAsset.instagram}
                </div>
              </div>

              {/* 3. WHATSAPP PROMOTION CARD */}
              <div className="glass rounded-3xl p-6 border border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4.5 w-4.5 text-indigo-400" />
                    <h3 className="text-sm font-extrabold text-slate-200">WhatsApp Promotional Message</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(currentAsset.whatsapp, 'whatsapp')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-250 text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    {copiedType === 'whatsapp' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedType === 'whatsapp' ? 'Copied' : 'Copy WhatsApp Message'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/45 border border-slate-850 text-xs font-mono text-slate-350 leading-relaxed whitespace-pre-wrap select-all">
                  {currentAsset.whatsapp}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
