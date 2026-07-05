import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  CheckCircle2
} from 'lucide-react';

export default function Marketing() {
  const { inventory, generateMarketingContent, businessType } = useApp();

  const [selectedProduct, setSelectedProduct] = useState('');
  const [promoType, setPromoType] = useState('Clearance Promo');
  const [discount, setDiscount] = useState(20);
  
  // Load states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingPoster, setIsRegeneratingPoster] = useState(false);
  
  const [currentAsset, setCurrentAsset] = useState(null);
  
  // Feedback states
  const [copiedType, setCopiedType] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Canvas drawing generator to build base64 Data URLs in real-time matching selections
  const drawCanvasToDataUrl = (product, promoCat, discPct) => {
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

    // Main header
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px sans-serif';
    ctx.fillText(`${discPct}% OFF ON ${product.toUpperCase()}!`, 50, 240);

    // Subheader
    ctx.fillStyle = secondaryBrandColor;
    ctx.font = '800 22px sans-serif';
    ctx.fillText(`CAMPAIGN STAGE: ${promoCat.toUpperCase()}`, 50, 310);

    // Details text
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 16px sans-serif';
    ctx.fillText('AI-compiled promotional asset designed to boost local engagement.', 50, 400);
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

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsGenerating(true);
    
    // Simulate generation delay
    setTimeout(() => {
      // 1. Compile copy text details
      const textAsset = generateMarketingContent(selectedProduct, promoType, discount);
      
      // 2. Generate dynamic Canvas base64 images (completely decoupled matching user criteria)
      const posterData = drawCanvasToDataUrl(selectedProduct, promoType, discount);

      // 3. Set to state (guarantees preview & download match exactly!)
      setCurrentAsset({
        ...textAsset,
        posterUrl: posterData
      });
      
      setIsGenerating(false);
      setToastMsg('AI Marketing Kit compiled successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1550);
  };

  const handleRegenerateItem = () => {
    if (!currentAsset) return;
    
    setIsRegeneratingPoster(true);

    setTimeout(() => {
      // Generate matching canvas data with slightly offset discount or values for presentation
      const offsetDiscount = Math.min(Number(discount) + (Math.random() > 0.5 ? 5 : -5), 75);
      const newImgData = drawCanvasToDataUrl(selectedProduct, promoType, offsetDiscount);
      
      setCurrentAsset(prev => ({
        ...prev,
        title: `${offsetDiscount}% OFF on ${selectedProduct}!`,
        discount: offsetDiscount,
        posterUrl: newImgData
      }));

      setIsRegeneratingPoster(false);
      setToastMsg(`Regenerated alternative Poster visual!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 850);
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

  const triggerDownload = (dataUrl, fileName) => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();

    setToastMsg('Image downloaded successfully to local disk!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="pt-20 pl-72 pr-8 pb-12 min-h-screen text-slate-100 flex flex-col gap-6 relative">
      
      {/* Toast popup */}
      {showToast && (
        <div className="fixed top-20 right-8 z-50 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-450 text-xs font-bold animate-in slide-in-from-top-4 duration-300 flex items-center gap-2 shadow-xl shadow-emerald-950/20">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 font-semibold" />
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
            {/* SKU Dropdown */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target SKU / Product</label>
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
            </div>

            {/* Campaign Category */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Campaign Type</label>
              <select
                value={promoType}
                onChange={(e) => setPromoType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs transition-colors cursor-pointer"
              >
                <option value="Clearance Promo">Clearance (Liquidate dead stock)</option>
                <option value="Seasonal Discount">Seasonal Demand Spike</option>
                <option value="Flash Sale">Flash Sale (24-hour urgency)</option>
                <option value="Loyalty Discount">Loyalty Reward Campaign</option>
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
                    <div className="relative rounded-2xl overflow-hidden border border-slate-850/80 bg-slate-950 w-full max-w-[420px] shadow-2xl">
                      <img 
                        src={currentAsset.posterUrl} 
                        alt="NeuroBiz AI generated Poster preview" 
                        className="object-contain w-full h-auto max-h-[480px]" 
                      />
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
