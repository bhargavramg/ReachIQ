const express = require('express');
const cors = require('cors');
require('dotenv').config();

const customersRouter = require('./routes/customers');
const segmentsRouter = require('./routes/segments');
const campaignsRouter = require('./routes/campaigns');
const receiptsRouter = require('./routes/receipts');
const aiRouter = require('./routes/ai');
const calendarRouter = require('./routes/calendar');

const app = express();

app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173']
}));
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

app.use('/api/customers', customersRouter);
app.use('/api/segments', segmentsRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/receipts', receiptsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/calendar', calendarRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
