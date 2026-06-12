const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// Get all calendar events
router.get('/', async (req, res) => {
  try {
    const events = await prisma.calendarEvent.findMany({
      orderBy: { date: 'asc' },
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Create a new calendar event
router.post('/', async (req, res) => {
  try {
    const { title, date, time, type, description } = req.body;
    
    // Basic validation
    if (!title || !date || !type) {
      return res.status(400).json({ error: 'Missing required fields: title, date, type' });
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        date: new Date(date),
        time,
        type,
        description,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

// Update a calendar event
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, time, type, description } = req.body;

    const event = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title,
        ...(date && { date: new Date(date) }),
        time,
        type,
        description,
      },
    });

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
});

// Delete a calendar event
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.calendarEvent.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
});

// AI Schedule Generator (Mock generation of events based on CRM data logic)
router.post('/ai-schedule', async (req, res) => {
  try {
    // Generate dates based on today + some offset
    const today = new Date();
    
    const suggestedEvents = [
      {
        title: 'VIP Audience Re-engagement',
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // In 2 days
        time: '10:00 AM',
        type: 'campaign',
        description: 'AI Suggestion: High probability of engagement for inactive VIPs.',
      },
      {
        title: 'Call 5 High-Risk Churn Customers',
        date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        time: '02:00 PM',
        type: 'followup',
        description: 'AI Suggestion: Customers who haven\'t purchased in 90 days.',
      },
      {
        title: 'Weekly Strategy Review',
        date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000), // In 4 days
        time: '11:00 AM',
        type: 'meeting',
        description: 'AI Suggestion: Regular sync.',
      }
    ];

    const createdEvents = await prisma.$transaction(
      suggestedEvents.map(evt => prisma.calendarEvent.create({ data: evt }))
    );

    res.status(201).json(createdEvents);
  } catch (error) {
    console.error('Error generating AI schedule:', error);
    res.status(500).json({ error: 'Failed to generate AI schedule' });
  }
});

module.exports = router;
