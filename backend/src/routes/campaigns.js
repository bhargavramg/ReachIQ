const express = require('express');
const router = express.Router();
const axios = require('axios');
const prisma = require('../prisma');
const { applySegmentRules } = require('../segmentFilter');

router.get('/', async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: { stats: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(campaigns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
router.get('/funnel', async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { launchedAt: { not: null } }
    });
    
    let totalSent = 0;
    campaigns.forEach(c => totalSent += c.audienceCount);

    const counts = await prisma.communication.groupBy({
      by: ['status'],
      _count: true
    });

    const breakdown = { queued: 0, sent: 0, delivered: 0, opened: 0, read: 0, clicked: 0, failed: 0 };
    counts.forEach(c => { breakdown[c.status] = c._count; });
    
    const earliestCampaign = await prisma.campaign.findFirst({
      where: { launchedAt: { not: null } },
      orderBy: { launchedAt: 'asc' }
    });
    
    let ordered = 0;
    if (earliestCampaign && earliestCampaign.launchedAt && totalSent > 0) {
      ordered = await prisma.order.count({
        where: { orderedAt: { gte: earliestCampaign.launchedAt } }
      });
    }

    res.json({
      sent: totalSent,
      delivered: breakdown.delivered + breakdown.opened + breakdown.read + breakdown.clicked,
      opened: breakdown.opened + breakdown.read + breakdown.clicked,
      clicked: breakdown.clicked,
      ordered: ordered
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/stats', async (req, res) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { stats: true }
    });
    
    if (!campaign) return res.status(404).json({ error: 'Not found' });

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const communications = await prisma.communication.findMany({
      where: { campaignId: req.params.id },
      include: { customer: true },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit
    });

    const totalCommunications = await prisma.communication.count({
      where: { campaignId: req.params.id }
    });

    const counts = await prisma.communication.groupBy({
      by: ['status'],
      where: { campaignId: req.params.id },
      _count: true
    });

    const breakdown = {
      queued: 0, sent: 0, delivered: 0, opened: 0, read: 0, clicked: 0, failed: 0
    };
    counts.forEach(c => {
      breakdown[c.status] = c._count;
    });

    campaign.stats = {
      sent: campaign.audienceCount,
      delivered: breakdown.delivered + breakdown.opened + breakdown.read + breakdown.clicked,
      opened: breakdown.opened + breakdown.read + breakdown.clicked,
      clicked: breakdown.clicked,
      failed: breakdown.failed
    };

    res.json({ 
      campaign, 
      breakdown, 
      recentCommunications: communications,
      pagination: {
        total: totalCommunications,
        page,
        limit,
        totalPages: Math.ceil(totalCommunications / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      segment_rules, 
      message_template, 
      channel,
      audience_count 
    } = req.body;

    console.log('Campaign creation payload:', JSON.stringify({
      name,
      segment_rules,
      channel,
      audience_count,
      message_preview: message_template?.substring(0, 50)
    }));

    if (!name || !message_template || !channel) {
      return res.status(400).json({ 
        error: 'name, message_template and channel are required' 
      });
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        name,
        segmentRules: segment_rules || [],
        messageTemplate: message_template,
        channel,
        status: 'draft',
        audienceCount: 0
      }
    });

    console.log('Campaign created:', campaign.id);

    // Create stats row
    await prisma.campaignStats.create({
      data: { campaignId: campaign.id }
    });

    // Get matching customers
    const rules = segment_rules || [];
    const customers = await applySegmentRules(rules);
    console.log('Audience size:', customers.length);

    if (customers.length === 0) {
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: 'launched', launchedAt: new Date(), audienceCount: 0 }
      });
      return res.json({ campaignId: campaign.id, audienceCount: 0 });
    }

    // Create communications
    const commsData = customers.map(c => {
      const personalizedMsg = message_template.replace(
        /\{\{name\}\}/gi, c.name
      );
      return {
        campaignId: campaign.id,
        customerId: c.id,
        message: personalizedMsg,
        status: 'queued'
      };
    });

    await prisma.communication.createMany({ data: commsData });

    // Update campaign
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: 'launched',
        launchedAt: new Date(),
        audienceCount: customers.length
      }
    });

    console.log('Campaign launched:', campaign.id, 
      'audience:', customers.length);

    // Fire sends async — never block response
    setImmediate(async () => {
      const comms = await prisma.communication.findMany({
        where: { campaignId: campaign.id }
      });

      const results = await Promise.allSettled(
        comms.map(comm =>
          axios.post(
            `${process.env.CHANNEL_SERVICE_URL}/send`,
            {
              communicationId: comm.id,
              customerId: comm.customerId,
              channel,
              message: comm.message
            }
          )
        )
      );

      const successCount = results.filter(
        r => r.status === 'fulfilled'
      ).length;

      await prisma.campaignStats.update({
        where: { campaignId: campaign.id },
        data: { sent: successCount }
      });

      console.log('Sends fired:', successCount, '/', comms.length);
    });

    res.json({ 
      campaignId: campaign.id, 
      audienceCount: customers.length 
    });

  } catch (err) {
    console.error('Campaign creation error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
