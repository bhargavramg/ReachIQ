const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

const ORDER = ['queued','sent','delivered','opened','read','clicked'];

router.post('/', async (req, res) => {
  try {
    const { communicationId, status } = req.body;
    
    if (!communicationId || !status) {
      return res.status(200).json({ ok: true, note: 'Missing data ignored' });
    }

    const comm = await prisma.communication.findUnique({
      where: { id: communicationId }
    });

    if (!comm) {
      return res.status(200).json({ ok: true, note: 'Not found ignored' });
    }

    let isValidTransition = false;
    if (status === 'failed') {
      isValidTransition = true;
    } else {
      const currentIndex = ORDER.indexOf(comm.status);
      const newIndex = ORDER.indexOf(status);
      if (newIndex > currentIndex) {
        isValidTransition = true;
      }
    }

    if (!isValidTransition) {
      return res.status(200).json({ ok: true, note: 'Invalid transition ignored' });
    }

    await prisma.communication.update({
      where: { id: communicationId },
      data: { status }
    });

    await prisma.campaignStats.update({
      where: { campaignId: comm.campaignId },
      data: { [status]: { increment: 1 } }
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Receipt error:', error);
    res.status(200).json({ ok: true, note: 'Error swallowed' });
  }
});

module.exports = router;
