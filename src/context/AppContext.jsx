import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { getUserProfile, logoutUser } from '../services/auth';
import { 
  subscribeToInventory, 
  seedInventoryIfEmpty,
  addInventoryItem as addInventoryItemService,
  updateInventoryItem as updateInventoryItemService,
  deleteInventoryItem as deleteInventoryItemService 
} from '../services/inventory';
import { 
  subscribeToOwnerProcurements, 
  subscribeToVendorProcurements,
  approveRecommendation as approveRecommendationService,
  handleVendorAction as handleVendorActionService
} from '../services/procurement';
import { 
  subscribeToMarketingCampaigns 
} from '../services/marketing';
import { 
  subscribeToNotifications,
  markNotificationsAsRead as markNotificationsAsReadService,
  addNotification as addNotificationService
} from '../services/notifications';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeRole, setActiveRole] = useState('owner'); // 'owner' | 'vendor'
  const [businessType, setBusinessType] = useState('pharmacy'); // 'pharmacy' | 'restaurant' | 'clothing'
  
  const [inventory, setInventory] = useState([]);
  const [procurementRequests, setProcurementRequests] = useState([]);
  const [marketingCampaigns, setMarketingCampaigns] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [vendorsList, setVendorsList] = useState([]);
  
  const [lastScanResults, setLastScanResults] = useState(() => {
    const saved = localStorage.getItem('neurobiz_scan_results');
    return saved ? JSON.parse(saved) : null;
  });

  // Listen to Firebase Auth state updates
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setCurrentUser(profile);
            setBusinessType(profile.businessType || 'pharmacy');
            setActiveRole(profile.role || 'owner');
            
            // Seed inventory if empty
            await seedInventoryIfEmpty(user.uid, profile.businessType || 'pharmacy');
          }
        } catch (err) {
          console.error("Error loading user profile:", err);
        }
      } else {
        setCurrentUser(null);
        setLastScanResults(null);
        localStorage.removeItem('neurobiz_scan_results');
      }
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  // Listen to Firestore changes in real-time when authenticated
  useEffect(() => {
    if (!currentUser) {
      setInventory([]);
      setProcurementRequests([]);
      setMarketingCampaigns([]);
      setNotifications([]);
      setVendorsList([]);
      return;
    }

    const uid = currentUser.uid;

    // Stream Inventory CRUD
    const unsubInventory = subscribeToInventory(uid, (items) => {
      // Map Firestore itemName or name keys to React 'name' parameter for UI compatibility
      const mappedItems = items.map(item => ({
        id: item.id,
        name: item.name ?? item.itemName ?? '',
        category: item.category || '',
        stock: Number(item.stock || 0),
        minimumStock: Number(item.minimumStock || 0),
        vendor: item.vendor || '',
        status: item.status || 'In Stock',
        createdAt: item.createdAt
      }));
      setInventory(mappedItems);
    });

    // Stream Vendors
    const vendorQuery = query(collection(db, 'vendors'), where('ownerUid', '==', uid));
    const unsubVendors = onSnapshot(vendorQuery, (snapshot) => {
      const v = [];
      snapshot.forEach(doc => v.push({ id: doc.id, ...doc.data() }));
      setVendorsList(v);
    });

    // Stream Procurements (based on user role)
    const unsubProcurements = currentUser.role === 'owner'
      ? subscribeToOwnerProcurements(uid, (reqs) => setProcurementRequests(reqs))
      : subscribeToVendorProcurements(currentUser.businessName, (reqs) => setProcurementRequests(reqs));

    // Stream Marketing Campaigns
    const unsubCampaigns = subscribeToMarketingCampaigns(uid, (campaigns) => {
      setMarketingCampaigns(campaigns);
    });

    // Stream Notifications
    const unsubNotifications = subscribeToNotifications(uid, (alerts) => {
      setNotifications(alerts);
    });

    return () => {
      unsubInventory();
      unsubVendors();
      unsubProcurements();
      unsubCampaigns();
      unsubNotifications();
    };
  }, [currentUser]);

  // Inventory CRUD triggers mapping to services
  const addInventoryItem = async (itemData) => {
    if (currentUser) {
      await addInventoryItemService(currentUser.uid, itemData);
    }
  };

  const editInventoryItem = async (itemId, updatedData) => {
    if (currentUser) {
      await updateInventoryItemService(currentUser.uid, itemId, updatedData);
    }
  };

  const deleteInventoryItem = async (itemId) => {
    if (currentUser) {
      const itemToDelete = inventory.find(item => item.id === itemId);
      if (itemToDelete) {
        await deleteInventoryItemService(currentUser.uid, itemId, itemToDelete.name);
      }
    }
  };

  // Procurement approval mapping
  const approveRecommendation = async (rec) => {
    if (currentUser) {
      await approveRecommendationService(
        currentUser.uid, 
        rec, 
        currentUser.businessName, 
        businessType
      );
      return true;
    }
    return false;
  };

  // Vendor restock decision mapping
  const handleVendorAction = async (requestId, action) => {
    if (currentUser) {
      await handleVendorActionService(requestId, action, currentUser.uid);
    }
  };

  // Notification read marks
  const markNotificationsAsRead = async () => {
    if (currentUser) {
      await markNotificationsAsReadService(currentUser.uid);
    }
  };

  // Image assets mapping provider
  const generateMockImageUrl = (product, type, discount, businessType) => {
    const mappings = {
      pharmacy: {
        poster: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80'
      },
      restaurant: {
        poster: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80'
      },
      clothing: {
        poster: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80'
      }
    };
    const categoryCollection = mappings[businessType] || mappings.pharmacy;
    return categoryCollection.poster;
  };

  // AI Marketing Campaign Generator using Gemini 2.5 Flash
  const generateAiCampaign = async (product, offer, discount) => {
    if (!currentUser) throw new Error("Please sign in first.");

    try {
      // Gather item context
      const matchedItem = inventory.find(i => i.name === product);
      const stock = matchedItem ? matchedItem.stock : 0;
      const stockStatus = matchedItem ? matchedItem.status : "Unknown";

      // Target audience
      let audience = "General Consumers";
      if (businessType === 'pharmacy') audience = "Wellness and healthcare consumers";
      else if (businessType === 'restaurant') audience = "Food lovers looking for local dining specials";
      else if (businessType === 'clothing') audience = "Fashion-conscious retail shoppers";

      // Previous marketing suggestions
      const prevSuggestion = lastScanResults ? lastScanResults.marketingSuggestion : "N/A";

      const { generateGeminiMarketingCampaign } = await import('../services/gemini');
      
      const responseJson = await generateGeminiMarketingCampaign(
        currentUser.businessName,
        businessType,
        product,
        offer,
        discount,
        audience,
        stock,
        stockStatus,
        prevSuggestion
      );

      // Return matching schema
      return {
        id: 'camp-gemini-' + Date.now(),
        product,
        promoType: offer,
        discount,
        title: responseJson.posterHeadline || `${discount}% OFF on ${product}!`,
        posterHeadline: responseJson.posterHeadline || `${discount}% OFF`,
        posterSubtitle: responseJson.posterSubtitle || `SPECIAL ON ${product.toUpperCase()}`,
        callToAction: responseJson.callToAction || 'ORDER NOW',
        instagramCaption: responseJson.instagramCaption || '',
        whatsappPromotion: responseJson.whatsappPromotion || '',
        description: responseJson.marketingStrategy || ''
      };
    } catch (err) {
      console.error("Error in generateAiCampaign:", err);
      throw err;
    }
  };

  // Asynchronous Copilot AI Assistant using Gemini 2.5 Flash
  const askAiAssistant = async (question) => {
    if (!currentUser) return "Please sign in to ask questions.";

    try {
      // Fetch Firestore data
      const invQuery = query(collection(db, 'inventory'), where('ownerUid', '==', currentUser.uid));
      const invSnap = await getDocs(invQuery);
      const dbInventory = [];
      invSnap.forEach(d => dbInventory.push({ id: d.id, ...d.data() }));

      const procQuery = query(collection(db, 'procurements'), where('ownerUid', '==', currentUser.uid));
      const procSnap = await getDocs(procQuery);
      const dbProcurements = [];
      procSnap.forEach(d => dbProcurements.push({ id: d.id, ...d.data() }));

      const vendorQuery = query(collection(db, 'vendors'), where('ownerUid', '==', currentUser.uid));
      const vendorSnap = await getDocs(vendorQuery);
      const dbVendors = [];
      vendorSnap.forEach(d => dbVendors.push({ id: d.id, ...d.data() }));

      const businessData = {
        businessType,
        businessName: currentUser.businessName,
        ownerName: currentUser.ownerName,
        inventory: dbInventory.map(i => ({
          name: i.name ?? i.itemName ?? "",
          category: i.category,
          stock: i.stock,
          minimumStock: i.minimumStock,
          vendor: i.vendor,
          status: i.status
        })),
        procurements: dbProcurements.map(p => ({
          item: p.item,
          quantity: p.quantity,
          vendor: p.vendor,
          status: p.status
        })),
        vendors: dbVendors.map(v => ({ name: v.name }))
      };

      const { askGeminiAssistant } = await import('../services/gemini');
      return await askGeminiAssistant(businessData, question);
    } catch (err) {
      console.error("Error in askAiAssistant:", err);
      throw err;
    }
  };

  // AI Health Scan using Google Gemini 2.5 Flash with Smart Caching
  const runAiScan = async (force = false) => {
    if (!currentUser) return null;

    try {
      // Fetch Firestore data
      const invQuery = query(collection(db, 'inventory'), where('ownerUid', '==', currentUser.uid));
      const invSnap = await getDocs(invQuery);
      const dbInventory = [];
      invSnap.forEach(d => dbInventory.push({ id: d.id, ...d.data() }));

      const procQuery = query(collection(db, 'procurements'), where('ownerUid', '==', currentUser.uid));
      const procSnap = await getDocs(procQuery);
      const dbProcurements = [];
      procSnap.forEach(d => dbProcurements.push({ id: d.id, ...d.data() }));

      const vendorQuery = query(collection(db, 'vendors'), where('ownerUid', '==', currentUser.uid));
      const vendorSnap = await getDocs(vendorQuery);
      const dbVendors = [];
      vendorSnap.forEach(d => dbVendors.push({ id: d.id, ...d.data() }));

      const marketingQuery = query(collection(db, 'marketingCampaigns'), where('ownerUid', '==', currentUser.uid));
      const marketingSnap = await getDocs(marketingQuery);
      const dbMarketing = [];
      marketingSnap.forEach(d => dbMarketing.push({ id: d.id, ...d.data() }));

      const notificationsQuery = query(collection(db, 'notifications'), where('ownerUid', '==', currentUser.uid));
      const notificationsSnap = await getDocs(notificationsQuery);
      const dbNotifications = [];
      notificationsSnap.forEach(d => dbNotifications.push({ id: d.id, ...d.data() }));

      // Generate hashes to compare against cache
      const currentInventoryHash = dbInventory
        .map(i => `${i.id}-${i.stock}-${i.status}-${i.name ?? i.itemName ?? ''}`)
        .sort()
        .join('|');
      const currentProcurementHash = dbProcurements
        .map(p => `${p.id}-${p.status}`)
        .sort()
        .join('|');

      // Check cache validity
      if (!force && lastScanResults && 
          lastScanResults.inventoryHash === currentInventoryHash && 
          lastScanResults.procurementHash === currentProcurementHash) {
        console.log("Cached scan match detected. Re-using cached AI Health scan.");
        
        // Update time of scan execution for presentation
        const cachedResults = {
          ...lastScanResults,
          timestamp: new Date().toLocaleTimeString()
        };
        setLastScanResults(cachedResults);
        localStorage.setItem('neurobiz_scan_results', JSON.stringify(cachedResults));
        return cachedResults;
      }

      // Build clean business context object without metadata (no id, ownerUid, createdAt, updatedAt, timestamps)
      const cleanInventory = dbInventory.map(i => ({
        name: i.name ?? i.itemName ?? "",
        category: i.category || "",
        stock: Number(i.stock ?? 0),
        minimumStock: Number(i.minimumStock ?? 0),
        vendor: i.vendor || "",
        status: i.status || ""
      }));

      const cleanVendors = dbVendors.map(v => ({
        name: v.name || "",
        contact: v.contact || "",
        email: v.email || "",
        performanceScore: v.performanceScore || ""
      }));

      const cleanProcurements = dbProcurements.map(p => ({
        item: p.item || "",
        quantity: Number(p.quantity ?? 0),
        vendor: p.vendor || "",
        status: p.status || "",
        date: p.date || ""
      }));

      const cleanMarketing = dbMarketing.map(m => ({
        product: m.product || "",
        promoType: m.promoType || "",
        discount: m.discount || "",
        instagram: m.instagram || "",
        whatsapp: m.whatsapp || ""
      }));

      const cleanNotifications = dbNotifications.map(n => ({
        type: n.type || "",
        title: n.title || "",
        message: n.message || "",
        read: n.read || false
      }));

      const businessContext = {
        businessType,
        inventory: cleanInventory,
        vendors: cleanVendors,
        procurements: cleanProcurements,
        marketingCampaigns: cleanMarketing,
        notifications: cleanNotifications
      };

      // Call Gemini 2.5 Flash Health Scanner
      const { runGeminiHealthScan } = await import('../services/gemini');
      const geminiResult = await runGeminiHealthScan(businessContext);

      // Map Gemini structured JSON properties directly to the UI
      const results = {
        score: Number(geminiResult.businessHealth || 80),
        lowStockCount: dbInventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length,
        deadStockItem: geminiResult.deadStock || geminiResult.deadStockItem || 'N/A',
        pendingRequests: dbProcurements.filter(r => r.status === 'Pending').length,
        criticalActions: geminiResult.criticalActions || [],
        growthOpportunities: geminiResult.growthOpportunities || [],
        costOptimization: geminiResult.costOptimization || [],
        businessInsights: geminiResult.businessInsights || [],
        marketingSuggestions: geminiResult.marketingSuggestions || [],
        summary: geminiResult.summary || '',
        timestamp: new Date().toLocaleTimeString(),
        inventoryHash: currentInventoryHash,
        procurementHash: currentProcurementHash
      };

      setLastScanResults(results);
      localStorage.setItem('neurobiz_scan_results', JSON.stringify(results));

      await addNotificationService(
        currentUser.uid,
        results.score >= 80 ? 'success' : 'warning',
        'AI Health Scan Complete',
        `Business Health scan analyzed by Gemini 2.5 Flash at ${results.score}%.`
      );

      return results;
    } catch (err) {
      console.error("Error executing Gemini AI Health Scan:", err);
      throw err;
    }
  };

  // Sign out mapping
  const logout = async () => {
    await logoutUser();
  };

  // Derived Dashboard Metrics directly from Firestore state synchronizers
  const totalItemsCount = inventory.length;
  const pendingRequestsCount = procurementRequests.filter(r => r.status === 'Pending').length;
  const activeVendorsCount = vendorsList.length;
  const marketingCampaignsCount = marketingCampaigns.length;

  return (
    <AppContext.Provider value={{
      currentUser,
      authLoading,
      activeRole,
      businessType,
      inventory,
      procurementRequests,
      marketingCampaigns,
      notifications,
      lastScanResults,
      
      // Counter stats
      totalItemsCount,
      pendingRequestsCount,
      activeVendorsCount,
      marketingCampaignsCount,

      // Operations
      addItem: addInventoryItem,
      editItem: editInventoryItem,
      deleteItem: deleteInventoryItem,
      addInventoryItem,
      editInventoryItem,
      deleteInventoryItem,
      approveRecommendation,
      handleVendorAction,
      markNotificationsAsRead,
      askAiAssistant,
      generateAiCampaign,
      runAiScan,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export { AppContext };
