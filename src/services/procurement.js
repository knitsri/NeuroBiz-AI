import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import { addNotification } from './notifications';

// Owner approves recommendation: creates a new procurement request doc
export async function approveRecommendation(ownerUid, rec, businessName, businessType) {
  try {
    const newRequest = {
      ownerUid,
      businessName,
      businessType,
      item: rec.name,
      quantity: rec.recommendedStock,
      vendor: rec.vendor,
      status: 'Pending',
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'procurements'), newRequest);

    // Create system notification for Owner
    await addNotification(
      ownerUid, 
      'info', 
      'Procurement Request Created', 
      `Reorder request for ${rec.name} (${rec.recommendedStock} units) sent to ${rec.vendor}.`
    );

    return docRef.id;
  } catch (error) {
    console.error('Error in approveRecommendation:', error);
    throw error;
  }
}

// Vendor accept/rejects requests
export async function handleVendorAction(requestId, action, ownerUid) {
  try {
    const requestDocRef = doc(db, 'procurements', requestId);
    const requestSnapshot = await getDoc(requestDocRef);

    if (!requestSnapshot.exists()) {
      throw new Error('Procurement request not found.');
    }

    const requestData = requestSnapshot.data();
    const newStatus = action === 'accept' ? 'Approved' : 'Rejected';

    // Update status in Firestore immediately
    await updateDoc(requestDocRef, { status: newStatus });

    // Notify Owner of vendor response
    await addNotification(
      requestData.ownerUid,
      action === 'accept' ? 'Procurement Approved' : 'Procurement Rejected',
      `Vendor ${requestData.vendor} has ${action === 'accept' ? 'accepted and shipped' : 'rejected'} order of ${requestData.item}.`,
      action === 'accept' ? 'success' : 'warning'
    );

    // If accepted, update the inventory stock levels for the owner in Firestore!
    if (action === 'accept') {
      // Find inventory doc (check both name and itemName for backward compatibility)
      let invQuery = query(
        collection(db, 'inventory'), 
        where('ownerUid', '==', requestData.ownerUid),
        where('name', '==', requestData.item)
      );
      let invSnapshot = await getDocs(invQuery);

      if (invSnapshot.empty) {
        invQuery = query(
          collection(db, 'inventory'), 
          where('ownerUid', '==', requestData.ownerUid),
          where('itemName', '==', requestData.item)
        );
        invSnapshot = await getDocs(invQuery);
      }

      if (!invSnapshot.empty) {
        const invDoc = invSnapshot.docs[0];
        const invData = invDoc.data();
        
        const newStock = Number(invData.stock || 0) + Number(requestData.quantity);
        let newStatus = 'In Stock';
        if (newStock <= 0) newStatus = 'Out of Stock';
        else if (newStock <= Number(invData.minimumStock || 15)) newStatus = 'Low Stock';

        // Update inventory item in Firestore
        await updateDoc(doc(db, 'inventory', invDoc.id), {
          stock: newStock,
          status: newStatus
        });

        // Notify Owner of stock increase
        await addNotification(
          requestData.ownerUid,
          'Inventory Updated',
          `SKU ${requestData.item} stock increased to ${newStock} units after vendor shipment.`,
          'success'
        );
      }
    }
  } catch (error) {
    console.error('Error in handleVendorAction:', error);
    throw error;
  }
}

// Listen to procurements for Owner (real-time)
export function subscribeToOwnerProcurements(ownerUid, callback) {
  const q = query(
    collection(db, 'procurements'), 
    where('ownerUid', '==', ownerUid),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const reqs = [];
    snapshot.forEach((doc) => {
      reqs.push({ id: doc.id, ...doc.data() });
    });
    callback(reqs);
  });
}

// Listen to procurements for Vendor (real-time filter by matching vendor name)
export function subscribeToVendorProcurements(vendorName, callback) {
  const q = query(
    collection(db, 'procurements'), 
    where('vendor', '==', vendorName),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const reqs = [];
    snapshot.forEach((doc) => {
      reqs.push({ id: doc.id, ...doc.data() });
    });
    callback(reqs);
  });
}
