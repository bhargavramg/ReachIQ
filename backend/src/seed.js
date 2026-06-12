const prisma = require('./prisma');

async function main() {
  console.log("Seeding 200 customers...");
  const firstNames = ['Arjun', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Anjali', 'Rohan', 'Kavya', 'Amit', 'Divya', 'Karan', 'Pooja', 'Nikhil', 'Shruti', 'Aditya', 'Meera', 'Siddharth', 'Nisha', 'Varun', 'Deepika', 'Raj', 'Sunita', 'Manish', 'Rekha'];
  const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Joshi', 'Mehta', 'Reddy', 'Nair', 'Iyer', 'Verma', 'Shah', 'Chopra', 'Malhotra'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Jaipur', 'Ahmedabad', 'Surat'];
  const tagOptions = ['vip', 'loyal', 'at-risk', 'new', 'fashion', 'beauty', 'electronics', 'discount-lover'];
  
  const customers = [];
  for (let i = 0; i < 200; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const totalSpent = Math.floor(Math.random() * (50000 - 500) + 500);
    const orderCount = Math.floor(Math.random() * 20) + 1;
    let score = 0;
    if (totalSpent > 20000 && orderCount > 10) score = Math.floor(Math.random() * 11) + 90;
    else if (totalSpent > 10000) score = Math.floor(Math.random() * 15) + 75;
    else if (totalSpent > 5000) score = Math.floor(Math.random() * 15) + 60;
    else score = Math.floor(Math.random() * 30) + 30;

    const numTags = Math.floor(Math.random() * 3) + 1;
    const tags = [];
    for(let j=0; j<numTags; j++) {
      tags.push(tagOptions[Math.floor(Math.random() * tagOptions.length)]);
    }

    const lastOrderAt = new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000);

    customers.push({
      id: `cust-${i}`,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@gmail.com`,
      phone: `+919${Math.floor(Math.random() * 900000000) + 100000000}`,
      city: cities[Math.floor(Math.random() * cities.length)],
      tags: [...new Set(tags)],
      totalSpent,
      orderCount,
      score,
      lastOrderAt
    });
  }

  await prisma.customer.createMany({
    data: customers,
    skipDuplicates: true
  });

  console.log("Seeding 800 orders...");
  const products = ['Cotton Kurta', 'Silk Saree', 'Denim Jacket', 'Sneakers', 'Tote Bag', 'Face Serum', 'Moisturizer', 'Ethnic Dress', 'Sports Shoes', 'Handbag', 'Sunglasses', 'Perfume', 'Lipstick', 'Foundation', 'Casual T-Shirt', 'Formal Shirt', 'Leggings', 'Dupatta', 'Watch', 'Wallet'];
  
  const orders = [];
  for (let i = 0; i < 800; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const numItems = Math.floor(Math.random() * 3) + 1;
    const items = [];
    for(let j=0; j<numItems; j++) {
      items.push({
        name: products[Math.floor(Math.random() * products.length)],
        price: Math.floor(Math.random() * 2000) + 200,
        qty: Math.floor(Math.random() * 3) + 1
      });
    }
    
    orders.push({
      customerId: customer.id,
      amount: items.reduce((acc, item) => acc + (item.price * item.qty), 0),
      items: items,
      orderedAt: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000)
    });
  }

  await prisma.order.createMany({
    data: orders
  });

  console.log("Seed complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
