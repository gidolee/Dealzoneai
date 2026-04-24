/* eslint-disable no-console */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const categoryCatalog = {
  Fashion: [
    { name: "Urban Sneaker", price: 120, description: "Street-style everyday sneaker" },
    { name: "Denim Jacket", price: 95, description: "Layer-ready classic denim jacket" },
    { name: "Tailored Chino", price: 62, description: "Comfort stretch tapered chino" },
    { name: "Everyday Hoodie", price: 58, description: "Soft fleece pullover hoodie" },
    { name: "Leather Crossbody", price: 88, description: "Compact crossbody with secure zip" },
    { name: "Weekend Loafers", price: 104, description: "Lightweight suede loafers" }
  ],
  Beauty: [
    { name: "Skincare Bundle", price: 75, description: "Hydration and glow essentials" },
    { name: "Vitamin C Serum", price: 34, description: "Brightening antioxidant serum" },
    { name: "Repair Night Cream", price: 42, description: "Overnight moisture barrier support" },
    { name: "SPF 50 Gel", price: 28, description: "Lightweight broad-spectrum protection" },
    { name: "Hair Nourish Mask", price: 31, description: "Weekly repair treatment for dry hair" },
    { name: "Fragrance Discovery Set", price: 49, description: "Travel-size signature scents" }
  ],
  Electronics: [
    { name: "Wireless Earbuds", price: 99, description: "Compact premium earbuds" },
    { name: "Smartwatch Active", price: 179, description: "Fitness and notification smartwatch" },
    { name: "Bluetooth Speaker", price: 69, description: "Portable water-resistant speaker" },
    { name: "4K Streaming Stick", price: 55, description: "Fast smart TV streaming device" },
    { name: "Noise Cancel Headphones", price: 210, description: "Over-ear immersive listening" },
    { name: "USB-C Power Hub", price: 44, description: "Multi-port desktop charging hub" }
  ],
  Home: [
    { name: "Air Fryer Pro", price: 129, description: "Oil-light crispy cooking appliance" },
    { name: "Memory Foam Pillow", price: 38, description: "Cooling ergonomic sleep support" },
    { name: "Cotton Sheet Set", price: 79, description: "Breathable 400-thread-count sheets" },
    { name: "Robot Vacuum Mini", price: 189, description: "Daily auto-clean floor assistant" },
    { name: "LED Desk Lamp", price: 32, description: "Dimmable eye-care study lamp" },
    { name: "Storage Organizer Kit", price: 46, description: "Modular closet and shelf organizers" }
  ],
  Sports: [
    { name: "Performance Running Shoes", price: 138, description: "Cushioned trainers for long runs" },
    { name: "Adjustable Dumbbell", price: 159, description: "Space-saving strength training set" },
    { name: "Yoga Mat Grip", price: 29, description: "Non-slip mat for home workouts" },
    { name: "Cycling Helmet Aero", price: 86, description: "Ventilated road-ready helmet" },
    { name: "Fitness Tracker Band", price: 49, description: "All-day health tracking wearable" },
    { name: "Hydration Pack", price: 41, description: "Lightweight trail hydration backpack" }
  ],
  Travel: [
    { name: "Carry-On Luggage", price: 145, description: "Hard-shell spinner cabin suitcase" },
    { name: "Travel Backpack 35L", price: 92, description: "Weekend travel backpack with laptop sleeve" },
    { name: "Packing Cube Set", price: 27, description: "Compression cubes for organized travel" },
    { name: "Portable Neck Pillow", price: 24, description: "Memory foam flight neck support" },
    { name: "Universal Travel Adapter", price: 36, description: "Multi-region plug and USB charging" },
    { name: "Anti-Theft Sling Bag", price: 54, description: "Secure crossbody bag for city trips" }
  ],
  Food: [
    { name: "Coffee Beans Sampler", price: 33, description: "Single-origin medium roast selection" },
    { name: "Protein Snack Box", price: 29, description: "High-protein snacks for busy days" },
    { name: "Organic Tea Collection", price: 26, description: "Herbal and green tea variety pack" },
    { name: "Artisan Chocolate Set", price: 31, description: "Dark and milk chocolate assortment" },
    { name: "Healthy Pantry Bundle", price: 64, description: "Staple grains, nuts, and seeds kit" },
    { name: "Spice Starter Pack", price: 22, description: "Core spices for home cooking" }
  ],
  Wellness: [
    { name: "Massage Gun Compact", price: 118, description: "Post-workout muscle recovery device" },
    { name: "Sleep Support Gummies", price: 25, description: "Night routine melatonin blend" },
    { name: "Posture Corrector", price: 37, description: "Daily ergonomic alignment support" },
    { name: "Blue Light Glasses", price: 34, description: "Screen-time eye comfort frames" },
    { name: "Meditation Cushion", price: 39, description: "Stable seated mindfulness cushion" },
    { name: "Aromatherapy Diffuser", price: 43, description: "Ultrasonic essential oil diffuser" }
  ],
  Gaming: [
    { name: "Mechanical Keyboard", price: 89, description: "RGB tactile gaming keyboard" },
    { name: "Wireless Gaming Mouse", price: 74, description: "Low-latency high-precision mouse" },
    { name: "Gaming Headset Pro", price: 112, description: "Surround sound voice-optimized headset" },
    { name: "1080p Webcam", price: 57, description: "Streaming-ready full HD webcam" },
    { name: "Controller Charging Dock", price: 35, description: "Dual controller fast charging dock" },
    { name: "Desk Mousepad XL", price: 21, description: "Extended anti-fray desk surface" }
  ],
  Books: [
    { name: "Data Science Essentials", price: 45, description: "Practical analytics handbook" },
    { name: "Productivity Playbook", price: 24, description: "Systems for focus and execution" },
    { name: "Startup Strategy Guide", price: 32, description: "Growth and positioning frameworks" },
    { name: "UX Research Toolkit", price: 38, description: "Methods for product discovery" },
    { name: "Modern Marketing Tactics", price: 29, description: "Digital acquisition and retention" },
    { name: "Personal Finance Basics", price: 27, description: "Budgeting, saving, and investing primer" }
  ]
};

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const customerEmail = "customer@dealpilot.app";
  const merchantEmail = "merchant@dealpilot.app";

  const customer = await prisma.user.upsert({
    where: { email: customerEmail },
    update: { fullName: "Customer Demo", passwordHash: "password123" },
    create: {
      email: customerEmail,
      fullName: "Customer Demo",
      passwordHash: "password123",
      role: "CUSTOMER"
    }
  });

  const merchantUser = await prisma.user.upsert({
    where: { email: merchantEmail },
    update: { fullName: "Merchant Demo", passwordHash: "password123", role: "MERCHANT" },
    create: {
      email: merchantEmail,
      fullName: "Merchant Demo",
      passwordHash: "password123",
      role: "MERCHANT"
    }
  });

  const merchant = await prisma.merchant.upsert({
    where: { userId: merchantUser.id },
    update: { storeName: "StyleHub", website: "https://www.stylehub.example" },
    create: {
      userId: merchantUser.id,
      storeName: "StyleHub",
      website: "https://www.stylehub.example"
    }
  });

  const productsData = Object.entries(categoryCatalog).flatMap(([category, products]) =>
    products.map((product) => ({
      ...product,
      category
    }))
  );

  const products = [];
  for (const product of productsData) {
    const productId = `${merchant.id}-${toSlug(product.name)}`;
    const saved = await prisma.product.upsert({
      where: { id: productId },
      update: {
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description
      },
      create: {
        id: productId,
        merchantId: merchant.id,
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description
      }
    });
    products.push(saved);
  }

  const now = new Date();
  const inThirtyDays = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  const discountPattern = [15, 20, 25, 30, 35, 40, 45, 50];
  const dealsData = products.map((product, index) => {
    const discountPercent = discountPattern[index % discountPattern.length];
    return {
      title: `${discountPercent}% off ${product.name}`,
      discountPercent,
      code: `SAVE${String(index + 1).padStart(3, "0")}`,
      product
    };
  });

  for (const deal of dealsData) {
    await prisma.deal.upsert({
      where: { code: deal.code },
      update: {
        title: deal.title,
        discountPercent: deal.discountPercent,
        startsAt: now,
        endsAt: inThirtyDays,
        status: "ACTIVE"
      },
      create: {
        merchantId: merchant.id,
        productId: deal.product.id,
        title: deal.title,
        discountPercent: deal.discountPercent,
        code: deal.code,
        startsAt: now,
        endsAt: inThirtyDays,
        status: "ACTIVE"
      }
    });
  }

  await prisma.userEvent.deleteMany({ where: { userId: customer.id } });

  const eventTypes = ["PRODUCT_VIEW", "CLICK", "SEARCH", "ADD_TO_CART", "PRODUCT_VIEW", "PURCHASE"];
  const seedEvents = [];
  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    const iterations = index % 3 === 0 ? 3 : 2;
    for (let offset = 0; offset < iterations; offset += 1) {
      const type = eventTypes[(index + offset) % eventTypes.length];
      seedEvents.push({
        userId: customer.id,
        productId: product.id,
        type,
        metadata: { source: "seed", category: product.category }
      });
    }
  }

  await prisma.userEvent.createMany({ data: seedEvents });

  console.log("Seed complete");
  console.log(`Seeded products: ${products.length}`);
  console.log(`Seeded deals: ${dealsData.length}`);
  console.log(`Customer login: ${customerEmail} / password123`);
  console.log(`Merchant login: ${merchantEmail} / password123`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
