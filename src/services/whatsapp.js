/**
 * Reusable WhatsApp Notification Helper Service for NeuroBiz AI
 */

export async function sendWhatsAppNotification(to, message) {
  if (!to) {
    // Gracefully skip if no recipient phone is defined
    return false;
  }
  
  try {
    const response = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, message }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.warn("Failed to send WhatsApp message via backend API:", errData);
      return false;
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Failed to trigger sendWhatsAppNotification request:", error);
    return false;
  }
}
