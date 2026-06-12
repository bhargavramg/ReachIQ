const prisma = require('./prisma');

async function applySegmentRules(rules) {
  console.log('segmentFilter received rules:', JSON.stringify(rules));
  
  if (!rules || rules.length === 0) {
    const all = await prisma.customer.findMany();
    console.log('No rules — returning all customers:', all.length);
    return all;
  }

  const where = {};

  for (const rule of rules) {
    const { field, operator, value } = rule;
    console.log(`Processing rule: field=${field} op=${operator} val=${value}`);

    if (field === 'total_spent' || field === 'totalSpent') {
      if (!where.totalSpent) where.totalSpent = {};
      const num = parseFloat(value);
      if (operator === 'gt') where.totalSpent.gt = num;
      else if (operator === 'lt') where.totalSpent.lt = num;
      else if (operator === 'gte') where.totalSpent.gte = num;
      else if (operator === 'lte') where.totalSpent.lte = num;

    } else if (field === 'order_count' || field === 'orderCount') {
      if (!where.orderCount) where.orderCount = {};
      const num = parseInt(value);
      if (operator === 'gt') where.orderCount.gt = num;
      else if (operator === 'lt') where.orderCount.lt = num;
      else if (operator === 'gte') where.orderCount.gte = num;
      else if (operator === 'lte') where.orderCount.lte = num;

    } else if (field === 'score') {
      if (!where.score) where.score = {};
      const num = parseInt(value);
      if (operator === 'gt') where.score.gt = num;
      else if (operator === 'lt') where.score.lt = num;
      else if (operator === 'gte') where.score.gte = num;
      else if (operator === 'lte') where.score.lte = num;

    } else if (field === 'city') {
      // Case insensitive exact match
      where.city = {
        equals: String(value),
        mode: 'insensitive'
      };

    } else if (field === 'tags') {
      // Array contains
      where.tags = {
        has: String(value)
      };

    } else if (field === 'days_since_last_order') {
      const days = parseInt(value);
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      if (!where.lastOrderAt) where.lastOrderAt = {};
      if (operator === 'gt') where.lastOrderAt.lt = cutoffDate;
      else if (operator === 'lt') where.lastOrderAt.gt = cutoffDate;
    }
  }

  console.log('Prisma where clause:', JSON.stringify(where));

  const customers = await prisma.customer.findMany({ where });
  
  console.log('Customers returned:', customers.length);
  if (customers.length > 0) {
    console.log('Sample customer city:', customers[0].city);
    console.log('Sample customer tags:', customers[0].tags);
  }

  return customers;
}

module.exports = { applySegmentRules };
