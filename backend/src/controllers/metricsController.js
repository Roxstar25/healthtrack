const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all metrics for logged-in user
exports.getMetrics = async (req, res) => {
  try {
    const metrics = await prisma.metric.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' }
    });
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new metric
exports.createMetric = async (req, res) => {
  try {
    const { weight, sleep, workout, notes, date } = req.body;
    
    const metric = await prisma.metric.create({
      data: {
        weight: weight ? parseFloat(weight) : null,
        sleep: sleep ? parseFloat(sleep) : null,
        workout: workout ? parseInt(workout) : null,
        notes,
        date: date ? new Date(date) : new Date(),
        userId: req.userId
      }
    });
    
    res.json(metric);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete metric
exports.deleteMetric = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.metric.deleteMany({
      where: { id, userId: req.userId }
    });
    
    res.json({ message: 'Metric deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
