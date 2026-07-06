import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { addNotification } from './notifications';

// Save generated marketing campaign to Firestore
export async function addMarketingCampaign(ownerUid, campaignData) {
  try {
    const campaign = {
      ownerUid,
      product: campaignData.product,
      posterUrl: campaignData.posterUrl, // base64 URL initially, supports future Firebase Storage URLs
      instagram: campaignData.instagram,
      whatsapp: campaignData.whatsapp,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'marketingCampaigns'), campaign);

    // Create system notification
    await addNotification(
      ownerUid,
      'success',
      'Campaign Complete',
      `AI Marketing Studio generated social drafts and graphics for ${campaignData.product}.`
    );

    return docRef.id;
  } catch (error) {
    console.error('Error in addMarketingCampaign:', error);
    throw error;
  }
}

// Stream marketing campaigns for an Owner
export function subscribeToMarketingCampaigns(ownerUid, callback) {
  const q = query(
    collection(db, 'marketingCampaigns'), 
    where('ownerUid', '==', ownerUid),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const campaigns = [];
    snapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() });
    });
    callback(campaigns);
  });
}
