import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const defaultInventoryByBusiness = {
  pharmacy: [
    { id: 'p1', name: 'Paracetamol', category: 'Medicine', stock: 12, vendor: 'PharmaDistribute Co.', status: 'Low Stock' },
    { id: 'p2', name: 'Amoxicillin', category: 'Antibiotic', stock: 120, vendor: 'BioMed Supplies', status: 'In Stock' },
    { id: 'p3', name: 'Ibuprofen', category: 'Medicine', stock: 8, vendor: 'PharmaDistribute Co.', status: 'Low Stock' },
    { id: 'p4', name: 'Vitamin C', category: 'Supplement', stock: 250, vendor: 'Apex Pharma', status: 'In Stock' },
    { id: 'p5', name: 'Band-Aids', category: 'First Aid', stock: 0, vendor: 'Apex Pharma', status: 'Out of Stock' }
  ],
  restaurant: [
    { id: 'r1', name: 'Fresh Salmon', category: 'Seafood', stock: 3, vendor: 'Ocean Fresh Seafood', status: 'Low Stock' },
    { id: 'r2', name: 'Olive Oil', category: 'Ingredients', stock: 15, vendor: 'Metro Food Services', status: 'In Stock' },
    { id: 'r3', name: 'Tomatoes', category: 'Produce', stock: 5, vendor: 'GreenGrow Organics', status: 'Low Stock' },
    { id: 'r4', name: 'Garlic', category: 'Produce', stock: 30, vendor: 'GreenGrow Organics', status: 'In Stock' },
    { id: 'r5', name: 'Premium Rice', category: 'Grains', stock: 1, vendor: 'Metro Food Services', status: 'Low Stock' }
  ],
  clothing: [
    { id: 'c1', name: 'Denim Jackets', category: 'Outerwear', stock: 4, vendor: 'TexStyle Apparel', status: 'Low Stock' },
    { id: 'c2', name: 'Cotton T-Shirts', category: 'Tops', stock: 80, vendor: 'TexStyle Apparel', status: 'In Stock' },
    { id: 'c3', name: 'Summer Dresses', category: 'Dresses', stock: 2, vendor: 'Urban Wear Wholesalers', status: 'Low Stock' },
    { id: 'c4', name: 'Leather Belts', category: 'Accessories', stock: 15, vendor: 'Elite Accessories', status: 'In Stock' },
    { id: 'c5', name: 'Woolen Sweaters', category: 'Outerwear', stock: 0, vendor: 'TexStyle Apparel', status: 'Out of Stock' }
  ]
};

const defaultProcurementRecs = {
  pharmacy: [
    { id: 'pr-p1', name: 'Paracetamol', currentStock: 12, recommendedStock: 150, vendor: 'PharmaDistribute Co.' },
    { id: 'pr-p3', name: 'Ibuprofen', currentStock: 8, recommendedStock: 100, vendor: 'PharmaDistribute Co.' },
    { id: 'pr-p5', name: 'Band-Aids', currentStock: 0, recommendedStock: 200, vendor: 'Apex Pharma' }
  ],
  restaurant: [
    { id: 'pr-r1', name: 'Fresh Salmon', currentStock: 3, recommendedStock: 25, vendor: 'Ocean Fresh Seafood' },
    { id: 'pr-r3', name: 'Tomatoes', currentStock: 5, recommendedStock: 50, vendor: 'GreenGrow Organics' },
    { id: 'pr-r5', name: 'Premium Rice', currentStock: 1, recommendedStock: 40, vendor: 'Metro Food Services' }
  ],
  clothing: [
    { id: 'pr-c1', name: 'Denim Jackets', currentStock: 4, recommendedStock: 30, vendor: 'TexStyle Apparel' },
    { id: 'pr-c3', name: 'Summer Dresses', currentStock: 2, recommendedStock: 50, vendor: 'Urban Wear Wholesalers' },
    { id: 'pr-c5', name: 'Woolen Sweaters', currentStock: 0, recommendedStock: 40, vendor: 'TexStyle Apparel' }
  ]
};

