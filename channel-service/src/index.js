require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

async function simulateDelivery(communicationId) {
  const delay = (min, max) => new Promise(resolve =>
    setTimeout(resolve, Math.random() * (max - min) + min));
  
  const sendCallback = async (status) => {
    try {
      await axios.post(
        `${process.env.CRM_BACKEND_URL}/api/receipts`,
        { communicationId, status }
      );
      console.log(`Callback sent: ${communicationId} -> ${status}`);
    } catch (err) {
      // Retry once after 3 seconds
      await delay(3000, 3000);
      try {
        await axios.post(
          `${process.env.CRM_BACKEND_URL}/api/receipts`,
          { communicationId, status }
        );
        console.log(`Callback sent after retry: ${communicationId} -> ${status}`);
      } catch (retryErr) {
        console.error(`Callback failed after retry: ${communicationId} ${status}`);
      }
    }
  };
  
  // 5% fail immediately
  if (Math.random() < 0.05) {
    await delay(200, 500);
    await sendCallback('failed');
    return;
  }
  
  // Step 1: delivered (95% of messages)
  await delay(500, 2000);
  await sendCallback('delivered');
  
  // Step 2: opened (80% of delivered)
  if (Math.random() < 0.80) {
    await delay(3000, 12000);
    await sendCallback('opened');
    
    // Step 3: clicked (40% of opened)
    if (Math.random() < 0.40) {
      await delay(2000, 8000);
      await sendCallback('clicked');
    }
  }
}

app.post('/send', (req, res) => {
  const { communicationId, customerId, channel, message } = req.body;
  
  // 1. Respond IMMEDIATELY with 200
  res.status(200).json({ received: true, communicationId });
  
  // 2. Call simulateDelivery using setImmediate
  setImmediate(() => {
    simulateDelivery(communicationId).catch(err => {
      console.error('Error in simulateDelivery', err);
    });
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Channel service running on port ${PORT}`);
});
