/**
 * Notification Service Abstraction (SMS & WhatsApp Placeholders)
 * In production, this would integrate with Twilio, WhatsApp Business API, etc.
 */

async function sendSMS(to, message) {
  console.log(`[SMS SENDER] Sending SMS to ${to}: "${message}"`);
  // Simulated API response delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    success: true,
    provider: 'Simulated SMS Gateway',
    messageId: `sms-${Math.random().toString(36).substring(2, 11)}`,
    status: 'delivered'
  };
}

async function sendWhatsApp(to, message) {
  console.log(`[WhatsApp SENDER] Sending WhatsApp to ${to}: "${message}"`);
  // Simulated API response delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    success: true,
    provider: 'Simulated WhatsApp Cloud API',
    messageId: `wa-${Math.random().toString(36).substring(2, 11)}`,
    status: 'delivered'
  };
}

module.exports = {
  sendSMS,
  sendWhatsApp
};