export const AppProvider = ({ children }) => {
  // Load state from local storage or set defaults
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('neurobiz_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeRole, setActiveRole] = useState(() => {
    const saved = localStorage.getItem('neurobiz_active_role');
    return saved || 'owner'; // 'owner' | 'vendor'
  });

  const [businessType, setBusinessType] = useState(() => {
    const saved = localStorage.getItem('neurobiz_business_type');
    return saved || 'pharmacy'; // 'pharmacy' | 'restaurant' | 'clothing'
  });

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('neurobiz_inventory');
    if (saved) return JSON.parse(saved);
    return defaultInventoryByBusiness.pharmacy;
  });

  const [procurementRequests, setProcurementRequests] = useState(() => {
    const saved = localStorage.getItem('neurobiz_procurement_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [marketingCampaigns, setMarketingCampaigns] = useState(() => {
    const saved = localStorage.getItem('neurobiz_marketing');
    return saved ? JSON.parse(saved) : [];
  });

  const [lastScanResults, setLastScanResults] = useState(() => {
    const saved = localStorage.getItem('neurobiz_scan_results');
    return saved ? JSON.parse(saved) : null;
  });

  // Notification states
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('neurobiz_notifications');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'n-1',
        type: 'warning',
        title: 'Low Stock Detected',
        message: 'Paracetamol stock is below threshold limit (12 units remaining).',
        timestamp: '5m ago',
        read: false
      },
      {
        id: 'n-2',
        type: 'info',
        title: 'Procurement Required',
        message: 'Weekly restock parameters generated. 3 new AI recommendations.',
        timestamp: '1h ago',
        read: false
      },
      {
        id: 'n-3',
        type: 'success',
        title: 'Campaign Complete',
        message: 'AI Marketing studio generated 3 social drafts for customer list.',
        timestamp: '1d ago',
        read: true
      }
    ];
  });

  // Sync state changes to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('neurobiz_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('neurobiz_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('neurobiz_active_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('neurobiz_business_type', businessType);
  }, [businessType]);

  useEffect(() => {
    localStorage.setItem('neurobiz_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('neurobiz_procurement_requests', JSON.stringify(procurementRequests));
  }, [procurementRequests]);

  useEffect(() => {
    localStorage.setItem('neurobiz_marketing', JSON.stringify(marketingCampaigns));
  }, [marketingCampaigns]);

  useEffect(() => {
    if (lastScanResults) {
      localStorage.setItem('neurobiz_scan_results', JSON.stringify(lastScanResults));
    } else {
      localStorage.removeItem('neurobiz_scan_results');
    }
  }, [lastScanResults]);

  useEffect(() => {
    localStorage.setItem('neurobiz_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Handle local storage change event for multi-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'neurobiz_procurement_requests') {
        setProcurementRequests(e.newValue ? JSON.parse(e.newValue) : []);
      }
      if (e.key === 'neurobiz_inventory') {
        setInventory(e.newValue ? JSON.parse(e.newValue) : []);
      }
      if (e.key === 'neurobiz_active_role') {
        setActiveRole(e.newValue || 'owner');
      }
      if (e.key === 'neurobiz_business_type') {
        setBusinessType(e.newValue || 'pharmacy');
      }
      if (e.key === 'neurobiz_user') {
        setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
      if (e.key === 'neurobiz_scan_results') {
        setLastScanResults(e.newValue ? JSON.parse(e.newValue) : null);
      }
      if (e.key === 'neurobiz_notifications') {
        setNotifications(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Notifications API Helper
  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: 'n-' + Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Update default inventory when business type is changed on login
  const initializeBusiness = (type, role = 'owner', name = 'Nitya', email = 'owner@neurobiz.ai', bizName = '') => {
    setBusinessType(type);
    setActiveRole(role);
    
    const displayBizName = bizName || `NeuroBiz ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const userObj = {
      name,
      email,
      role,
      businessType: type,
      businessName: displayBizName,
      phone: '+1 (555) 019-2834'
    };
    setCurrentUser(userObj);
    
    // Load standard inventory for this business type
    const defaultItems = defaultInventoryByBusiness[type] || [];
    setInventory(defaultItems);
    setLastScanResults(null);
  };

  // Inventory Management Handlers
  const addInventoryItem = (item) => {
    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      ...item,
      stock: Number(item.stock)
    };
    
    // Auto status
    if (newItem.stock <= 0) newItem.status = 'Out of Stock';
    else if (newItem.stock <= 15) newItem.status = 'Low Stock';
    else newItem.status = 'In Stock';

    setInventory(prev => [newItem, ...prev]);
    
    // Add Notification
    addNotification(
      'Inventory Updated',
      `SKU ${newItem.name} has been added with ${newItem.stock} units.`,
      newItem.stock <= 15 ? 'warning' : 'success'
    );
  };

  const editInventoryItem = (itemId, updatedFields) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const stockVal = Number(updatedFields.stock !== undefined ? updatedFields.stock : item.stock);
        let statusVal = item.status;
        if (stockVal <= 0) statusVal = 'Out of Stock';
        else if (stockVal <= 15) statusVal = 'Low Stock';
        else statusVal = 'In Stock';

        const updated = { ...item, ...updatedFields, stock: stockVal, status: statusVal };
        
        // Add Notification
        addNotification(
          'Inventory Updated',
          `SKU ${updated.name} has been updated. Stock level is now ${updated.stock}.`,
          updated.stock <= 15 ? 'warning' : 'info'
        );

        return updated;
      }
      return item;
    }));
  };

  const deleteInventoryItem = (itemId) => {
    const itemToDelete = inventory.find(i => i.id === itemId);
    setInventory(prev => prev.filter(item => item.id !== itemId));
    if (itemToDelete) {
      addNotification(
        'Inventory Updated',
        `SKU ${itemToDelete.name} was removed from the ledger.`,
        'info'
      );
    }
  };

  // Procurement Handlers
  const approveRecommendation = (rec) => {
    // Check if request already exists for this item to avoid double submissions
    const existing = procurementRequests.find(r => r.item === rec.name && r.status === 'Pending');
    if (existing) return false;

    const newRequest = {
      id: 'req-' + Math.random().toString(36).substring(2, 9),
      businessName: currentUser?.businessName || 'My Business',
      businessType: businessType,
      item: rec.name,
      quantity: rec.recommendedStock,
      vendor: rec.vendor,
      status: 'Pending',
      date: new Date().toLocaleDateString()
    };
    setProcurementRequests(prev => [newRequest, ...prev]);
    
    // Add Notification
    addNotification(
      'Procurement Request Created',
      `Reorder request for ${newRequest.item} (${newRequest.quantity} units) sent to ${newRequest.vendor}.`,
      'info'
    );

    return true;
  };

  // Vendor Action Handlers (updates status and updates stock if accepted!)
  const handleVendorAction = (requestId, action) => {
    let updatedRequest = null;
    
    setProcurementRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        updatedRequest = { ...req, status: action === 'accept' ? 'Approved' : 'Rejected' };
        return updatedRequest;
      }
      return req;
    }));

    // Add Notification for Vendor response
    if (updatedRequest) {
      addNotification(
        action === 'accept' ? 'Procurement Approved' : 'Procurement Rejected',
        `Vendor ${updatedRequest.vendor} has ${action === 'accept' ? 'accepted and shipped' : 'rejected'} order of ${updatedRequest.item}.`,
        action === 'accept' ? 'success' : 'warning'
      );
    }

    // If approved, update the inventory stock levels for the owner!
    if (action === 'accept') {
      setTimeout(() => {
        if (updatedRequest) {
          setInventory(prev => prev.map(invItem => {
            if (invItem.name.toLowerCase() === updatedRequest.item.toLowerCase()) {
              const newStock = invItem.stock + updatedRequest.quantity;
              let newStatus = 'In Stock';
              if (newStock <= 0) newStatus = 'Out of Stock';
              else if (newStock <= 15) newStatus = 'Low Stock';
              
              addNotification(
                'Inventory Updated',
                `SKU ${invItem.name} stock increased to ${newStock} units after vendor shipment.`,
                'success'
              );

              return { ...invItem, stock: newStock, status: newStatus };
            }
            return invItem;
          }));
        }
      }, 500); // Small delay to simulate delivery / updating times
    }
  };

  // Image assets simulator (decoupled from static public directories, designed for Gemini integration)
  const generateMockImageUrl = (product, type, discount, businessType) => {
    // These use search query parameters from unsplash. High quality, beautiful, copyright-free photography.
    // In production, this function will make a fetch request to the Gemini Image Generation API
    // (e.g. Imagen 3 endpoint) and return the resulting base64 or storage URL.
    const mappings = {
      pharmacy: {
        poster: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&auto=format&fit=crop&q=80'
      },
      restaurant: {
        poster: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80'
      },
      clothing: {
        poster: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80'
      }
    };
    
    const categoryCollection = mappings[businessType] || mappings.pharmacy;
    return type === 'poster' ? categoryCollection.poster : categoryCollection.banner;
  };

  // Marketing Generator Simulation
  const generateMarketingContent = (product, promoType, discount) => {
    // Dynamic image generation slot (decoupled architecture)
    const posterUrl = generateMockImageUrl(product, 'poster', discount, businessType);
    const bannerUrl = generateMockImageUrl(product, 'banner', discount, businessType);

    const mockOutput = {
      id: 'camp-' + Math.random().toString(36).substring(2, 9),
      product,
      promoType,
      discount,
      title: `${discount}% OFF on ${product}!`,
      instagram: `🔥 UNBELIEVABLE DEAL Alert! 🔥\n\nLooking for the best ${product}? We've got you covered! For a limited time only, grab yours at an absolute steal of ${discount}% OFF!\n\n📍 Visit us today or order online. Link in bio!\n\n#${product.replace(/\s+/g, '')} #SpecialOffer #SME #SaveBig #StartupLife #LocalBiz`,
      whatsapp: `*⚡ NeuroBiz Special Offer! ⚡*\n\nHey there! We are excited to announce our brand new promo:\n\n🎉 Get *${discount}% OFF* on *${product}* starting today!\n\nThis is a *${promoType}* special. Don't miss out, stock is limited!\n\n💬 Send us a message or call to place your order now!`,
      description: `Targeted promotional campaign for ${product} offering a ${discount}% discount. Optimized for social channels to drive quick traffic and liquidate excess/slow inventory.`,
      posterUrl,
      bannerUrl
    };
    setMarketingCampaigns(prev => [mockOutput, ...prev]);
    
    // Add Notification
    addNotification(
      'Marketing Campaign Generated',
      `AI Marketing Studio drafted captions & image mockups for ${product}.`,
      'success'
    );

    return mockOutput;
  };

  // Run Simulated AI Scan (generates analytics based on current inventory)
  const runAiScan = () => {
    // Evaluate low stock and critical items
    const lowStockItems = inventory.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock');
    
    // Mock dead stock item depending on business type
    let deadStockItem = '';
    if (businessType === 'pharmacy') deadStockItem = 'Unsold Cough Syrup (Winter Batch)';
    else if (businessType === 'restaurant') deadStockItem = 'Unused Truffle Oil (Premium)';
    else deadStockItem = 'Heavy Wool Sweaters (Summer Season)';

    // Health Score logic: 100 base, subtract 10 points for every low stock item, 20 for out of stock
    let score = 100;
    inventory.forEach(item => {
      if (item.status === 'Low Stock') score -= 8;
      if (item.status === 'Out of Stock') score -= 15;
    });
    score = Math.max(score, 30); // minimum score 30

    // Build recommendations
    const recommendations = lowStockItems.map(item => {
      const recQty = item.status === 'Out of Stock' ? 200 : 100;
      return {
        id: `rec-${item.id}`,
        type: 'Low Stock',
        item: item.name,
        currentStock: item.stock,
        recommendedQuantity: recQty,
        vendor: item.vendor,
        message: `Stock level for ${item.name} is critical (${item.stock} units). Order recommended quantity to meet demand.`
      };
    });

    // Add general recommendation if inventory health is low
    if (score < 80) {
      recommendations.push({
        id: 'rec-general-marketing',
        type: 'Slow Movement',
        item: deadStockItem,
        currentStock: 5,
        recommendedQuantity: 0,
        vendor: 'N/A',
        message: `Clear ${deadStockItem} dead stock by launching a targeted WhatsApp promo campaign.`,
        action: 'marketing'
      });
    }

    const results = {
      score,
      lowStockCount: lowStockItems.length,
      deadStockItem,
      pendingRequests: procurementRequests.filter(r => r.status === 'Pending').length,
      recommendations,
      timestamp: new Date().toLocaleTimeString()
    };

    setLastScanResults(results);
    
    addNotification(
      'AI Health Scan Complete',
      `Business Health assessed at ${score}%. ${lowStockItems.length} low stock warnings found.`,
      score >= 80 ? 'success' : 'warning'
    );

    return results;
  };

  // AI Chat Assistant Mock Response (reads current app state!)
  const getAiChatResponse = (promptText) => {
    const text = promptText.toLowerCase();
    
    if (text.includes('running low') || text.includes('low stock') || text.includes('shortage')) {
      const low = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock');
      if (low.length === 0) {
        return "Excellent news! Your inventory is fully stocked. No items are currently running low.";
      }
      return `I analyzed your inventory. You have **${low.length} item(s)** running low:
\n` + low.map(i => `- **${i.name}**: Current stock is ${i.stock} (Suggested Vendor: *${i.vendor}*)`).join('\n') + `\n\nWould you like me to auto-generate a procurement order for these items?`;
    }

    if (text.includes('vendor') || text.includes('pending') || text.includes('request')) {
      const pending = procurementRequests.filter(r => r.status === 'Pending');
      if (pending.length === 0) {
        return "There are no pending procurement requests right now. All previous vendor shipments have been processed.";
      }
      return `You have **${pending.length} pending request(s)** awaiting vendor review:
\n` + pending.map(r => `- **${r.item}** (${r.quantity} units) to **${r.vendor}** - Status: *Pending*`).join('\n') + `\n\nI recommend pinging the vendor if they do not respond within 24 hours.`;
    }

    if (text.includes('reorder') || text.includes('what should i') || text.includes('restock')) {
      const recs = defaultProcurementRecs[businessType] || [];
      return `Based on seasonal demand, I recommend reordering:
\n` + recs.map(r => `- **${r.name}**: Reorder **${r.recommendedStock} units** from *${r.vendor}* (Current stock is ${inventory.find(i => i.name === r.name)?.stock || 0})`).join('\n') + `\n\nYou can approve these instantly in the **Procurement** module.`;
    }

    if (text.includes('summarize') || text.includes('today') || text.includes('health') || text.includes('overview')) {
      const total = inventory.length;
      const low = inventory.filter(i => i.status === 'Low Stock').length;
      const out = inventory.filter(i => i.status === 'Out of Stock').length;
      const pending = procurementRequests.filter(r => r.status === 'Pending').length;
      
      return `### Business Summary: **${currentUser?.businessName || 'NeuroBiz SME'}**
- **Inventory Metrics**: ${total} total items. *${low} low stock*, *${out} out of stock*.
- **Operations**: *${pending}* pending procurement requests.
- **AI Recommendation**: Your stock availability is at **${Math.round(((total - low - out) / total) * 100)}%**. Restocking low items is highly recommended to prevent lost sales in the upcoming week.`;
    }

    // Default response
    return `Hello! I'm your NeuroBiz AI assistant. I have complete visibility into your **${businessType}** business:
- 📦 **${inventory.length} items** in stock
- 🚚 **${procurementRequests.length} procurement logs**
- 📈 **${marketingCampaigns.length} campaigns launched**

Ask me anything about low stock items, reorder suggestions, pending vendor requests, or a general summary of today's business.`;
  };

  const logout = () => {
    setCurrentUser(null);
    setLastScanResults(null);
    localStorage.removeItem('neurobiz_user');
    localStorage.removeItem('neurobiz_scan_results');
    localStorage.removeItem('neurobiz_notifications');
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      activeRole,
      businessType,
      inventory,
      procurementRequests,
      marketingCampaigns,
      lastScanResults,
      notifications,
      setActiveRole,
      setBusinessType,
      initializeBusiness,
      addInventoryItem,
      editInventoryItem,
      deleteInventoryItem,
      approveRecommendation,
      handleVendorAction,
      generateMarketingContent,
      runAiScan,
      getAiChatResponse,
      addNotification,
      markNotificationsAsRead,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
