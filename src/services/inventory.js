import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from './firebase';
import { addNotification } from './notifications';

const defaultInventoryByBusiness = {
  pharmacy: [
    { name: 'Paracetamol', category: 'Medicine', stock: 12, minimumStock: 20, vendor: 'PharmaDistribute Co.', status: 'Low Stock' },
    { name: 'Amoxicillin', category: 'Antibiotic', stock: 120, minimumStock: 30, vendor: 'BioMed Supplies', status: 'In Stock' },
    { name: 'Ibuprofen', category: 'Medicine', stock: 8, minimumStock: 20, vendor: 'PharmaDistribute Co.', status: 'Low Stock' },
    { name: 'Vitamin C', category: 'Supplement', stock: 250, minimumStock: 50, vendor: 'Apex Pharma', status: 'In Stock' },
    { name: 'Band-Aids', category: 'First Aid', stock: 0, minimumStock: 15, vendor: 'Apex Pharma', status: 'Out of Stock' }
  ],
  restaurant: [
    { name: 'Fresh Salmon', category: 'Seafood', stock: 3, minimumStock: 10, vendor: 'Ocean Fresh Seafood', status: 'Low Stock' },
    { name: 'Olive Oil', category: 'Ingredients', stock: 15, minimumStock: 5, vendor: 'Metro Food Services', status: 'In Stock' },
    { name: 'Tomatoes', category: 'Produce', stock: 5, minimumStock: 15, vendor: 'GreenGrow Organics', status: 'Low Stock' },
    { name: 'Garlic', category: 'Produce', stock: 30, minimumStock: 10, vendor: 'GreenGrow Organics', status: 'In Stock' },
    { name: 'Premium Rice', category: 'Grains', stock: 1, minimumStock: 5, vendor: 'Metro Food Services', status: 'Low Stock' }
  ],
  clothing: [
    { name: 'Denim Jackets', category: 'Outerwear', stock: 4, minimumStock: 10, vendor: 'TexStyle Apparel', status: 'Low Stock' },
    { name: 'Cotton T-Shirts', category: 'Tops', stock: 80, minimumStock: 20, vendor: 'TexStyle Apparel', status: 'In Stock' },
    { name: 'Summer Dresses', category: 'Dresses', stock: 2, minimumStock: 15, vendor: 'Urban Wear Wholesalers', status: 'Low Stock' },
    { name: 'Leather Belts', category: 'Accessories', stock: 15, minimumStock: 5, vendor: 'Elite Accessories', status: 'In Stock' },
    { name: 'Woolen Sweaters', category: 'Outerwear', stock: 0, minimumStock: 8, vendor: 'TexStyle Apparel', status: 'Out of Stock' }
  ]
};

