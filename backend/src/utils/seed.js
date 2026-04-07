const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const Claim = require('../models/Claim');
const Notification = require('../models/Notification');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany();
  await FoodListing.deleteMany();
  await Claim.deleteMany();
  await Notification.deleteMany();
  console.log('Cleared existing data');

  // Use save() per doc so bcrypt pre-save hook runs and hashes passwords
  const userDefs = [
    { name: 'Admin User', email: 'admin@foodrescue.com', password: 'admin123', role: 'admin', organization: 'Food Rescue Platform' },
    { name: 'Rahul Sharma', email: 'rahul@spicegardens.com', password: 'donor123', role: 'donor', organization: 'Spice Gardens Restaurant', phone: '9876543210', address: 'Koramangala, Bangalore', location: { lat: 12.9352, lng: 77.6245 } },
    { name: 'Priya Mehta', email: 'priya@biryanihouse.com', password: 'donor123', role: 'donor', organization: 'Biryani House', phone: '9876543211', address: 'Indiranagar, Bangalore', location: { lat: 12.9784, lng: 77.6408 } },
    { name: 'Arjun Patel', email: 'arjun@thecafe.com', password: 'donor123', role: 'donor', organization: 'The Cafe Corner', phone: '9876543212', address: 'HSR Layout, Bangalore', location: { lat: 12.9116, lng: 77.6389 } },
    { name: 'Sunita Rao', email: 'sunita@hopefoundation.org', password: 'receiver123', role: 'receiver', organization: 'Hope Foundation NGO', phone: '9876543213', address: 'Whitefield, Bangalore', location: { lat: 12.9698, lng: 77.7499 } },
    { name: 'Vikram Singh', email: 'vikram@feedindia.org', password: 'receiver123', role: 'receiver', organization: 'Feed India Trust', phone: '9876543214', address: 'Jayanagar, Bangalore', location: { lat: 12.9250, lng: 77.5938 } },
    { name: 'Meena Krishnan', email: 'meena@sheltercare.org', password: 'receiver123', role: 'receiver', organization: 'Shelter Care NGO', phone: '9876543215', address: 'Marathahalli, Bangalore', location: { lat: 12.9591, lng: 77.6974 } }
  ];

  const users = await Promise.all(userDefs.map(d => new User(d).save()));
  const [, donor1, donor2, donor3, recv1, recv2] = users;
  const now = new Date();

  const listingDefs = [
    { donor: donor1._id, foodName: 'Butter Chicken + Naan', category: 'cooked', quantity: 15, mealsCount: 30, foodType: 'non-vegetarian', preparationTime: new Date(now - 2 * 3600000), expiryTime: new Date(now.getTime() + 45 * 60000), pickupAddress: 'Koramangala 5th Block, Bangalore', location: { lat: 12.9352, lng: 77.6245 }, status: 'available', specialNotes: 'Freshly cooked, packed in containers' },
    { donor: donor2._id, foodName: 'Veg Biryani', category: 'cooked', quantity: 20, mealsCount: 40, foodType: 'vegetarian', preparationTime: new Date(now - 1 * 3600000), expiryTime: new Date(now.getTime() + 90 * 60000), pickupAddress: 'Indiranagar 100ft Road, Bangalore', location: { lat: 12.9784, lng: 77.6408 }, status: 'available', specialNotes: 'Contains nuts, no onion/garlic' },
    { donor: donor3._id, foodName: 'Sandwich Platter', category: 'packed', quantity: 50, mealsCount: 50, foodType: 'vegetarian', preparationTime: new Date(now - 3 * 3600000), expiryTime: new Date(now.getTime() + 3 * 3600000), pickupAddress: 'HSR Layout Sector 2, Bangalore', location: { lat: 12.9116, lng: 77.6389 }, status: 'claimed', claimedBy: recv1._id, claimedAt: new Date(now - 30 * 60000) },
    { donor: donor1._id, foodName: 'Dal Makhani + Rice', category: 'cooked', quantity: 10, mealsCount: 20, foodType: 'vegetarian', preparationTime: new Date(now - 4 * 3600000), expiryTime: new Date(now.getTime() + 2 * 3600000), pickupAddress: 'Koramangala 7th Block, Bangalore', location: { lat: 12.9352, lng: 77.6245 }, status: 'available' },
    { donor: donor2._id, foodName: 'Chicken Rolls', category: 'packed', quantity: 30, mealsCount: 30, foodType: 'non-vegetarian', preparationTime: new Date(now - 5 * 3600000), expiryTime: new Date(now - 1 * 3600000), pickupAddress: 'Indiranagar, Bangalore', location: { lat: 12.9784, lng: 77.6408 }, status: 'expired' },
    { donor: donor3._id, foodName: 'Fruit Salad Cups', category: 'raw', quantity: 25, mealsCount: 25, foodType: 'vegan', preparationTime: new Date(now - 1 * 3600000), expiryTime: new Date(now.getTime() + 4 * 3600000), pickupAddress: 'HSR Layout, Bangalore', location: { lat: 12.9116, lng: 77.6389 }, status: 'picked_up', claimedBy: recv2._id },
    { donor: donor1._id, foodName: 'Paneer Tikka', category: 'cooked', quantity: 8, mealsCount: 16, foodType: 'vegetarian', preparationTime: new Date(now - 2 * 3600000), expiryTime: new Date(now.getTime() + 5 * 3600000), pickupAddress: 'Koramangala, Bangalore', location: { lat: 12.9352, lng: 77.6245 }, status: 'available' },
    { donor: donor2._id, foodName: 'Masala Dosa', category: 'cooked', quantity: 40, mealsCount: 40, foodType: 'vegetarian', preparationTime: new Date(now - 30 * 60000), expiryTime: new Date(now.getTime() + 25 * 60000), pickupAddress: 'Indiranagar, Bangalore', location: { lat: 12.9784, lng: 77.6408 }, status: 'available', specialNotes: 'Very fresh, needs immediate pickup' }
  ];

  const listings = await Promise.all(listingDefs.map(d => {
    const l = new FoodListing(d);
    l.calculateUrgency();
    return l.save();
  }));

  await Claim.insertMany([
    { foodListing: listings[2]._id, claimedBy: recv1._id, donor: donor3._id, status: 'claimed', claimedAt: new Date(now - 30 * 60000) },
    { foodListing: listings[5]._id, claimedBy: recv2._id, donor: donor3._id, status: 'picked_up', claimedAt: new Date(now - 2 * 3600000), pickedUpAt: new Date(now - 1 * 3600000) }
  ]);

  console.log('✅ Seed data inserted successfully!');
  console.log('\n📧 Login Credentials:');
  console.log('Admin:    admin@foodrescue.com / admin123');
  console.log('Donor 1:  rahul@spicegardens.com / donor123');
  console.log('Donor 2:  priya@biryanihouse.com / donor123');
  console.log('Receiver: sunita@hopefoundation.org / receiver123');
  console.log('Receiver: vikram@feedindia.org / receiver123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
