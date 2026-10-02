const mongoose = require('mongoose');
require('dotenv').config();

const inspect = async () => {
  console.log('MongoDB URI:', process.env.MONGO_URI);
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/GigHub');
  console.log('Connected to DB:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host, 'Port:', mongoose.connection.port);

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('\nCollections in DB:', collections.map(c => c.name));

  for (const c of collections) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(`- ${c.name}: ${count} documents`);
  }

  const User = require('../models/User');
  const Gig = require('../models/Gig');
  const Bid = require('../models/Bid');
  const Milestone = require('../models/Milestone');
  const Chat = require('../models/Chat');
  const Dispute = require('../models/Dispute');

  console.log('\n--- ALL USERS ---');
  const users = await User.find({}, 'name email role createdAt');
  console.log('Total users:', users.length);
  users.forEach((u, i) => {
    console.log(`  [${i + 1}] ${u.name} | ${u.email} | ${u.role} | ID: ${u._id}`);
  });

  console.log('\n--- ALL GIGS ---');
  const gigs = await Gig.find().populate('client', 'name email');
  console.log('Total gigs:', gigs.length);
  gigs.forEach((g, i) => {
    console.log(`  [${i + 1}] "${g.title}" | Budget: $${g.budget} | Client: ${g.client?.name} (${g.client?._id}) | Status: ${g.status}`);
  });

  console.log('\n--- ALL BIDS ---');
  const bids = await Bid.find().populate('freelancer', 'name email').populate('gig', 'title');
  console.log('Total bids:', bids.length);
  bids.forEach((b, i) => {
    console.log(`  [${i + 1}] $${b.amount} on "${b.gig?.title}" by ${b.freelancer?.name} (${b.freelancer?._id}) | Status: ${b.status}`);
  });

  console.log('\n--- ALL MILESTONES ---');
  const milestones = await Milestone.find().populate('client', 'name').populate('freelancer', 'name');
  console.log('Total milestones:', milestones.length);
  milestones.forEach((m, i) => {
    console.log(`  [${i + 1}] "${m.title}" | Amount: $${m.amount} | Status: ${m.status} | Escrow: ${m.escrowStatus}`);
  });

  console.log('\n--- ALL CHATS ---');
  const chats = await Chat.find().populate('participants', 'name email');
  console.log('Total chats:', chats.length);
  chats.forEach((ch, i) => {
    console.log(`  [${i + 1}] Participants: ${ch.participants.map(p => p?.name).join(' & ')} | Messages: ${ch.messages.length}`);
  });

  console.log('\n--- ALL DISPUTES ---');
  const disputes = await Dispute.find().populate('raisedBy', 'name').populate('against', 'name');
  console.log('Total disputes:', disputes.length);
  disputes.forEach((d, i) => {
    console.log(`  [${i + 1}] "${d.reason}" | Raised by: ${d.raisedBy?.name} vs ${d.against?.name} | Status: ${d.status}`);
  });

  process.exit(0);
};

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
