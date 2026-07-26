// src/lib/crowdfunding.js
//
// Crowdfunding state management engine.
// Simulated smart contract state using localStorage with pre-seeded data.

const CAMPAIGNS_KEY = 'stellar_crowdfund_campaigns_v1';

// Seed initial campaigns if none exist.
const getInitialSeed = () => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      id: '1',
      title: 'Orion-1 Space Probe',
      description: 'Sending a low-cost, open-source atmospheric probe to map outer orbit radiation levels and stream telemetry in real-time.',
      targetAmount: 500,
      raisedAmount: 420,
      deadline: new Date(now + 5 * dayMs).toISOString(), // 5 days from now
      category: 'Technology',
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
      creator: 'GB7T77777777777777777777777777777777777777777777777777777777', // Sample creator address
      withdrawn: false,
      investors: [
        { address: 'GD4K12345678901234567890123456789012345678901234567890123456', amount: 150, refunded: false, txHash: '5c28...1234', timestamp: new Date(now - 1.5 * dayMs).toISOString() },
        { address: 'GC3A99999999999999999999999999999999999999999999999999999999', amount: 270, refunded: false, txHash: '8b91...5678', timestamp: new Date(now - 8 * 3600 * 1000).toISOString() },
      ],
    },
    {
      id: '2',
      title: 'Ocean Plastic Cleanup Bot',
      description: 'An autonomous solar-powered micro-boat designed to patrol harbors, collect microplastics, and monitor water quality parameters.',
      targetAmount: 300,
      raisedAmount: 350,
      deadline: new Date(now - 2 * dayMs).toISOString(), // Ended 2 days ago
      category: 'Environment',
      coverImage: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=600&auto=format&fit=crop&q=80',
      creator: 'GB7T77777777777777777777777777777777777777777777777777777777', // Match user to allow creator test actions
      withdrawn: false,
      investors: [
        { address: 'GD4K12345678901234567890123456789012345678901234567890123456', amount: 200, refunded: false, txHash: '21ab...a1b2', timestamp: new Date(now - 6 * dayMs).toISOString() },
        { address: 'GC3A99999999999999999999999999999999999999999999999999999999', amount: 150, refunded: false, txHash: 'f4d9...3cd4', timestamp: new Date(now - 4 * dayMs).toISOString() },
      ],
    },
    {
      id: '3',
      title: 'Retro Arcade Cabinet',
      description: 'A modular, Raspberry Pi-powered mini arcade console featuring a hand-finished walnut chassis and high-fidelity mechanical controls.',
      targetAmount: 400,
      raisedAmount: 120,
      deadline: new Date(now - 1 * dayMs).toISOString(), // Ended 1 day ago (failed)
      category: 'Art',
      coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      creator: 'GA9T99999999999999999999999999999999999999999999999999999999',
      withdrawn: false,
      investors: [
        { address: 'GD4K12345678901234567890123456789012345678901234567890123456', amount: 120, refunded: false, txHash: 'e71c...8e90', timestamp: new Date(now - 3 * dayMs).toISOString() },
      ],
    },
    {
      id: '4',
      title: 'Smart Park Solar Benches',
      description: 'Installing solar-powered park benches in public greenspaces equipped with Qi wireless chargers, environmental sensors, and localized community info hubs.',
      targetAmount: 600,
      raisedAmount: 620,
      deadline: new Date(now + 12 * dayMs).toISOString(), // 12 days from now
      category: 'Community',
      coverImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80',
      creator: 'GB8X88888888888888888888888888888888888888888888888888888888',
      withdrawn: false,
      investors: [
        { address: 'GD4K12345678901234567890123456789012345678901234567890123456', amount: 320, refunded: false, txHash: 'd3f2...a7b8', timestamp: new Date(now - 2 * dayMs).toISOString() },
        { address: 'GC3A99999999999999999999999999999999999999999999999999999999', amount: 300, refunded: false, txHash: '9a9f...c2d4', timestamp: new Date(now - 4 * 3600 * 1000).toISOString() },
      ],
    },
  ];
};

/**
 * Gets all campaigns from localStorage, dynamically calculating the status.
 */
export function getCampaigns() {
  let list = localStorage.getItem(CAMPAIGNS_KEY);
  if (!list) {
    const seed = getInitialSeed();
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(seed));
    return seed.map(c => appendStatus(c));
  }
  try {
    const campaigns = JSON.parse(list);
    return campaigns.map(c => appendStatus(c));
  } catch (err) {
    console.error('Failed to parse campaigns, resetting to seed', err);
    const seed = getInitialSeed();
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(seed));
    return seed.map(c => appendStatus(c));
  }
}

