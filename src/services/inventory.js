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
    { name: 'Chicken Biryani', category: 'Main Course', stock: 45, minimumStock: 15, vendor: 'Metro Food Services', status: 'In Stock' },
    { name: 'Paneer Tikka', category: 'Starters', stock: 8, minimumStock: 12, vendor: 'GreenGrow Organics', status: 'Low Stock' },
    { name: 'Butter Chicken', category: 'Main Course', stock: 30, minimumStock: 10, vendor: 'Metro Food Services', status: 'In Stock' },
    { name: 'Veg Fried Rice', category: 'Main Course', stock: 22, minimumStock: 10, vendor: 'GreenGrow Organics', status: 'In Stock' },
    { name: 'Margherita Pizza', category: 'Pizza', stock: 5, minimumStock: 10, vendor: 'Metro Food Services', status: 'Low Stock' },
    { name: 'Chicken Burger', category: 'Burgers', stock: 0, minimumStock: 8, vendor: 'Metro Food Services', status: 'Out of Stock' },
    { name: 'Pasta Alfredo', category: 'Pasta', stock: 18, minimumStock: 8, vendor: 'GreenGrow Organics', status: 'In Stock' },
    { name: 'Chocolate Brownie', category: 'Desserts', stock: 3, minimumStock: 10, vendor: 'Sweet Treats Bakery', status: 'Low Stock' },
    { name: 'Mango Mocktail', category: 'Beverages', stock: 40, minimumStock: 15, vendor: 'Fresh Juice Co.', status: 'In Stock' }
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
    await deleteDoc(doc(db, 'inventory', itemId));

    // Create system notification
    await addNotification(ownerUid, 'warning', 'Inventory Deleted', `${itemName || 'An item'} was removed from inventory.`);
  } catch (error) {
    console.error('Error in deleteInventoryItem:', error);
    throw error;
  }
}
