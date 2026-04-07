const FoodListing = require('../models/FoodListing');
const Claim = require('../models/Claim');
const User = require('../models/User');

const getOverallStats = async (req, res) => {
  try {
    const [totalListings, totalClaims, expiredCount, completedCount, totalDonors, totalReceivers] = await Promise.all([
      FoodListing.countDocuments(),
      Claim.countDocuments(),
      FoodListing.countDocuments({ status: 'expired' }),
      Claim.countDocuments({ status: 'completed' }),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'receiver' })
    ]);

    const totalMeals = await FoodListing.aggregate([
      { $match: { status: { $in: ['claimed', 'picked_up', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$mealsCount' } } }
    ]);

    const availableNow = await FoodListing.countDocuments({ status: 'available', expiryTime: { $gt: new Date() } });

    res.json({
      totalListings,
      totalClaims,
      expiredCount,
      completedCount,
      totalDonors,
      totalReceivers,
      totalMealsRescued: totalMeals[0]?.total || 0,
      availableNow,
      wasteRate: totalListings > 0 ? ((expiredCount / totalListings) * 100).toFixed(1) : 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTopDonors = async (req, res) => {
  try {
    const donors = await FoodListing.aggregate([
      { $group: { _id: '$donor', count: { $sum: 1 }, totalMeals: { $sum: '$mealsCount' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', organization: '$user.organization', count: 1, totalMeals: 1 } }
    ]);
    res.json(donors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTopReceivers = async (req, res) => {
  try {
    const receivers = await Claim.aggregate([
      { $match: { status: { $in: ['completed', 'picked_up'] } } },
      { $group: { _id: '$claimedBy', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', organization: '$user.organization', count: 1 } }
    ]);
    res.json(receivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDailyTrend = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const donations = await FoodListing.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, meals: { $sum: '$mealsCount' } } },
      { $sort: { _id: 1 } }
    ]);

    const expired = await FoodListing.aggregate([
      { $match: { status: 'expired', updatedAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ donations, expired });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCategoryStats = async (req, res) => {
  try {
    const stats = await FoodListing.aggregate([
      { $group: { _id: '$category', total: { $sum: 1 }, claimed: { $sum: { $cond: [{ $ne: ['$status', 'available'] }, 1, 0] } } } },
      { $project: { category: '$_id', total: 1, claimed: 1, claimRate: { $multiply: [{ $divide: ['$claimed', '$total'] }, 100] } } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDemoReports = async (req, res) => {
  try {
    const now = new Date();
    const generatedAt = now.toISOString();
    const month = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    res.json([
      {
        id: 'weekly-rescue-summary',
        title: 'Weekly Rescue Summary',
        period: 'Last 7 days',
        generatedAt,
        status: 'Ready',
        summary: 'Demo report for rescued meals, active claims, and urgent pickups across the platform.',
        metrics: [
          { label: 'Meals rescued', value: '420' },
          { label: 'Completed pickups', value: '31' },
          { label: 'Urgent listings handled', value: '12' }
        ],
        highlights: [
          'Cooked food had the highest claim activity.',
          'Most pickups were completed within two hours of posting.',
          'Koramangala and Indiranagar produced the most donation volume.'
        ]
      },
      {
        id: 'donor-performance',
        title: 'Donor Performance Report',
        period: month,
        generatedAt,
        status: 'Ready',
        summary: 'Demo report ranking donors by donation count, rescued meals, and pickup success.',
        metrics: [
          { label: 'Top donor meals', value: '180' },
          { label: 'Active donor partners', value: '8' },
          { label: 'Average claim rate', value: '76%' }
        ],
        highlights: [
          'Spice Gardens Restaurant leads demo donations this month.',
          'Packed food listings had steady receiver demand.',
          'Donors posting before peak lunch hours received faster claims.'
        ]
      },
      {
        id: 'wastage-risk',
        title: 'Food Wastage Risk Report',
        period: 'Current demo snapshot',
        generatedAt,
        status: 'Needs Review',
        summary: 'Demo report showing categories and locations that need faster receiver response.',
        metrics: [
          { label: 'High-risk listings', value: '5' },
          { label: 'Estimated waste risk', value: '18%' },
          { label: 'Suggested alerts', value: '9' }
        ],
        highlights: [
          'Listings under 60 minutes to expiry should be prioritized.',
          'Cooked food needs faster notification handling than packed food.',
          'Receivers near HSR Layout can reduce risk with earlier dispatch.'
        ]
      },
      {
        id: 'receiver-activity',
        title: 'Receiver Activity Report',
        period: month,
        generatedAt,
        status: 'Ready',
        summary: 'Demo report covering NGO claim activity, pickup reliability, and completed deliveries.',
        metrics: [
          { label: 'Total receiver claims', value: '64' },
          { label: 'Completed deliveries', value: '49' },
          { label: 'Pickup reliability', value: '91%' }
        ],
        highlights: [
          'Hope Foundation NGO is the most active demo receiver.',
          'Receiver activity is strongest around evening donation windows.',
          'Completion rates improve when donors include phone details.'
        ]
      }
    ]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getImpactPassport = async (req, res) => {
  try {
    const userId = req.user._id;
    const rescuedStatuses = ['claimed', 'picked_up', 'completed'];

    const [platformMeals, platformCompleted, platformListings] = await Promise.all([
      FoodListing.aggregate([
        { $match: { status: { $in: rescuedStatuses } } },
        { $group: { _id: null, total: { $sum: '$mealsCount' } } }
      ]),
      Claim.countDocuments({ status: 'completed' }),
      FoodListing.countDocuments()
    ]);

    let personalMeals = 0;
    let personalActions = 0;
    let recentActivity = [];

    if (req.user.role === 'donor') {
      const [mealResult, actions, recent] = await Promise.all([
        FoodListing.aggregate([
          { $match: { donor: userId, status: { $in: rescuedStatuses } } },
          { $group: { _id: null, total: { $sum: '$mealsCount' } } }
        ]),
        FoodListing.countDocuments({ donor: userId }),
        FoodListing.find({ donor: userId })
          .sort({ createdAt: -1 })
          .limit(4)
          .select('foodName mealsCount status createdAt')
      ]);
      personalMeals = mealResult[0]?.total || 0;
      personalActions = actions;
      recentActivity = recent.map(item => ({
        title: item.foodName,
        detail: `${item.mealsCount} meals, ${item.status.replace('_', ' ')}`,
        date: item.createdAt
      }));
    } else if (req.user.role === 'receiver') {
      const [claims, actions] = await Promise.all([
        Claim.find({ claimedBy: userId })
          .populate('foodListing', 'foodName mealsCount status')
          .sort({ createdAt: -1 })
          .limit(8),
        Claim.countDocuments({ claimedBy: userId })
      ]);
      personalMeals = claims.reduce((sum, claim) => {
        const rescued = ['picked_up', 'completed', 'claimed'].includes(claim.status);
        return rescued ? sum + (claim.foodListing?.mealsCount || 0) : sum;
      }, 0);
      personalActions = actions;
      recentActivity = claims.slice(0, 4).map(claim => ({
        title: claim.foodListing?.foodName || 'Food donation',
        detail: `${claim.foodListing?.mealsCount || 0} meals, ${claim.status.replace('_', ' ')}`,
        date: claim.createdAt
      }));
    } else {
      personalMeals = platformMeals[0]?.total || 0;
      personalActions = platformListings;
      recentActivity = await FoodListing.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .select('foodName mealsCount status createdAt')
        .then(items => items.map(item => ({
          title: item.foodName,
          detail: `${item.mealsCount} meals, ${item.status.replace('_', ' ')}`,
          date: item.createdAt
        })));
    }

    const badges = [
      {
        name: 'First Rescue',
        description: 'Started the rescue journey.',
        unlocked: personalActions > 0
      },
      {
        name: 'Meal Multiplier',
        description: 'Helped move 50 or more meals.',
        unlocked: personalMeals >= 50
      },
      {
        name: 'Community Shield',
        description: 'Supported 100 or more rescued meals.',
        unlocked: personalMeals >= 100
      },
      {
        name: 'Zero Waste Champion',
        description: 'Reached 250 rescued meals.',
        unlocked: personalMeals >= 250
      }
    ];

    const nextActions = {
      donor: [
        'Post food at least two hours before expiry.',
        'Add phone details and clear pickup notes.',
        'Use the donor claim panel to confirm pickups quickly.'
      ],
      receiver: [
        'Check urgent listings before peak meal windows.',
        'Mark pickups and deliveries as soon as they happen.',
        'Use map view to prioritize nearby donations.'
      ],
      admin: [
        'Review demo reports for risk hotspots.',
        'Watch the waste rate and claim completion rate.',
        'Deactivate stale test accounts before a presentation.'
      ]
    };

    res.json({
      user: {
        name: req.user.name,
        role: req.user.role,
        organization: req.user.organization
      },
      personal: {
        mealsRescued: personalMeals,
        actionsCompleted: personalActions,
        equivalentPlates: personalMeals,
        estimatedFamiliesServed: Math.floor(personalMeals / 4),
        badgeCount: badges.filter(badge => badge.unlocked).length
      },
      platform: {
        mealsRescued: platformMeals[0]?.total || 0,
        completedPickups: platformCompleted,
        totalListings: platformListings
      },
      badges,
      nextActions: nextActions[req.user.role] || nextActions.receiver,
      recentActivity
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getOverallStats, getTopDonors, getTopReceivers, getDailyTrend, getCategoryStats, getDemoReports, getImpactPassport };