/**
 * Helper to compute status dynamically based on current time.
 */
function appendStatus(campaign) {
  const now = new Date();
  const deadlineDate = new Date(campaign.deadline);
  const hasEnded = now > deadlineDate;

  let status = 'active';
  if (hasEnded) {
    if (campaign.raisedAmount >= campaign.targetAmount) {
      status = 'successful';
    } else {
      status = 'failed';
    }
  }

  return { ...campaign, status };
}

/**
 * Saves campaigns back to localStorage.
 */
function saveCampaigns(campaigns) {
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
}

/**
 * Creates a new fundraising campaign.
 */
export function createCampaign({ title, description, targetAmount, deadline, category, coverImage, creator }) {
  if (!title || !description || !targetAmount || !deadline || !category || !creator) {
    throw new Error('All fields are required.');
  }

  const target = parseFloat(targetAmount);
  if (isNaN(target) || target <= 0) {
    throw new Error('Target amount must be a positive number.');
  }

  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
    throw new Error('Deadline must be a valid future date.');
  }

  const campaigns = getCampaigns();
  const newCampaign = {
    id: String(campaigns.length + 1 + Date.now()),
    title,
    description,
    targetAmount: target,
    raisedAmount: 0,
    deadline: deadlineDate.toISOString(),
    category,
    coverImage: coverImage || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    creator,
    withdrawn: false,
    investors: [],
  };

  campaigns.push(newCampaign);
  saveCampaigns(campaigns);
  return appendStatus(newCampaign);
}

/**
 * Invests in an active campaign.
 */
export function investInCampaign(campaignId, investorAddress, amount, txHash) {
  const campaigns = getCampaigns();
  const index = campaigns.findIndex(c => c.id === campaignId);
  if (index === -1) throw new Error('Campaign not found.');

  const campaign = appendStatus(campaigns[index]);
  if (campaign.status !== 'active') {
    throw new Error('This campaign is no longer active.');
  }

  const investAmount = parseFloat(amount);
  if (isNaN(investAmount) || investAmount <= 0) {
    throw new Error('Investment amount must be greater than zero.');
  }

  // Update raised amount and add investor details
  campaigns[index].raisedAmount = Number((campaigns[index].raisedAmount + investAmount).toFixed(7));
  campaigns[index].investors.push({
    address: investorAddress,
    amount: investAmount,
    refunded: false,
    txHash: txHash || `sim_${Math.random().toString(36).substring(2, 10)}`,
    timestamp: new Date().toISOString(),
  });

  saveCampaigns(campaigns);
  return appendStatus(campaigns[index]);
}

/**
 * Withdraws funds as campaign creator.
 */
export function withdrawCampaignFunds(campaignId, creatorAddress) {
  const campaigns = getCampaigns();
  const index = campaigns.findIndex(c => c.id === campaignId);
  if (index === -1) throw new Error('Campaign not found.');

  const campaign = appendStatus(campaigns[index]);
  if (campaign.creator !== creatorAddress) {
    throw new Error('Only the campaign creator can withdraw funds.');
  }

  if (campaign.status !== 'successful') {
    throw new Error('Funds can only be withdrawn from successful, completed campaigns.');
  }

  if (campaigns[index].withdrawn) {
    throw new Error('Funds have already been withdrawn.');
  }

  campaigns[index].withdrawn = true;
  saveCampaigns(campaigns);
  return appendStatus(campaigns[index]);
}

/**
 * Claims a refund as an investor of a failed campaign.
 */
export function claimInvestorRefund(campaignId, investorAddress) {
  const campaigns = getCampaigns();
  const index = campaigns.findIndex(c => c.id === campaignId);
  if (index === -1) throw new Error('Campaign not found.');

  const campaign = appendStatus(campaigns[index]);
  if (campaign.status !== 'failed') {
    throw new Error('Refunds are only available for failed campaigns.');
  }

  // Check if this user is an investor who has not been refunded yet
  let updated = false;
  let hasInvested = false;
  let alreadyRefunded = true;

  campaigns[index].investors = campaigns[index].investors.map(inv => {
    if (inv.address === investorAddress) {
      hasInvested = true;
      if (!inv.refunded) {
        alreadyRefunded = false;
        updated = true;
        return { ...inv, refunded: true };
      }
    }
    return inv;
  });

  if (!hasInvested) {
    throw new Error('You did not invest in this campaign.');
  }

  if (alreadyRefunded && !updated) {
    throw new Error('You have already claimed your refund.');
  }

  saveCampaigns(campaigns);
  return appendStatus(campaigns[index]);
}
