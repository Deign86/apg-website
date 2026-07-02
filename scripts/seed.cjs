const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Use Application Default Credentials (from firebase login or GOOGLE_APPLICATION_CREDENTIALS)
initializeApp({ projectId: 'apg-website-2026' });

const db = getFirestore();
const now = Timestamp.now();

const sampleData = [
  {
    title: 'Luxury Condo at Ortigas Center',
    property_type: 'Condo',
    price: 8500000,
    price_unit: '₱',
    location: 'Ortigas Center, Pasig City',
    floor_area: 52,
    lot_area: 0,
    status: 'For Sale',
    description: 'A stunning 2-bedroom condominium unit in the heart of Ortigas Center. Features modern finishes, 24/7 security, swimming pool, gym, and parking. Walking distance to major malls and BPO offices.',
    images: [],
    created_at: now,
  },
  {
    title: "Commercial Space - Robinson's Galleria",
    property_type: 'Commercial',
    price: 120000,
    price_unit: '₱',
    location: 'Robinsons Galleria, Ortigas',
    floor_area: 85,
    lot_area: 0,
    status: 'For Lease',
    description: 'Prime commercial retail space at Robinsons Galleria. High foot traffic area, perfect for restaurants, retail stores, or service centers. Fully finished with HVAC system.',
    images: [],
    created_at: now,
  },
  {
    title: 'Modern House & Lot in Antipolo',
    property_type: 'House',
    price: 4500000,
    price_unit: '₱',
    location: 'Antipolo City, Rizal',
    floor_area: 120,
    lot_area: 200,
    status: 'For Sale',
    description: 'Beautiful 3-bedroom house with garden in a peaceful subdivision. Features a spacious living area, modern kitchen, carport for 2 cars, and stunning city view.',
    images: [],
    created_at: now,
  },
  {
    title: 'Premium Virtual Office Package',
    property_type: 'VIRTUAL OFFICE',
    price: 3000,
    price_unit: '₱',
    location: 'Ortigas Center, Pasig City',
    floor_area: 0,
    lot_area: 0,
    status: 'Available',
    description: 'Premium virtual office package including prime business address at Ortigas Center, mail handling, phone answering service, and 4 hours monthly meeting room access. Perfect for startups and remote businesses.',
    images: [],
    created_at: now,
  },
  {
    title: 'Executive Virtual Office Suite',
    property_type: 'VIRTUAL OFFICE',
    price: 5500,
    price_unit: '₱',
    location: 'Ortigas Center, Pasig City',
    floor_area: 0,
    lot_area: 0,
    status: 'Available',
    description: 'Executive virtual office package with premium address, dedicated phone line with receptionist answering, mail forwarding, 8 hours monthly meeting room access, and access to our business lounge.',
    images: [],
    created_at: now,
  },
  {
    title: 'Lot in Greenfield Subdivision',
    property_type: 'Lot',
    price: 2800000,
    price_unit: '₱',
    location: 'Cainta, Rizal',
    floor_area: 0,
    lot_area: 150,
    status: 'For Sale',
    description: 'Residential lot in a well-developed subdivision. Flat terrain, ready for construction. Near schools, churches, and commercial establishments. Good investment opportunity.',
    images: [],
    created_at: now,
  },
];

async function seed() {
  const batch = db.batch();
  const collection = db.collection('offerings');

  for (const item of sampleData) {
    const docRef = collection.doc();
    batch.set(docRef, item);
  }

  await batch.commit();
  console.log(`✅ Seeded ${sampleData.length} documents to 'offerings' collection.`);

  // Verify
  const snap = await collection.get();
  console.log(`📊 Total documents in 'offerings': ${snap.size}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
