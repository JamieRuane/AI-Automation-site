/* FlowNet site configuration.
   Edit the two values below, then redeploy. Nothing else in the site needs changing.

   webhookUrl  Where consultation requests are sent (POST, JSON). An n8n "Webhook" node URL works well.
               Until this is set, the form shows an error instead of pretending to send.
   bookingUrl  Your Calendly / Cal.com / other scheduling link. While empty, the "Book a call" button stays hidden. */
window.FLOWNET_CONFIG = {
  webhookUrl: "",
  bookingUrl: ""
};
