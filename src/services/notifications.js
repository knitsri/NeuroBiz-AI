import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';

// Add notification
export async function addNotification(userUid, type, title, message) {
  try {
    await addDoc(collection(db, 'notifications'), {
      userUid,
      type, // 'warning' | 'info' | 'success'
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    });
  } catch (error) {
    console.error('Error in addNotification:', error);
  }
}

// Subscribe to real-time notifications ordered by timestamp descending
export function subscribeToNotifications(userUid, callback) {
  const q = query(
    collection(db, 'notifications'),
    where('userUid', '==', userUid),
    orderBy('timestamp', 'desc'),
    limit(30)
  );

  return onSnapshot(q, (snapshot) => {
    const alerts = [];
    snapshot.forEach((doc) => {
      alerts.push({ id: doc.id, ...doc.data() });
    });
    callback(alerts);
  });
}

// Mark all unread notifications as read
export async function markNotificationsAsRead(userUid) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userUid', '==', userUid),
      where('read', '==', false)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const batch = writeBatch(db);
      querySnapshot.forEach((document) => {
        batch.update(doc(db, 'notifications', document.id), { read: true });
      });
      await batch.commit();
    }
  } catch (error) {
    console.error('Error in markNotificationsAsRead:', error);
  }
}
