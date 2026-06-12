const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Diya', 'Myra', 'Ananya', 'Priya', 'Aadhya', 'Saanvi', 'Anika', 'Aaradhya', 'Kiara', 'Navya',
  'Rohan', 'Karan', 'Vikram', 'Neha', 'Pooja', 'Shruti', 'Rahul', 'Amit', 'Sunil', 'Kiran',
  'Nisha', 'Sneha', 'Riya', 'Ishita', 'Manoj', 'Suresh', 'Rajesh', 'Prakash', 'Deepak', 'Sanjay'
];

const lastNames = [
  'Sharma', 'Patel', 'Kumar', 'Singh', 'Das', 'Kaur', 'Gupta', 'Mehta', 'Trivedi', 'Joshi',
  'Deshmukh', 'Reddy', 'Rao', 'Iyer', 'Nair', 'Pillai', 'Chauhan', 'Rajput', 'Bose', 'Chatterjee',
  'Mishra', 'Pandey', 'Dubey', 'Yadav', 'Verma', 'Thakur', 'Garg', 'Agarwal', 'Bansal', 'Jain'
];

const cities = [
  'Bangalore', 'Chennai', 'Hyderabad', 'Mumbai', 'Delhi',
  'Pune', 'Ahmedabad', 'Jaipur', 'Kolkata', 'Surat'
];

const segments = [
  'VIP', 'Loyal', 'New', 'At Risk', 'Fashion', 'Beauty', 'Electronics'
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomTags() {
  const numTags = getRandomInt(1, 3);
  const tags = new Set();
  while (tags.size < numTags) {
    tags.add(getRandomItem(segments));
  }
  return Array.from(tags);
}

async function main() {
  console.log('Clearing existing data...');
  await prisma.order.deleteMany({});
  await prisma.customer.deleteMany({});

  console.log('Generating 200 realistic Indian customers...');
  
  const customersToCreate = [];
  
  for (let i = 0; i < 200; i++) {
    const fn = getRandomItem(firstNames);
    const ln = getRandomItem(lastNames);
    const name = `${fn} ${ln}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${getRandomInt(1, 999)}@gmail.com`;
    const phone = `+91 ${getRandomInt(90000, 99999)}${getRandomInt(10000, 99999)}`;
    const city = getRandomItem(cities);
    const orderCount = getRandomInt(1, 25);
    const totalSpent = getRandomInt(1000, 50000);
    const score = getRandomInt(50, 100);
    const tags = getRandomTags();
    const lastOrderAt = new Date(Date.now() - getRandomInt(1, 180) * 24 * 60 * 60 * 1000);

    customersToCreate.push({
      name,
      email,
      phone,
      city,
      orderCount,
      totalSpent,
      score,
      tags,
      lastOrderAt
    });
  }

  // Insert customers
  const createdCustomers = await Promise.all(
    customersToCreate.map(customer => prisma.customer.create({ data: customer }))
  );

  console.log(`Successfully seeded ${createdCustomers.length} customers.`);
  
  // Optionally create some orders for these customers to match the orderCount
  console.log('Generating sample orders for customers...');
  let totalOrders = 0;
  
  for (const customer of createdCustomers) {
    // Just generate 1 to 3 actual orders per customer to populate the profile history, 
    // even though total order count is higher, for performance.
    const ordersToMake = Math.min(customer.orderCount, 3);
    for (let j = 0; j < ordersToMake; j++) {
      await prisma.order.create({
        data: {
          customerId: customer.id,
          amount: getRandomInt(500, 5000),
          items: [`Product ${getRandomInt(100, 999)}`],
          orderedAt: new Date(customer.lastOrderAt.getTime() - getRandomInt(0, 30) * 24 * 60 * 60 * 1000)
        }
      });
      totalOrders++;
    }
  }

  console.log(`Successfully created ${totalOrders} sample orders.`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
