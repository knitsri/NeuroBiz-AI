import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Upload, X } from 'lucide-react';

const defaultAvatars = [
  // 1. Indigo abstract gradient circle
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%236366f1"/><stop offset="100%" stop-color="%234338ca"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g1)"/><circle cx="50" cy="45" r="20" fill="%23ffffff" fill-opacity="0.8"/><path d="M20 85 C20 70, 80 70, 80 85" fill="%23ffffff" fill-opacity="0.8"/></svg>`,
  // 2. Emerald abstract gradient circle
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2310b981"/><stop offset="100%" stop-color="%23047857"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g2)"/><circle cx="50" cy="45" r="20" fill="%23ffffff" fill-opacity="0.8"/><path d="M20 85 C20 70, 80 70, 80 85" fill="%23ffffff" fill-opacity="0.8"/></svg>`,
  // 3. Purple abstract gradient circle
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23a855f7"/><stop offset="100%" stop-color="%237e22ce"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g3)"/><circle cx="50" cy="45" r="20" fill="%23ffffff" fill-opacity="0.8"/><path d="M20 85 C20 70, 80 70, 80 85" fill="%23ffffff" fill-opacity="0.8"/></svg>`,
  // 4. Amber abstract gradient circle
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f59e0b"/><stop offset="100%" stop-color="%23b45309"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g4)"/><circle cx="50" cy="45" r="20" fill="%23ffffff" fill-opacity="0.8"/><path d="M20 85 C20 70, 80 70, 80 85" fill="%23ffffff" fill-opacity="0.8"/></svg>`,
  // 5. Rose abstract gradient circle
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f43f5e"/><stop offset="100%" stop-color="%23be123c"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g5)"/><circle cx="50" cy="45" r="20" fill="%23ffffff" fill-opacity="0.8"/><path d="M20 85 C20 70, 80 70, 80 85" fill="%23ffffff" fill-opacity="0.8"/></svg>`,
  // 6. Cyan abstract gradient circle
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2306b6d4"/><stop offset="100%" stop-color="%230e7490"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g6)"/><circle cx="50" cy="45" r="20" fill="%23ffffff" fill-opacity="0.8"/><path d="M20 85 C20 70, 80 70, 80 85" fill="%23ffffff" fill-opacity="0.8"/></svg>`,
  // 7. Violet abstract futuristic geometric shapes
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g7" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%238b5cf6"/><stop offset="100%" stop-color="%235b21b6"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g7)"/><circle cx="35" cy="40" r="12" fill="%23ffffff" fill-opacity="0.9"/><circle cx="65" cy="40" r="12" fill="%23ffffff" fill-opacity="0.9"/><path d="M30 75 Q50 90 70 75" stroke="%23ffffff" stroke-width="6" stroke-linecap="round" fill="none" stroke-opacity="0.9"/></svg>`,
  // 8. Fuchia abstract happy robotic avatar
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g8" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23d946ef"/><stop offset="100%" stop-color="%23a21caf"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g8)"/><rect x="30" y="32" width="40" height="24" rx="8" fill="%23ffffff" fill-opacity="0.8"/><circle cx="42" cy="44" r="5" fill="%23a21caf"/><circle cx="58" cy="44" r="5" fill="%23a21caf"/><path d="M25 80 C25 65, 75 65, 75 80" fill="%23ffffff" fill-opacity="0.8"/></svg>`
];

export default function AvatarModal() {
  const { isAvatarModalOpen, setIsAvatarModalOpen, updateProfileAvatar, currentUser } = useApp();
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatarUrl || '');
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isAvatarModalOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const processFile = (file) => {
    if (!file) return;
    setErrorMsg('');

    // Accept PNG, JPG, WEBP
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Invalid file format. Please upload PNG, JPG, or WEBP.');
      return;
    }

    // Maximum 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedAvatar(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleApply = async () => {
    if (!selectedAvatar) {
      setErrorMsg('Please select or upload an avatar.');
      return;
    }
    setSaving(true);
    try {
      await updateProfileAvatar(selectedAvatar);
      setIsAvatarModalOpen(false);
    } catch (err) {
      console.error(err);
      setErrorMsg(`Failed to save avatar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 flex flex-col gap-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-850 pb-3">
          <h3 className="font-bold text-sm text-slate-200">Update Profile Picture</h3>
          <button 
            onClick={() => setIsAvatarModalOpen(false)} 
            className="text-slate-500 hover:text-slate-300 cursor-pointer font-bold text-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 text-[11px] font-semibold text-rose-455 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left Column: Drag/Drop and Grid */}
          <div className="flex flex-col gap-4">
            <div>
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Upload Custom Image</span>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                  dragOver ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 bg-slate-955 hover:border-slate-700'
                }`}
                onClick={() => document.getElementById('avatar-file-input').click()}
              >
                <Upload className="h-6 w-6 text-slate-500 mb-2" />
                <p className="text-[10px] text-slate-300 font-bold">Drag & Drop Image Here</p>
                <p className="text-[9px] text-slate-550 mt-1">PNG, JPG, WEBP up to 5MB</p>
                <button
                  type="button"
                  className="mt-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[10px] font-semibold transition-all cursor-pointer"
                >
                  Browse Files
                </button>
                <input
                  id="avatar-file-input"
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div>
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Choose Default Avatar</span>
              <div className="grid grid-cols-4 gap-2">
                {defaultAvatars.map((av, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedAvatar(av)}
                    className={`rounded-xl overflow-hidden border p-1 bg-slate-955 transition-all cursor-pointer ${
                      selectedAvatar === av ? 'border-indigo-500 shadow-md shadow-indigo-500/20' : 'border-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <img src={av} className="h-full w-full object-cover" alt={`Default ${idx + 1}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="flex flex-col items-center justify-center bg-slate-955 border border-slate-850 rounded-2xl p-4">
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-4 self-start">Live Preview</span>
            
            <div className="h-28 w-28 rounded-3xl bg-indigo-500/5 border-2 border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 text-4xl shadow-xl shadow-indigo-500/5 overflow-hidden">
              {selectedAvatar ? (
                <img src={selectedAvatar} className="h-full w-full object-cover" alt="Preview" />
              ) : (
                (currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()
              )}
            </div>

            <p className="text-[10px] text-slate-450 font-medium text-center mt-3 leading-tight max-w-[160px]">
              This is how your avatar will look in your dashboard profile boards.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-850 pt-4 mt-1">
          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(false)}
            className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-800/40 text-slate-400 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleApply}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-indigo-600/10 flex items-center gap-1.5"
          >
            {saving ? 'Applying...' : 'Apply Change'}
          </button>
        </div>
      </div>
    </div>
  );
}
