import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Briefcase, 
  Truck, 
  Stethoscope, 
  ChefHat, 
  Shirt, 
  ArrowRight,
  Lock,
  Mail,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  Sparkles,
  ArrowLeft,
  Terminal,
  ShieldAlert
} from 'lucide-react';
import { signUpUser, loginUser } from '../services/auth';

const defaultDemoAccounts = {
  // Owners
  'owner-pharmacy@neurobiz.com': { name: 'Nitya Patel', businessName: 'NeuroBiz Pharmacy', role: 'owner', type: 'pharmacy' },
  'owner-restaurant@neurobiz.com': { name: 'Nitya Patel', businessName: 'NeuroBiz Restaurant', role: 'owner', type: 'restaurant' },
  'owner-clothing@neurobiz.com': { name: 'Nitya Patel', businessName: 'NeuroBiz Clothing', role: 'owner', type: 'clothing' },

  // Pharmacy Vendors
  'vendor@biomedsupplies.com': { name: 'Alex Rivera', businessName: 'BioMed Supplies', role: 'vendor', type: 'pharmacy' },
  'vendor@pharmadistribute.com': { name: 'John Pharma', businessName: 'PharmaDistribute Co.', role: 'vendor', type: 'pharmacy' },
  'vendor@apexpharma.com': { name: 'Apex Agent', businessName: 'Apex Pharma', role: 'vendor', type: 'pharmacy' },

  // Restaurant Vendors
  'vendor@metrofoodservices.com': { name: 'Metro Agent', businessName: 'Metro Food Services', role: 'vendor', type: 'restaurant' },
  'vendor@oceanfresh.com': { name: 'Ocean Agent', businessName: 'Ocean Fresh Seafood', role: 'vendor', type: 'restaurant' },
  'vendor@greengrow.com': { name: 'Grower Agent', businessName: 'GreenGrow Organics', role: 'vendor', type: 'restaurant' },

  // Clothing Vendors
  'vendor@texstyleapparel.com': { name: 'Style Agent', businessName: 'TexStyle Apparel', role: 'vendor', type: 'clothing' },
  'vendor@urbanwear.com': { name: 'Urban Agent', businessName: 'Urban Wear Wholesalers', role: 'vendor', type: 'clothing' },
  'vendor@eliteaccessories.com': { name: 'Elite Agent', businessName: 'Elite Accessories', role: 'vendor', type: 'clothing' }
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { initializeBusiness } = useApp();

  // Read URL query parameters to jump straight to login if they exist
  const initialUrlRole = searchParams.get('role');
  const initialUrlType = searchParams.get('type');

  // Progressive Onboarding Steps:
  // 1: Role Selection (Owner vs Vendor)
  // 2: Business Model Selection (Pharmacy, Restaurant, Clothing)
  // 'transitioning': Cinematic warp and OS initialising overlay
  // 'login': Login / Registration forms
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null); // 'owner' | 'vendor'
  const [selectedBizType, setSelectedBizType] = useState(null); // 'pharmacy' | 'restaurant' | 'clothing'

  // Firebase auth state variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showDemoHelper, setShowDemoHelper] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Transition terminal logs state
  const [logIndex, setLogIndex] = useState(0);
  const logs = [
    "NEUROBIZ OS v2.0.26 — Booting virtual synapses...",
    "Establishing secure quantum Firestore tunnel...",
    "Syncing AI predictive model checkpoints...",
    "Deploying business autopilot systems..."
  ];

  // Canvas particle and background animation controls
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const burstParticlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const speedMultiplierRef = useRef(1.0);
  const particlesColorRef = useRef('#7C5CFF'); // Purple default

  // Mouse Pos for cursor spotlights and parallax tilt
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [cursorHovered, setCursorHovered] = useState(false);

  // 3D Card Tilt handlers
  const [ownerCardTilt, setOwnerCardTilt] = useState({ x: 0, y: 0 });
  const [vendorCardTilt, setVendorCardTilt] = useState({ x: 0, y: 0 });
  const [pharmacyTilt, setPharmacyTilt] = useState({ x: 0, y: 0 });
  const [restaurantTilt, setRestaurantTilt] = useState({ x: 0, y: 0 });
  const [clothingTilt, setClothingTilt] = useState({ x: 0, y: 0 });

  // Page Intro states (for 0-2200ms spring reveals)
  const [introStage, setIntroStage] = useState('start');

  // Trigger page load animation stages
  useEffect(() => {
    // Stage 1: Fade background, particles move (0ms)
    setIntroStage('bg');

    // Stage 2: Logo scales in, glow pulse (500ms)
    const t1 = setTimeout(() => setIntroStage('logo'), 500);

    // Stage 3: Title and subtitle fade up (1000ms)
    const t2 = setTimeout(() => setIntroStage('title'), 1000);

    // Stage 4: Onboarding container slides up (1500ms)
    const t3 = setTimeout(() => setIntroStage('card'), 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Jump to login directly if routing parameters exist in URL
  useEffect(() => {
    if (initialUrlRole) {
      setSelectedRole(initialUrlRole);
      if (initialUrlType) setSelectedBizType(initialUrlType);
      setStep('login');
    }
  }, [initialUrlRole, initialUrlType]);

  // Autopopulate helper logins depending on settings
  useEffect(() => {
    setAuthError('');
    if (!isRegistering) {
      if (selectedRole === 'owner') {
        const finalType = selectedBizType || 'pharmacy';
        setEmail(`owner-${finalType}@neurobiz.com`);
        setPassword('password123');
      } else {
        setEmail('vendor@biomedsupplies.com');
        setPassword('password123');
      }
    }
  }, [selectedRole, selectedBizType, isRegistering]);

  // Sync cursor position
  useEffect(() => {
    const updateMouse = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', updateMouse);
    return () => window.removeEventListener('mousemove', updateMouse);
  }, []);

  // Set colors based on chosen paths
  useEffect(() => {
    if (selectedRole === 'vendor') {
      particlesColorRef.current = '#4F8BFF'; // Blue
    } else if (selectedBizType === 'pharmacy') {
      particlesColorRef.current = '#5EE9FF'; // Cyan
    } else if (selectedBizType === 'restaurant') {
      particlesColorRef.current = '#E95EAE'; // Pinkish-Red
    } else {
      particlesColorRef.current = '#7C5CFF'; // Purple
    }
  }, [selectedRole, selectedBizType]);

  // Interactive Particle canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate initial floating particles
    const particleCount = Math.min(70, Math.floor((width * height) / 20000));
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? '#7C5CFF' : '#4F8BFF',
        alpha: Math.random() * 0.5 + 0.2,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 1.8 + 0.6,
      });
    }
    particlesRef.current = particles;

    const render = () => {
      // Create trailing streak visual effect when clearing background during hyperspace transition
      if (speedMultiplierRef.current > 2.0) {
        ctx.fillStyle = 'rgba(5, 8, 22, 0.25)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      const activeColor = particlesColorRef.current;
      const speed = speedMultiplierRef.current;

      // Draw and update background particles (gentle drift)
      particles.forEach((p) => {
        p.x += p.vx * speed;
        p.y += p.vy * speed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * (speed > 5 ? 1.5 : 1), 0, Math.PI * 2);
        ctx.fillStyle = activeColor;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = speed > 5 ? 10 : 0;
        ctx.shadowColor = activeColor;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      });

      // Update and draw transient particle bursts (from clicks)
      const burst = burstParticlesRef.current;
      for (let i = burst.length - 1; i >= 0; i--) {
        const bp = burst[i];
        bp.x += bp.vx;
        bp.y += bp.vy;
        bp.life -= 0.02;

        if (bp.life <= 0) {
          burst.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(bp.x, bp.y, bp.radius, 0, Math.PI * 2);
        ctx.fillStyle = bp.color;
        ctx.globalAlpha = bp.life;
        ctx.shadowBlur = 8;
        ctx.shadowColor = bp.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw connection lines between nearby particles and user mouse spotlight
      ctx.globalAlpha = 1.0;
      const maxDistance = 140;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Connection to other particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1.0 - dist / maxDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = activeColor;
            ctx.globalAlpha = speed > 5 ? alpha * 0.4 : alpha;
            ctx.lineWidth = speed > 5 ? 0.7 : 0.9;
            ctx.stroke();
          }
        }

        // Connection to cursor
        if (mouseRef.current.x > 0 && speedMultiplierRef.current < 5.0) {
          const dx = p1.x - mouseRef.current.x;
          const dy = p1.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            const alpha = (1.0 - dist / 180) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.strokeStyle = activeColor;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Spawn Particle burst helper (click events)
  const spawnBurst = (x, y, color = '#7C5CFF') => {
    const burst = burstParticlesRef.current;
    const count = 35;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1.5;
      burst.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 2.5 + 1,
        color,
        life: 1.0,
      });
    }
  };

  // 3D Card Tilt calculator
  const handleCardTilt = (e, setTilt) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Normalize and scale rotation
    setTilt({
      x: (x / (rect.width / 2)) * 8, // rotation limits
      y: (y / (rect.height / 2)) * 8,
    });
  };

  const resetCardTilt = (setTilt) => {
    setTilt({ x: 0, y: 0 });
  };

  // Step 1 Role Selection handler
  const selectRole = (role, e) => {
    if (selectedRole === role) return;

    setSelectedRole(role);
    setSelectedBizType(null); // Reset biz selection on role switch

    // Spawn interactive particle burst
    const clickX = e.clientX || window.innerWidth / 2;
    const clickY = e.clientY || window.innerHeight / 2;
    spawnBurst(clickX, clickY, role === 'owner' ? '#7C5CFF' : '#4F8BFF');

    // Smooth delay before unlocking next step (Step 2 or Cinematic OS launch)
    if (role === 'owner') {
      setTimeout(() => {
        setStep(2);
      }, 700);
    }
  };

  // Step 3 / Login Cinematic Boot Trigger
  const triggerBootSequence = () => {
    setStep('transitioning');
    setLogIndex(0);

    // Easing speedmultiplier to replicate hyper-warp engine
    let t = 0;
    const interval = setInterval(() => {
      t += 0.05;
      // Hyper acceleration curves
      speedMultiplierRef.current = 1.0 + Math.pow(t, 2) * 12;
      if (t >= 1.2) clearInterval(interval);
    }, 40);

    // Stagger terminal lines typing
    const logInterval = setInterval(() => {
      setLogIndex((prev) => {
        if (prev >= logs.length - 1) {
          clearInterval(logInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 300);

    // Complete transition and show Form
    setTimeout(() => {
      clearInterval(interval);
      clearInterval(logInterval);
      setStep('login');

      // Decay particle speeds back to gentle drift
      let speed = speedMultiplierRef.current;
      const decay = setInterval(() => {
        speed *= 0.85;
        if (speed <= 1.0) {
          speedMultiplierRef.current = 1.0;
          clearInterval(decay);
        } else {
          speedMultiplierRef.current = speed;
        }
      }, 30);
    }, 1800);
  };

  // Submit Sign In / Registration Form to Firebase auth
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setAuthError('');
    setAuthLoading(true);

    try {
      let finalRole = selectedRole;
      if (isRegistering) {
        const finalName = name || (selectedRole === 'owner' ? 'Nitya Patel' : 'Alex Rivera');
        const finalBizName = businessName || (selectedRole === 'owner' 
          ? `NeuroBiz ${selectedBizType.charAt(0).toUpperCase() + selectedBizType.slice(1)}` 
          : 'BioMed Supplies');

        await signUpUser(email, password, selectedRole, selectedBizType || 'pharmacy', finalBizName, finalName);
      } else {
        let profile;
        try {
          profile = await loginUser(email, password);
        } catch (err) {
          // Auto create account if it is a Demo credential to facilitate swift debugging
          const demoAccount = defaultDemoAccounts[email.toLowerCase()];
          if (demoAccount && password === 'password123') {
            profile = await signUpUser(
              email, 
              password, 
              demoAccount.role, 
              demoAccount.type, 
              demoAccount.businessName, 
              demoAccount.name
            );
          } else {
            throw err;
          }
        }
        if (profile && profile.role) {
          finalRole = profile.role;
        }
      }

      // Redirect into the corresponding dashboard routes
      if (finalRole === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/vendor/dashboard');
      }
    } catch (err) {
      console.error(err);
      let errMsg = err.message || 'Authentication failed. Please check credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errMsg = isRegistering 
          ? 'Failed to register demo account.' 
          : 'Account not found. Select a demo helper credential below, or switch to Register mode.';
      }
      setAuthError(errMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Back trigger to restart onboarding steps
  const resetOnboarding = () => {
    setSelectedRole(null);
    setSelectedBizType(null);
    setStep(1);
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen w-screen bg-[#050816] text-[#FFFFFF] font-space flex flex-col items-center justify-center p-4 relative overflow-hidden select-none cursor-none perspective-1000"
      style={{
        backgroundImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(124, 92, 255, 0.07) 0%, transparent 60%)`
      }}
    >
      {/* Interactive Custom Cursor Ring */}
      <div 
        className={`fixed top-0 left-0 w-8 h-8 rounded-full border border-purple-500/50 pointer-events-none -translate-x-1/2 -translate-y-1/2 z-50 transition-transform duration-75 ease-out ${
          cursorHovered ? 'scale-150 border-cyan-400 bg-cyan-500/10' : ''
        }`}
        style={{
          left: mousePos.x,
          top: mousePos.y,
        }}
      />
      {/* Central Cursor Spot */}
      <div 
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-50"
        style={{
          left: mousePos.x,
          top: mousePos.y,
        }}
      />

      {/* BACKGROUND ELEMENTS */}
      {/* Dynamic Cosmic Background Looping Video in its blurred, dark, frosted state */}
      <video
        src="/cosmic-video.mp4"
        poster="/cosmic-background.jpg"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none z-0 brightness-[0.26] blur-[18px]"
      />

      {/* Interactive Canvas for Neural Networks & Floating particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Moving Ambient Auroras */}
      <div className="absolute top-[-25%] left-[-15%] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-800/10 to-indigo-700/10 blur-[130px] animate-float-slow pointer-events-none z-0" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-r from-cyan-600/10 to-blue-700/10 blur-[140px] animate-float-slow pointer-events-none z-0" style={{ animationDelay: '-3s' }} />
      <div className="absolute top-[35%] right-[20%] w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-900/5 via-fuchsia-950/5 to-cyan-950/5 blur-[120px] pointer-events-none z-0" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 grid-overlay pointer-events-none z-0 opacity-80" />
      <div className="absolute inset-0 noise-overlay pointer-events-none z-0" />

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-4xl z-10 flex flex-col items-center">
        
        {/* HEADER BRANDING PANEL */}
        <AnimatePresence>
          {step !== 'transitioning' && (
            <motion.header
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={introStage !== 'start' && introStage !== 'bg' ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -20 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              className="text-center mb-8 flex flex-col items-center relative z-20"
            >
              {/* Animated Glowing AI Badge */}
              <div 
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/20 border border-purple-500/20 shadow-[0_0_15px_rgba(124,92,255,0.1)] mb-4 hover:border-purple-400/40 transition-colors duration-300"
                onMouseEnter={() => setCursorHovered(true)}
                onMouseLeave={() => setCursorHovered(false)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#7C5CFF]" />
                <span className="text-[9px] font-bold tracking-widest text-[#B7C0D8] uppercase font-inter">
                  Powered by Artificial Intelligence
                </span>
              </div>

              {/* Breathing OS Logo and Gradient Title */}
              <div 
                className="flex items-center justify-center gap-3.5 mb-3 cursor-pointer group"
                onClick={resetOnboarding}
                onMouseEnter={() => setCursorHovered(true)}
                onMouseLeave={() => setCursorHovered(false)}
              >
                <div className="p-3.5 bg-gradient-to-br from-[#7C5CFF]/15 to-[#4F8BFF]/5 border border-purple-500/30 rounded-2xl flex items-center justify-center animate-breathing shadow-[0_0_30px_rgba(124,92,255,0.15)] group-hover:border-purple-400/50 transition-colors duration-500">
                  <Brain className="h-9 w-9 text-[#5EE9FF]" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-widest text-gradient-purple-blue drop-shadow-[0_0_15px_rgba(124,92,255,0.15)] font-space select-none">
                  NEUROBIZ AI
                </h1>
              </div>

              {/* Subtitle with soft fade */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={introStage === 'title' || introStage === 'card' ? { opacity: 1 } : { opacity: 0 }}
                className="text-base md:text-lg text-[#B7C0D8] font-bold font-space tracking-wide drop-shadow-md"
              >
                &ldquo;The Brain Behind Your Business.&rdquo;
              </motion.p>
            </motion.header>
          )}
        </AnimatePresence>

        {/* PROGRESSIVE ONBOARDING STEPS */}
        <AnimatePresence mode="wait">
          
          {/* STEP 1: ROLE SELECTION CARDS */}
          {step === 1 && introStage === 'card' && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 35, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -25, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 70, damping: 14 }}
              className="w-full max-w-2xl glass-premium rounded-[32px] p-8 border border-white/5 relative z-10 flex flex-col items-center animate-float-slow shadow-2xl"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(124, 92, 255, 0.05)'
              }}
            >
              <h2 className="text-xl md:text-2xl font-bold text-gradient-premium tracking-wide mb-6 uppercase text-center font-space">
                System Interface: Choose Role
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-2">
                
                {/* Business Owner Role Card */}
                <div 
                  className={`glass-card-interactive border-sweep-container rounded-[24px] cursor-pointer p-8 flex flex-col items-center text-center transition-all duration-500 border ${
                    selectedRole === 'owner' 
                      ? 'bg-gradient-to-b from-[#7C5CFF]/15 to-[#7C5CFF]/5 border-purple-500/40 shadow-glow-purple scale-[1.02]' 
                      : selectedRole === 'vendor'
                        ? 'opacity-40 border-white/5 bg-white/2 scale-[0.98]'
                        : 'bg-white/[0.02] border-white/5 hover:border-purple-500/30 hover:shadow-glow-purple hover:scale-[1.04]'
                  }`}
                  style={{
                    transform: `perspective(1000px) rotateX(${-ownerCardTilt.y}deg) rotateY(${ownerCardTilt.x}deg) translateZ(10px)`
                  }}
                  onMouseMove={(e) => handleCardTilt(e, setOwnerCardTilt)}
                  onMouseLeave={() => {
                    resetCardTilt(setOwnerCardTilt);
                    setCursorHovered(false);
                  }}
                  onMouseEnter={() => setCursorHovered(true)}
                  onClick={(e) => selectRole('owner', e)}
                >
                  <div className="border-sweep-light" />
                  
                  {/* Icon Panel with bounce */}
                  <div className={`p-5 rounded-2xl mb-5 border transition-all duration-500 ${
                    selectedRole === 'owner'
                      ? 'bg-purple-500/25 border-purple-500/50 text-[#FFFFFF] shadow-[0_0_20px_rgba(124,92,255,0.3)]'
                      : 'bg-black/40 border-white/5 text-[#B7C0D8]'
                  }`}>
                    <Briefcase className="h-9 w-9 animate-pulse" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 font-space">Business Owner</h3>
                  <p className="text-xs text-[#7B849E] leading-relaxed max-w-[200px] font-inter">
                    Direct inventory streams, scan operations, and deploy predictive social campaigns.
                  </p>

                  {/* Animated Selection Check */}
                  {selectedRole === 'owner' && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-4 right-4 p-1.5 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center"
                    >
                      <Check className="h-3 w-3 text-purple-400" />
                    </motion.div>
                  )}
                </div>

                {/* Vendor Partner Role Card */}
                <div 
                  className={`glass-card-interactive border-sweep-container rounded-[24px] cursor-pointer p-8 flex flex-col items-center text-center transition-all duration-500 border ${
                    selectedRole === 'vendor' 
                      ? 'bg-gradient-to-b from-[#4F8BFF]/15 to-[#4F8BFF]/5 border-blue-500/40 shadow-glow-blue scale-[1.02]' 
                      : selectedRole === 'owner'
                        ? 'opacity-40 border-white/5 bg-white/2 scale-[0.98]'
                        : 'bg-white/[0.02] border-white/5 hover:border-blue-500/30 hover:shadow-glow-blue hover:scale-[1.04]'
                  }`}
                  style={{
                    transform: `perspective(1000px) rotateX(${-vendorCardTilt.y}deg) rotateY(${vendorCardTilt.x}deg) translateZ(10px)`
                  }}
                  onMouseMove={(e) => handleCardTilt(e, setVendorCardTilt)}
                  onMouseLeave={() => {
                    resetCardTilt(setVendorCardTilt);
                    setCursorHovered(false);
                  }}
                  onMouseEnter={() => setCursorHovered(true)}
                  onClick={(e) => selectRole('vendor', e)}
                >
                  <div className="border-sweep-light" style={{ background: 'conic-gradient(from 0deg, transparent, rgba(79, 139, 255, 0.8), rgba(94, 233, 255, 0.8), transparent 40%)' }} />
                  
                  <div className={`p-5 rounded-2xl mb-5 border transition-all duration-500 ${
                    selectedRole === 'vendor'
                      ? 'bg-blue-500/25 border-blue-500/50 text-[#FFFFFF] shadow-[0_0_20px_rgba(79,139,255,0.3)]'
                      : 'bg-black/40 border-white/5 text-[#B7C0D8]'
                  }`}>
                    <Truck className="h-9 w-9 animate-pulse" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 font-space">Vendor Partner</h3>
                  <p className="text-xs text-[#7B849E] leading-relaxed max-w-[200px] font-inter">
                    Fulfill procurement contracts, ship RESTOCK runs, and coordinate wholesale transactions.
                  </p>

                  {/* Animated Selection Check */}
                  {selectedRole === 'vendor' && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-4 right-4 p-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center"
                    >
                      <Check className="h-3 w-3 text-blue-400" />
                    </motion.div>
                  )}
                </div>

              </div>

              {/* Automatic vendor reveal triggers loading screen */}
              {selectedRole === 'vendor' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 w-full"
                >
                  <button 
                    onClick={triggerBootSequence}
                    className="w-full btn-shimmer flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(79,139,255,0.25)] hover:shadow-[0_0_35px_rgba(79,139,255,0.4)] active:scale-95 transition-all duration-300"
                    onMouseEnter={() => setCursorHovered(true)}
                    onMouseLeave={() => setCursorHovered(false)}
                  >
                    <span>Connect Vendor Account &rarr;</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 2: BUSINESS MODEL SELECTION CARDS */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 35, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -25, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 70, damping: 14 }}
              className="w-full max-w-3xl glass-premium rounded-[32px] p-8 border border-white/5 relative z-10 flex flex-col items-center animate-float-slow"
            >
              <div className="flex items-center justify-between w-full mb-6 border-b border-white/5 pb-4">
                <button
                  onClick={resetOnboarding}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#7B849E] hover:text-[#FFFFFF] uppercase tracking-wider transition-colors duration-300"
                  onMouseEnter={() => setCursorHovered(true)}
                  onMouseLeave={() => setCursorHovered(false)}
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Back to Role</span>
                </button>
                <h2 className="text-base font-bold text-[#B7C0D8] uppercase tracking-widest font-space">
                  Initialize Business Node
                </h2>
                <div className="w-14 h-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center px-0.5">
                  <div className="w-1/2 h-full rounded-full bg-purple-500" />
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-gradient-premium tracking-wide mb-8 uppercase text-center font-space">
                Select Operating Environment
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mb-8">
                
                {/* Pharmacy Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.0 }}
                  className={`glass-card-interactive border-sweep-container rounded-[24px] cursor-pointer p-6 flex flex-col items-center text-center transition-all duration-500 border ${
                    selectedBizType === 'pharmacy'
                      ? 'bg-gradient-to-b from-[#5EE9FF]/15 to-[#5EE9FF]/5 border-cyan-500/40 shadow-glow-cyan scale-[1.02]'
                      : selectedBizType 
                        ? 'opacity-40 border-white/5 bg-white/2 scale-[0.98]'
                        : 'bg-white/[0.02] border-white/5 hover:border-cyan-500/30 hover:shadow-glow-cyan hover:scale-[1.04]'
                  }`}
                  style={{
                    transform: `perspective(1000px) rotateX(${-pharmacyTilt.y}deg) rotateY(${pharmacyTilt.x}deg) translateZ(10px)`
                  }}
                  onMouseMove={(e) => handleCardTilt(e, setPharmacyTilt)}
                  onMouseLeave={() => {
                    resetCardTilt(setPharmacyTilt);
                    setCursorHovered(false);
                  }}
                  onMouseEnter={() => setCursorHovered(true)}
                  onClick={(e) => {
                    setSelectedBizType('pharmacy');
                    spawnBurst(e.clientX, e.clientY, '#5EE9FF');
                  }}
                >
                  <div className="border-sweep-light" style={{ background: 'conic-gradient(from 0deg, transparent, rgba(94, 233, 255, 0.8), rgba(124, 92, 255, 0.8), transparent 40%)' }} />

                  <div className={`p-4 rounded-xl mb-4 border transition-all duration-500 ${
                    selectedBizType === 'pharmacy'
                      ? 'bg-cyan-500/25 border-cyan-500/50 text-[#FFFFFF] shadow-[0_0_15px_rgba(94,233,255,0.25)]'
                      : 'bg-black/40 border-white/5 text-[#B7C0D8]'
                  }`}>
                    <Stethoscope className="h-7 w-7 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5 font-space">Pharmacy</h3>
                  <p className="text-[11px] text-[#7B849E] leading-relaxed font-inter">
                    Autopilot critical medicine stock, secure vendor chains, and run compliance scans.
                  </p>

                  {selectedBizType === 'pharmacy' && (
                    <motion.div 
                      layoutId="bizCheck"
                      className="absolute top-3 right-3 p-1 rounded-full bg-cyan-500/20 border border-cyan-400/40"
                    >
                      <Check className="h-2.5 w-2.5 text-cyan-400" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Restaurant Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className={`glass-card-interactive border-sweep-container rounded-[24px] cursor-pointer p-6 flex flex-col items-center text-center transition-all duration-500 border ${
                    selectedBizType === 'restaurant'
                      ? 'bg-gradient-to-b from-[#E95EAE]/15 to-[#E95EAE]/5 border-pink-500/40 shadow-[0_0_30px_rgba(233,94,174,0.255)] scale-[1.02]'
                      : selectedBizType 
                        ? 'opacity-40 border-white/5 bg-white/2 scale-[0.98]'
                        : 'bg-white/[0.02] border-white/5 hover:border-pink-500/30 hover:shadow-[0_0_30px_rgba(233,94,174,0.255)] hover:scale-[1.04]'
                  }`}
                  style={{
                    transform: `perspective(1000px) rotateX(${-restaurantTilt.y}deg) rotateY(${restaurantTilt.x}deg) translateZ(10px)`
                  }}
                  onMouseMove={(e) => handleCardTilt(e, setRestaurantTilt)}
                  onMouseLeave={() => {
                    resetCardTilt(setRestaurantTilt);
                    setCursorHovered(false);
                  }}
                  onMouseEnter={() => setCursorHovered(true)}
                  onClick={(e) => {
                    setSelectedBizType('restaurant');
                    spawnBurst(e.clientX, e.clientY, '#E95EAE');
                  }}
                >
                  <div className="border-sweep-light" style={{ background: 'conic-gradient(from 0deg, transparent, rgba(233, 94, 174, 0.8), rgba(79, 139, 255, 0.8), transparent 40%)' }} />

                  <div className={`p-4 rounded-xl mb-4 border transition-all duration-500 ${
                    selectedBizType === 'restaurant'
                      ? 'bg-pink-500/25 border-pink-500/50 text-[#FFFFFF] shadow-[0_0_15px_rgba(233,94,174,0.255)]'
                      : 'bg-black/40 border-white/5 text-[#B7C0D8]'
                  }`}>
                    <ChefHat className="h-7 w-7 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5 font-space">Restaurant</h3>
                  <p className="text-[11px] text-[#7B849E] leading-relaxed font-inter">
                    Predict ingredient depletion, streamline supplier logistics, and auto-generate promotions.
                  </p>

                  {selectedBizType === 'restaurant' && (
                    <motion.div 
                      layoutId="bizCheck"
                      className="absolute top-3 right-3 p-1 rounded-full bg-pink-500/20 border border-pink-400/40"
                    >
                      <Check className="h-2.5 w-2.5 text-pink-400" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Clothing Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`glass-card-interactive border-sweep-container rounded-[24px] cursor-pointer p-6 flex flex-col items-center text-center transition-all duration-500 border ${
                    selectedBizType === 'clothing'
                      ? 'bg-gradient-to-b from-[#7C5CFF]/15 to-[#7C5CFF]/5 border-purple-500/40 shadow-glow-purple scale-[1.02]'
                      : selectedBizType 
                        ? 'opacity-40 border-white/5 bg-white/2 scale-[0.98]'
                        : 'bg-white/[0.02] border-white/5 hover:border-purple-500/30 hover:shadow-glow-purple hover:scale-[1.04]'
                  }`}
                  style={{
                    transform: `perspective(1000px) rotateX(${-clothingTilt.y}deg) rotateY(${clothingTilt.x}deg) translateZ(10px)`
                  }}
                  onMouseMove={(e) => handleCardTilt(e, setClothingTilt)}
                  onMouseLeave={() => {
                    resetCardTilt(setClothingTilt);
                    setCursorHovered(false);
                  }}
                  onMouseEnter={() => setCursorHovered(true)}
                  onClick={(e) => {
                    setSelectedBizType('clothing');
                    spawnBurst(e.clientX, e.clientY, '#7C5CFF');
                  }}
                >
                  <div className="border-sweep-light" />

                  <div className={`p-4 rounded-xl mb-4 border transition-all duration-500 ${
                    selectedBizType === 'clothing'
                      ? 'bg-purple-500/25 border-purple-500/50 text-[#FFFFFF] shadow-[0_0_15px_rgba(124,92,255,0.25)]'
                      : 'bg-black/40 border-white/5 text-[#B7C0D8]'
                  }`}>
                    <Shirt className="h-7 w-7 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5 font-space">Clothing</h3>
                  <p className="text-[11px] text-[#7B849E] leading-relaxed font-inter">
                    Coordinate catalog inventory, model sizing restocks, and generate social campaign copy.
                  </p>

                  {selectedBizType === 'clothing' && (
                    <motion.div 
                      layoutId="bizCheck"
                      className="absolute top-3 right-3 p-1 rounded-full bg-purple-500/20 border border-purple-400/40"
                    >
                      <Check className="h-2.5 w-2.5 text-purple-400" />
                    </motion.div>
                  )}
                </motion.div>

              </div>

              {/* Continue button triggers Step 3 OS loading */}
              <AnimatePresence>
                {selectedBizType && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.98 }}
                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.98 }}
                    className="w-full"
                  >
                    <button 
                      onClick={triggerBootSequence}
                      className="w-full btn-shimmer group flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(124,92,255,0.25)] hover:shadow-[0_0_35px_rgba(124,92,255,0.45)] active:scale-[0.98] transition-all duration-300"
                      onMouseEnter={() => setCursorHovered(true)}
                      onMouseLeave={() => setCursorHovered(false)}
                    >
                      <span>Continue to Initialization</span>
                      <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* STEP 3: CINEMATIC WARP & OS INITIALIZING SCREEN */}
          {step === 'transitioning' && (
            <motion.div
              key="transition"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/70 backdrop-blur-2xl"
            >
              <div className="max-w-md w-full p-8 flex flex-col items-center text-center">
                {/* Logo pulse */}
                <div className="p-5 bg-purple-500/10 border border-purple-500/30 rounded-3xl animate-breathing shadow-[0_0_50px_rgba(124,92,255,0.3)] mb-8">
                  <Brain className="h-12 w-12 text-[#5EE9FF]" />
                </div>

                <h2 className="text-2xl font-black tracking-widest text-gradient-purple-blue mb-2 font-space uppercase">
                  NEUROBIZ OS
                </h2>
                <div className="flex items-center gap-2 text-xs text-[#5EE9FF] font-bold uppercase tracking-wider mb-8">
                  <span className="w-2 h-2 bg-[#5EE9FF] rounded-full animate-ping" />
                  <span>Loading intelligent workspace...</span>
                </div>

                {/* Staggered Terminal Loading Logs */}
                <div className="w-full glass-premium-strong rounded-2xl p-5 border border-purple-500/20 text-left font-space text-xs space-y-3 leading-relaxed shadow-lg">
                  <div className="flex items-center gap-2 text-slate-500 font-bold border-b border-white/5 pb-2 mb-1">
                    <Terminal className="h-3.5 w-3.5 text-purple-400" />
                    <span>SYSTEM KERNEL CONSOLE</span>
                  </div>
                  {logs.slice(0, logIndex + 1).map((log, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2.5 text-[#B7C0D8]"
                    >
                      <span className="text-[#5EE9FF] font-black font-inter">&#10003;</span>
                      <span>{log}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: PREMIUM LOGIN & REGISTER FORMS */}
          {step === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 35, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 70, damping: 15 }}
              className="w-full max-w-md glass-premium rounded-[32px] p-8 border border-white/5 relative z-10 shadow-2xl flex flex-col"
              style={{
                boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 50px rgba(124, 92, 255, 0.08)'
              }}
            >
              {/* Back controls */}
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <button
                  onClick={resetOnboarding}
                  className="flex items-center gap-1 text-[10px] font-bold text-[#7B849E] hover:text-[#FFFFFF] uppercase tracking-wider transition-colors duration-300"
                  onMouseEnter={() => setCursorHovered(true)}
                  onMouseLeave={() => setCursorHovered(false)}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Reset Flow</span>
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_#7C5CFF]" />
                  <span className="text-[10px] font-bold text-[#5EE9FF] uppercase tracking-widest">
                    SECURE CONSOLE
                  </span>
                </div>
              </div>

              {/* Login Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase font-space">
                  {isRegistering ? 'Register Node' : 'Sign In Terminal'}
                </h2>
                <p className="text-xs text-[#7B849E] mt-1.5 font-inter">
                  {selectedRole === 'owner' 
                    ? `Accessing autopilot dashboard for: ${selectedBizType?.toUpperCase()}` 
                    : 'Accessing vendor procurement portal'}
                </p>
                <div className="h-0.5 w-12 bg-gradient-to-r from-purple-500 to-cyan-400 mx-auto mt-4 rounded-full" />
              </div>

              {/* Error Box */}
              {authError && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold text-center leading-relaxed flex items-center gap-2 justify-center"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </motion.div>
              )}

              {/* Form Input fields */}
              <form onSubmit={handleAuthSubmit} className="space-y-4 font-space">
                {isRegistering && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-[#B7C0D8] uppercase tracking-widest font-space">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nitya Patel"
                        className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs transition-all"
                        onMouseEnter={() => setCursorHovered(true)}
                        onMouseLeave={() => setCursorHovered(false)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-[#B7C0D8] uppercase tracking-widest font-space">Business Name</label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Metro Pharmacy"
                        className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs transition-all"
                        onMouseEnter={() => setCursorHovered(true)}
                        onMouseLeave={() => setCursorHovered(false)}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-[#B7C0D8] uppercase tracking-widest font-space">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@business.com"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs transition-all"
                      onMouseEnter={() => setCursorHovered(true)}
                      onMouseLeave={() => setCursorHovered(false)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-[#B7C0D8] uppercase tracking-widest font-space">Security Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs transition-all"
                      onMouseEnter={() => setCursorHovered(true)}
                      onMouseLeave={() => setCursorHovered(false)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-350 cursor-pointer flex items-center justify-center"
                      onMouseEnter={() => setCursorHovered(true)}
                      onMouseLeave={() => setCursorHovered(false)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Secure Auth CTA Button */}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full btn-shimmer flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold text-xs transition-all duration-300 shadow-[0_0_20px_rgba(124,92,255,0.2)] hover:shadow-[0_0_30px_rgba(124,92,255,0.35)] cursor-pointer disabled:cursor-not-allowed"
                  onMouseEnter={() => setCursorHovered(true)}
                  onMouseLeave={() => setCursorHovered(false)}
                >
                  {authLoading ? (
                    <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <>
                      <span>{isRegistering ? 'Register Operating Node' : 'Initialize Business Terminal'}</span>
                      <ArrowRight className="h-4.5 w-4.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Form toggles */}
              <div className="text-center mt-6 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-[10px] font-bold text-[#7B849E] hover:text-white uppercase tracking-widest cursor-pointer transition-colors duration-300"
                  onMouseEnter={() => setCursorHovered(true)}
                  onMouseLeave={() => setCursorHovered(false)}
                >
                  {isRegistering ? 'Already synchronized? Sign In' : 'Create new company node'}
                </button>
              </div>

              {/* DEMO CREDENTIALS HARNESS */}
              <div className="mt-5 bg-black/30 border border-white/5 rounded-2xl p-4 text-[11px]">
                <button 
                  type="button" 
                  onClick={() => setShowDemoHelper(!showDemoHelper)}
                  className="flex items-between justify-between w-full text-[#B7C0D8] font-bold hover:text-white transition-colors cursor-pointer"
                  onMouseEnter={() => setCursorHovered(true)}
                  onMouseLeave={() => setCursorHovered(false)}
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    <span>Demo Accounts Console</span>
                  </div>
                  <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-[#7B849E]">
                    {showDemoHelper ? 'Hide' : 'Expand'}
                  </span>
                </button>

                {showDemoHelper && (
                  <div className="mt-3.5 space-y-4 animate-in fade-in duration-300 text-left border-t border-white/5 pt-3 leading-relaxed">
                    
                    {/* Owner profiles */}
                    <div>
                      <h5 className="font-bold text-[#5EE9FF] text-[9px] uppercase tracking-widest mb-1.5">
                        AUTOPILOT OWNERS
                      </h5>
                      <div className="space-y-1 text-slate-400">
                        <div 
                          className="flex justify-between hover:text-white cursor-pointer py-0.5 rounded transition-colors"
                          onClick={() => {
                            setSelectedRole('owner');
                            setSelectedBizType('pharmacy');
                            setEmail('owner-pharmacy@neurobiz.com');
                            setPassword('password123');
                          }}
                          onMouseEnter={() => setCursorHovered(true)}
                          onMouseLeave={() => setCursorHovered(false)}
                        >
                          <span>Pharmacy Node:</span>
                          <code className="text-purple-300 font-mono">owner-pharmacy@neurobiz.com</code>
                        </div>
                        <div 
                          className="flex justify-between hover:text-white cursor-pointer py-0.5 rounded transition-colors"
                          onClick={() => {
                            setSelectedRole('owner');
                            setSelectedBizType('restaurant');
                            setEmail('owner-restaurant@neurobiz.com');
                            setPassword('password123');
                          }}
                          onMouseEnter={() => setCursorHovered(true)}
                          onMouseLeave={() => setCursorHovered(false)}
                        >
                          <span>Restaurant Node:</span>
                          <code className="text-pink-300 font-mono">owner-restaurant@neurobiz.com</code>
                        </div>
                        <div 
                          className="flex justify-between hover:text-white cursor-pointer py-0.5 rounded transition-colors"
                          onClick={() => {
                            setSelectedRole('owner');
                            setSelectedBizType('clothing');
                            setEmail('owner-clothing@neurobiz.com');
                            setPassword('password123');
                          }}
                          onMouseEnter={() => setCursorHovered(true)}
                          onMouseLeave={() => setCursorHovered(false)}
                        >
                          <span>Clothing Node:</span>
                          <code className="text-indigo-300 font-mono">owner-clothing@neurobiz.com</code>
                        </div>
                      </div>
                    </div>

                    {/* Vendor profiles */}
                    <div className="border-t border-white/5 pt-3">
                      <h5 className="font-bold text-[#4F8BFF] text-[9px] uppercase tracking-widest mb-1.5">
                        SUPPLY CHAIN VENDORS
                      </h5>
                      <div className="space-y-1 text-slate-400">
                        <div 
                          className="flex justify-between hover:text-white cursor-pointer py-0.5 rounded transition-colors"
                          onClick={() => {
                            setSelectedRole('vendor');
                            setSelectedBizType(null);
                            setEmail('vendor@biomedsupplies.com');
                            setPassword('password123');
                          }}
                          onMouseEnter={() => setCursorHovered(true)}
                          onMouseLeave={() => setCursorHovered(false)}
                        >
                          <span>BioMed Supplies (Pharm):</span>
                          <code className="text-[#4F8BFF] font-mono">vendor@biomedsupplies.com</code>
                        </div>
                        <div 
                          className="flex justify-between hover:text-white cursor-pointer py-0.5 rounded transition-colors"
                          onClick={() => {
                            setSelectedRole('vendor');
                            setSelectedBizType(null);
                            setEmail('vendor@metrofoodservices.com');
                            setPassword('password123');
                          }}
                          onMouseEnter={() => setCursorHovered(true)}
                          onMouseLeave={() => setCursorHovered(false)}
                        >
                          <span>Metro Food (Rest):</span>
                          <code className="text-[#4F8BFF] font-mono">vendor@metrofoodservices.com</code>
                        </div>
                        <div 
                          className="flex justify-between hover:text-white cursor-pointer py-0.5 rounded transition-colors"
                          onClick={() => {
                            setSelectedRole('vendor');
                            setSelectedBizType(null);
                            setEmail('vendor@texstyleapparel.com');
                            setPassword('password123');
                          }}
                          onMouseEnter={() => setCursorHovered(true)}
                          onMouseLeave={() => setCursorHovered(false)}
                        >
                          <span>TexStyle (Cloth):</span>
                          <code className="text-[#4F8BFF] font-mono">vendor@texstyleapparel.com</code>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-2 text-center text-purple-400 font-bold uppercase tracking-widest text-[9px]">
                      Default Password: <code className="text-white font-mono lowercase text-xs">password123</code>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
