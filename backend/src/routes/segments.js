const express = require('express');
const router = express.Router();
const { applySegmentRules } = require('../segmentFilter');

router.post('/preview', async (req, res) => {
  try {
    const { filters } = req.body;
    console.log('Preview received filters:', JSON.stringify(filters));

    if (!filters) {
      return res.status(400).json({ error: 'Filters required' });
    }

    const customers = await applySegmentRules(filters);
    console.log('Preview customer count:', customers.length);

    const sample = customers.slice(0, 5).map(c => ({
      id: c.id,
      name: c.name,
      city: c.city,
      totalSpent: c.totalSpent,
      score: c.score,
      tags: c.tags
    }));

    res.json({
      count: customers.length,
      sample
    });

  } catch (err) {
    console.error('Preview error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
