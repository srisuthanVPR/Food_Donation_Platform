const FoodListing = require('../models/FoodListing');
const Claim = require('../models/Claim');
const User = require('../models/User');
const AIAnalysisLog = require('../models/AIAnalysisLog');

const classifyQuery = (query) => {
  const q = query.toLowerCase();
  if (q.includes('urgent') || q.includes('expir') || q.includes('soon')) return 'urgent';
  if (q.includes('expired') || q.includes('wasted') || q.includes('waste')) return 'expired';
  if (q.includes('top donor') || q.includes('best donor') || q.includes('restaurant')) return 'top_donor';
  if (q.includes('top receiver') || q.includes('ngo') || q.includes('most claimed')) return 'top_receiver';
  if (q.includes('trend') || q.includes('daily') || q.includes('weekly') || q.includes('stats')) return 'trend';
  if (q.includes('priority') || q.includes('pickup') || q.includes('suggest')) return 'priority';
  if (q.includes('summary') || q.includes('overview') || q.includes('report')) return 'summary';
  if (q.includes('available') || q.includes('food now') || q.includes('current')) return 'available';
  return 'general';
};

const getUrgentFoodResponse = async () => {
  const now = new Date();
  const in60 = new Date(now.getTime() + 60 * 60000);
  const urgent = await FoodListing.find({
    status: 'available',
    expiryTime: { $gt: now, $lt: in60 }
  }).populate('donor', 'name organization').sort({ expiryTime: 1 }).limit(5);

  if (!urgent.length) return '✅ No urgent food listings right now. All available food has sufficient time before expiry.';

  let response = `🚨 **${urgent.length} urgent food listing(s) expiring within 60 minutes:**\n\n`;
  urgent.forEach((f, i) => {
    const minsLeft = Math.round((f.expiryTime - now) / 60000);
    response += `${i + 1}. **${f.foodName}** — ${f.mealsCount} meals | ${minsLeft} mins left\n`;
    response += `   📍 ${f.pickupAddress} | By: ${f.donor?.organization || f.donor?.name}\n\n`;
  });
  response += `⚡ Immediate action required to prevent food waste!`;
  return response;
};

const getExpiredFoodResponse = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiredToday = await FoodListing.countDocuments({ status: 'expired', updatedAt: { $gte: today } });
  const totalExpired = await FoodListing.countDocuments({ status: 'expired' });
  const totalListings = await FoodListing.countDocuments();
  const wasteRate = totalListings > 0 ? ((totalExpired / totalListings) * 100).toFixed(1) : 0;

  return `📊 **Expired Food Analysis:**\n\n` +
    `• Expired today: **${expiredToday} listings**\n` +
    `• Total expired (all time): **${totalExpired} listings**\n` +
    `• Overall waste rate: **${wasteRate}%**\n\n` +
    `${wasteRate > 30 ? '⚠️ High waste rate detected. Consider sending more alerts to receivers in high-waste zones.' : '✅ Waste rate is within acceptable range.'}`;
};

