import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { requireAdmin } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { isActive: true },
      include: {
        eventDays: {
          orderBy: { date: 'asc' }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    res.json(events);
  } catch (error) {
    logger.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get current active event - WORKING WITH YOUR DATA
router.get('/current', async (req, res) => {
  try {
    const now = new Date();
    console.log('=== DEBUG WITH YOUR DATA ===');
    console.log('Current time:', now);
    console.log('Current time (HH:MM):', now.toTimeString().substring(0, 5));
    console.log('Current date ISO:', now.toISOString());
    
    // Step 1: Check all events
    const allEvents = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        startDate: true,
        endDate: true
      }
    });
    console.log('All events:', JSON.stringify(allEvents, null, 2));
    
    // Step 2: Check all event days
    const allEventDays = await prisma.eventDay.findMany({
      select: {
        id: true,
        eventId: true,
        date: true,
        fnStartTime: true,
        fnEndTime: true,
        anStartTime: true,
        anEndTime: true,
        isActive: true
      }
    });
    console.log('All event days:', JSON.stringify(allEventDays, null, 2));
    
    // Step 3: Find the event that has today's event day
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    console.log('Today range:', todayStart, 'to', todayEnd);
    
    const currentEvent = await prisma.event.findFirst({
      where: {
        isActive: true,
        eventDays: {
          some: {
            date: {
              gte: todayStart,
              lte: todayEnd
            },
            isActive: true
          }
        }
      },
      include: {
        eventDays: {
          where: {
            date: {
              gte: todayStart,
              lte: todayEnd
            },
            isActive: true
          },
          orderBy: { date: 'asc' }
        }
      }
    });
    
    console.log('Current event found:', !!currentEvent);
    console.log('Current event details:', JSON.stringify(currentEvent, null, 2));
    
    if (!currentEvent || currentEvent.eventDays.length === 0) {
      return res.status(404).json({ 
        error: 'No active event found for today',
        debug: {
          totalEvents: allEvents.length,
          totalEventDays: allEventDays.length,
          todayRange: `${todayStart.toISOString()} to ${todayEnd.toISOString()}`
        }
      });
    }
    
    const currentDay = currentEvent.eventDays[0];
    console.log('Today event day:', JSON.stringify(currentDay, null, 2));
    
    // Helper function to convert time string to today's Date object
    const timeStringToDate = (timeString) => {
      if (!timeString || typeof timeString !== 'string') {
        return null;
      }
      const today = new Date();
      const [hours, minutes] = timeString.split(':').map(Number);
      today.setHours(hours, minutes, 0, 0);
      return today;
    };
    
    // Check which session is currently active
    let activeSession = null;
    let sessionStatus = {};
    
    // Check FN session (02:08 - 02:15)
    if (currentDay.fnEnabled) {
      const fnStart = timeStringToDate(currentDay.fnStartTime);
      const fnEnd = timeStringToDate(currentDay.fnEndTime);
      
      sessionStatus.fn = {
        enabled: true,
        time: `${currentDay.fnStartTime} - ${currentDay.fnEndTime}`,
        startTime: fnStart?.toISOString(),
        endTime: fnEnd?.toISOString(),
        isActive: fnStart && fnEnd && now >= fnStart && now <= fnEnd
      };
      
      console.log('FN Session check:', sessionStatus.fn);
      
      if (sessionStatus.fn.isActive) {
        activeSession = 'FN';
      }
    }
    
    // Check AN session (02:16 - 02:20)
    if (currentDay.anEnabled && !activeSession) {
      const anStart = timeStringToDate(currentDay.anStartTime);
      const anEnd = timeStringToDate(currentDay.anEndTime);
      
      sessionStatus.an = {
        enabled: true,
        time: `${currentDay.anStartTime} - ${currentDay.anEndTime}`,
        startTime: anStart?.toISOString(),
        endTime: anEnd?.toISOString(),
        isActive: anStart && anEnd && now >= anStart && now <= anEnd
      };
      
      console.log('AN Session check:', sessionStatus.an);
      
      if (sessionStatus.an.isActive) {
        activeSession = 'AN';
      }
    }
    
    console.log('Active session:', activeSession);
    console.log('Session status:', sessionStatus);
    
    // Return the event even if no session is currently active (for testing)
    res.json({
      event: currentEvent,
      currentDay: currentDay,
      activeSession: activeSession,
      sessionStatus: sessionStatus,
      debug: {
        currentTime: now.toISOString(),
        currentTimeString: now.toTimeString().substring(0, 5),
        foundEvent: !!currentEvent,
        foundTodayEventDay: !!currentDay
      }
    });
    
  } catch (error) {
    console.error('Get current event error:', error);
    res.status(500).json({ error: 'Failed to fetch current event' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        eventDays: {
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    logger.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create event (Admin only)
router.post('/', requireAdmin, [
  body('name').isLength({ min: 1 }).withMessage('Event name is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('eventDays').isArray().withMessage('Event days must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, startDate, endDate, eventDays } = req.body;

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Create event with days in transaction
    const event = await prisma.$transaction(async (prisma) => {
      const newEvent = await prisma.event.create({
        data: {
          name,
          description,
          startDate: start,
          endDate: end
        }
      });

      // Create event days
      const eventDayData = eventDays.map(day => ({
        eventId: newEvent.id,
        date: new Date(day.date),
        fnEnabled: day.fnEnabled !== false,
        anEnabled: day.anEnabled !== false,
        fnStartTime: day.fnStartTime || '09:00',
        fnEndTime: day.fnEndTime || '09:30',
        anStartTime: day.anStartTime || '14:00',
        anEndTime: day.anEndTime || '14:30'
      }));

      await prisma.eventDay.createMany({
        data: eventDayData
      });

      return prisma.event.findUnique({
        where: { id: newEvent.id },
        include: {
          eventDays: {
            orderBy: { date: 'asc' }
          }
        }
      });
    });

    logger.info(`Event created: ${name} by ${req.user.email}`);
    res.status(201).json(event);
  } catch (error) {
    logger.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event (Admin only)
router.put('/:id', requireAdmin, [
  body('name').optional().isLength({ min: 1 }).withMessage('Event name cannot be empty'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Validate date range if both dates provided
    if (updateData.startDate && updateData.endDate) {
      const start = new Date(updateData.startDate);
      const end = new Date(updateData.endDate);
      
      if (end <= start) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.startDate && { startDate: new Date(updateData.startDate) }),
        ...(updateData.endDate && { endDate: new Date(updateData.endDate) })
      },
      include: {
        eventDays: {
          orderBy: { date: 'asc' }
        }
      }
    });

    logger.info(`Event updated: ${event.name} by ${req.user.email}`);
    res.json(event);
  } catch (error) {
    logger.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Update event day
router.put('/days/:dayId', requireAdmin, [
  body('fnEnabled').optional().isBoolean(),
  body('anEnabled').optional().isBoolean(),
  body('fnStartTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  body('fnEndTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  body('anStartTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  body('anEndTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { dayId } = req.params;
    const updateData = req.body;

    const eventDay = await prisma.eventDay.update({
      where: { id: dayId },
      data: updateData,
      include: {
        event: true
      }
    });

    logger.info(`Event day updated: ${eventDay.date} by ${req.user.email}`);
    res.json(eventDay);
  } catch (error) {
    logger.error('Update event day error:', error);
    res.status(500).json({ error: 'Failed to update event day' });
  }
});

// Get event days
router.get('/:id/days', async (req, res) => {
  try {
    const { id } = req.params;

    const eventDays = await prisma.eventDay.findMany({
      where: { eventId: id, isActive: true },
      include: {
        _count: {
          select: {
            attendanceRecords: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json(eventDays);
  } catch (error) {
    logger.error('Get event days error:', error);
    res.status(500).json({ error: 'Failed to fetch event days' });
  }
});

// Delete event (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            eventDays: {
              where: {
                attendanceRecords: {
                  some: {}
                }
              }
            }
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if event has attendance records
    if (event._count.eventDays > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete event with attendance records. Please archive the event instead.' 
      });
    }

    // Hard delete with cascade - use transaction for data integrity
    await prisma.$transaction(async (tx) => {
      // Delete related eventDays first (if any without attendance records)
      await tx.eventDay.deleteMany({
        where: { eventId: id }
      });

      // Then delete the event
      await tx.event.delete({
        where: { id }
      });
    });

    logger.info(`Event permanently deleted: ${event.name} by ${req.user.email}`);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    logger.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;