// Seed default inventory items if the user's collection is empty
export async function seedInventoryIfEmpty(ownerUid, businessType) {
  try {
    const q = query(collection(db, 'inventory'), where('ownerUid', '==', ownerUid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      const defaults = defaultInventoryByBusiness[businessType] || defaultInventoryByBusiness.pharmacy;
      for (const item of defaults) {
        await addDoc(collection(db, 'inventory'), {
          ...item,
          itemName: item.name,
          ownerUid,
          createdAt: new Date().toISOString()
        });
      }
      
      // Seed default vendors for this owner
      const uniqueVendors = Array.from(new Set(defaults.map(d => d.vendor)));
      for (const vendorName of uniqueVendors) {
        await addDoc(collection(db, 'vendors'), {
          name: vendorName,
          ownerUid,
          createdAt: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('Error in seedInventoryIfEmpty:', error);
  }
}

// Real-time snapshot listener for inventory
export function subscribeToInventory(ownerUid, callback) {
  const q = query(collection(db, 'inventory'), where('ownerUid', '==', ownerUid));
  return onSnapshot(q, (snapshot) => {
    const items = [];
    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    callback(items);
  });
}

// Add custom item
export async function addInventoryItem(ownerUid, itemData) {
  try {
    const item = {
      ...itemData,
      name: itemData.name || itemData.itemName || '',
      itemName: itemData.name || itemData.itemName || '',
      ownerUid,
      createdAt: new Date().toISOString()
    };

    // If new item specifies a vendor, check if it exists in vendors collection. If not, create it.
    if (item.vendor) {
      const newVendorQ = query(
        collection(db, 'vendors'),
        where('ownerUid', '==', ownerUid),
        where('name', '==', item.vendor)
      );
      const newVendorSnap = await getDocs(newVendorQ);
      if (newVendorSnap.empty) {
        await addDoc(collection(db, 'vendors'), {
          name: item.vendor,
          ownerUid,
          createdAt: new Date().toISOString()
        });
        console.log(`New vendor ${item.vendor} automatically created upon item addition.`);
      }
    }

    const docRef = await addDoc(collection(db, 'inventory'), item);

    // Create system notification
    await addNotification(ownerUid, 'info', 'Inventory Added', `${itemData.name} has been added to inventory.`);
    return docRef.id;
  } catch (error) {
    console.error('Error in addInventoryItem:', error);
    throw error;
  }
}

// Edit item
export async function updateInventoryItem(ownerUid, itemId, itemData) {
  try {
    const docRef = doc(db, 'inventory', itemId);
    const updateData = { ...itemData };
    if (itemData.name) updateData.itemName = itemData.name;
    if (itemData.itemName) updateData.name = itemData.itemName;

    if (itemData.vendor !== undefined) {
      // Fetch current inventory to compare old and new vendor names
      const invSnap = await getDocs(query(collection(db, 'inventory'), where('ownerUid', '==', ownerUid)));
      const items = [];
      invSnap.forEach(d => items.push({ id: d.id, ...d.data() }));
      const itemToUpdate = items.find(i => i.id === itemId);

      if (itemToUpdate) {
        const oldVendor = itemToUpdate.vendor;
        const newVendor = itemData.vendor;

        if (oldVendor !== newVendor) {
          // If new vendor is not empty/null, check if it exists in vendors collection. If not, create it.
          if (newVendor) {
            const newVendorQ = query(
              collection(db, 'vendors'),
              where('ownerUid', '==', ownerUid),
              where('name', '==', newVendor)
            );
            const newVendorSnap = await getDocs(newVendorQ);
            if (newVendorSnap.empty) {
              await addDoc(collection(db, 'vendors'), {
                name: newVendor,
                ownerUid,
                createdAt: new Date().toISOString()
              });
              console.log(`New vendor ${newVendor} automatically created on update.`);
            }
          }

          // If old vendor is not empty/null, check if it becomes unused.
          if (oldVendor) {
            const otherItemsReferencingOldVendor = items.filter(i => i.id !== itemId && i.vendor === oldVendor);
            if (otherItemsReferencingOldVendor.length === 0) {
              const oldVendorQ = query(
                collection(db, 'vendors'),
                where('ownerUid', '==', ownerUid),
                where('name', '==', oldVendor)
              );
              const oldVendorSnap = await getDocs(oldVendorQ);
              for (const docD of oldVendorSnap.docs) {
                await deleteDoc(doc(db, 'vendors', docD.id));
              }
              console.log(`Unused old vendor ${oldVendor} removed from vendors collection.`);
            }
          }
        }
      } else {
        throw new Error("Unauthorized: Inventory item does not belong to this owner.");
      }
    } else {
      const invSnap = await getDocs(query(collection(db, 'inventory'), where('ownerUid', '==', ownerUid)));
      const items = [];
      invSnap.forEach(d => items.push({ id: d.id, ...d.data() }));
      const itemToUpdate = items.find(i => i.id === itemId);
      if (!itemToUpdate) {
        throw new Error("Unauthorized: Inventory item does not belong to this owner.");
      }
    }

    await updateDoc(docRef, updateData);

    // Create system notification
    await addNotification(ownerUid, 'info', 'Inventory Updated', `${itemData.name || 'An item'} has been updated.`);
  } catch (error) {
    console.error('Error in updateInventoryItem:', error);
    throw error;
  }
}

// Delete item
export async function deleteInventoryItem(ownerUid, itemId, itemName) {
  try {
    const itemRef = doc(db, 'inventory', itemId);
    const itemSnap = await getDocs(query(collection(db, 'inventory'), where('ownerUid', '==', ownerUid)));
    const items = [];
    itemSnap.forEach(d => items.push({ id: d.id, ...d.data() }));
    const itemToDelete = items.find(i => i.id === itemId);
    if (!itemToDelete) {
      throw new Error("Unauthorized: Inventory item does not belong to this owner.");
    }

    await deleteDoc(itemRef);

    if (itemToDelete && itemToDelete.vendor) {
      const vendorName = itemToDelete.vendor;
      const remainingItems = items.filter(i => i.id !== itemId);
      const isVendorReferenced = remainingItems.some(i => i.vendor === vendorName);

      if (!isVendorReferenced) {
        const vendorQ = query(
          collection(db, 'vendors'),
          where('ownerUid', '==', ownerUid),
          where('name', '==', vendorName)
        );
        const vendorSnap = await getDocs(vendorQ);
        for (const docD of vendorSnap.docs) {
          await deleteDoc(doc(db, 'vendors', docD.id));
        }
        console.log(`Unreferenced vendor ${vendorName} removed from vendors collection.`);
      }
    }

    // Create system notification
    await addNotification(ownerUid, 'warning', 'Inventory Deleted', `${itemName || 'An item'} was removed from inventory.`);
  } catch (error) {
    console.error('Error in deleteInventoryItem:', error);
    throw error;
  }
}