const getTopDonorResponse = async () => {
  const donors = await FoodListing.aggregate([
    { $group: { _id: '$donor', count: { $sum: 1 }, meals: { $sum: '$mealsCount' } } },
    { $sort: { count: -1 } }, { $limit: 3 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' }
  ]);
  if (!donors.length) return 'No donation data available yet.';
  let response = `🏆 **Top Donating Restaurants This Week:**\n\n`;
  donors.forEach((d, i) => {
    const medal = ['🥇', '🥈', '🥉'][i];
    response += `${medal} **${d.user.organization || d.user.name}** — ${d.count} donations, ${d.meals} meals\n`;
  });
  response += `\n💡 ${donors[0].user.organization || donors[0].user.name} is the top contributor. Consider featuring them on the platform!`;
  return response;
};

const getTopReceiverResponse = async () => {
  const receivers = await Claim.aggregate([
    { $group: { _id: '$claimedBy', count: { $sum: 1 } } },
    { $sort: { count: -1 } }, { $limit: 3 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' }
  ]);
  if (!receivers.length) return 'No claim data available yet.';
  let response = `🏅 **Most Active Receivers / NGOs:**\n\n`;
  receivers.forEach((r, i) => {
    const medal = ['🥇', '🥈', '🥉'][i];
    response += `${medal} **${r.user.organization || r.user.name}** — ${r.count} claims\n`;
  });
  return response;
};

const getPriorityPickupsResponse = async () => {
  const now = new Date();
  const listings = await FoodListing.find({ status: 'available', expiryTime: { $gt: now } })
    .populate('donor', 'name organization')
    .sort({ urgencyScore: -1 })
    .limit(5);

  if (!listings.length) return '✅ No available food listings at the moment.';
  let response = `🎯 **Priority Pickup Suggestions (by urgency score):**\n\n`;
  listings.forEach((f, i) => {
    const minsLeft = Math.round((f.expiryTime - now) / 60000);
    const hoursLeft = (minsLeft / 60).toFixed(1);
    response += `${i + 1}. **${f.foodName}** | Score: ${f.urgencyScore}/100\n`;
    response += `   🍽️ ${f.mealsCount} meals | ⏱️ ${minsLeft < 60 ? minsLeft + ' mins' : hoursLeft + ' hrs'} left\n`;
    response += `   📍 ${f.pickupAddress}\n\n`;
  });
  response += `💡 Higher urgency score = needs immediate pickup!`;
  return response;
};

const getSummaryResponse = async () => {
  const now = new Date();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const in30 = new Date(now.getTime() + 30 * 60000);

  const [available, expiringSoon, expiredToday, claimedToday, totalMeals] = await Promise.all([
    FoodListing.countDocuments({ status: 'available', expiryTime: { $gt: now } }),
    FoodListing.countDocuments({ status: 'available', expiryTime: { $gt: now, $lt: in30 } }),
    FoodListing.countDocuments({ status: 'expired', updatedAt: { $gte: today } }),
    Claim.countDocuments({ createdAt: { $gte: today } }),
    FoodListing.aggregate([{ $match: { status: { $in: ['completed', 'picked_up'] } } }, { $group: { _id: null, t: { $sum: '$mealsCount' } } }])
  ]);

  return `📋 **Platform Summary Report:**\n\n` +
    `• 🟢 Available food listings: **${available}**\n` +
    `• 🔴 Expiring in 30 mins: **${expiringSoon}**\n` +
    `• ❌ Expired today: **${expiredToday}**\n` +
    `• ✅ Claims made today: **${claimedToday}**\n` +
    `• 🍽️ Total meals rescued: **${totalMeals[0]?.t || 0}**\n\n` +
    `${expiringSoon > 0 ? `⚠️ Alert: ${expiringSoon} listing(s) need immediate attention!` : '✅ Platform is running smoothly.'}`;
};

const getTrendResponse = async () => {
  const days = 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const donations = await FoodListing.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const totalThisWeek = donations.reduce((s, d) => s + d.count, 0);
  const avgPerDay = (totalThisWeek / days).toFixed(1);

  let response = `📈 **7-Day Donation Trend:**\n\n`;
  donations.forEach(d => { response += `• ${d._id}: **${d.count}** donations\n`; });
  response += `\n📊 Average: **${avgPerDay} donations/day** over the last week\n`;
  response += `\n💡 ${totalThisWeek > 20 ? 'Great activity! Platform is gaining momentum.' : 'Consider outreach to bring more donors on board.'}`;
  return response;
};

const getAvailableResponse = async () => {
  const now = new Date();
  const available = await FoodListing.find({ status: 'available', expiryTime: { $gt: now } })
    .populate('donor', 'name organization')
    .sort({ expiryTime: 1 })
    .limit(5);

  if (!available.length) return '😔 No food listings available right now. Check back soon!';
  let response = `🍱 **Currently Available Food (${available.length} listings):**\n\n`;
  available.forEach((f, i) => {
    const minsLeft = Math.round((f.expiryTime - now) / 60000);
    response += `${i + 1}. **${f.foodName}** — ${f.mealsCount} meals\n`;
    response += `   ⏱️ ${minsLeft < 60 ? minsLeft + ' mins' : (minsLeft / 60).toFixed(1) + ' hrs'} left | 📍 ${f.pickupAddress}\n\n`;
  });
  return response;
};

const getGeneralResponse = (query) => {
  return `🤖 I can help you with:\n\n` +
    `• "Which donations are most urgent?"\n` +
    `• "Show expired donations today"\n` +
    `• "Who is the top donor?"\n` +
    `• "Which NGO claimed the most food?"\n` +
    `• "What is the wastage trend?"\n` +
    `• "Suggest priority pickups"\n` +
    `• "Give me a platform summary"\n` +
    `• "What food is available now?"\n\n` +
    `Try one of these queries to get started! 🚀`;
};

const askBot = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: 'Query is required' });

    const queryType = classifyQuery(query);
    let response;

    switch (queryType) {
      case 'urgent': response = await getUrgentFoodResponse(); break;
      case 'expired': response = await getExpiredFoodResponse(); break;
      case 'top_donor': response = await getTopDonorResponse(); break;
      case 'top_receiver': response = await getTopReceiverResponse(); break;
      case 'priority': response = await getPriorityPickupsResponse(); break;
      case 'summary': response = await getSummaryResponse(); break;
      case 'trend': response = await getTrendResponse(); break;
      case 'available': response = await getAvailableResponse(); break;
      default: response = getGeneralResponse(query);
    }

    await AIAnalysisLog.create({
      query,
      response,
      queryType,
      requestedBy: req.user?._id
    });

    res.json({ query, response, queryType, timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getInsights = async (req, res) => {
  try {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 60000);
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const [expiringSoon, totalExpired, totalListings, categoryStats] = await Promise.all([
      FoodListing.find({ status: 'available', expiryTime: { $gt: now, $lt: in30 } }).countDocuments(),
      FoodListing.countDocuments({ status: 'expired' }),
      FoodListing.countDocuments(),
      FoodListing.aggregate([
        { $group: { _id: '$category', total: { $sum: 1 }, claimed: { $sum: { $cond: [{ $ne: ['$status', 'available'] }, 1, 0] } } } }
      ])
    ]);

    const bestCategory = categoryStats.sort((a, b) => (b.claimed / b.total) - (a.claimed / a.total))[0];
    const wasteRate = totalListings > 0 ? ((totalExpired / totalListings) * 100).toFixed(1) : 0;

    const insights = [];
    if (expiringSoon > 0) insights.push({ type: 'warning', text: `🚨 ${expiringSoon} food listing(s) may expire in the next 30 minutes` });
    if (wasteRate > 25) insights.push({ type: 'alert', text: `⚠️ Waste rate is at ${wasteRate}% — consider more receiver outreach` });
    if (bestCategory) insights.push({ type: 'info', text: `📦 ${bestCategory._id} food has the highest claim success rate` });
    insights.push({ type: 'tip', text: `💡 Post food at least 2 hours before expiry for best claim chances` });

    res.json({ insights, generatedAt: new Date() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { askBot, getInsights };
