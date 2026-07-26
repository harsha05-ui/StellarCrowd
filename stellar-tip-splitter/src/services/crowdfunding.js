// src/services/crowdfunding.js
//
// Crowdfunding state management engine (Simulated smart contract state).

const CAMPAIGNS_KEY = 'stellar_crowdfund_campaigns_v2';

const getInitialSeed = () => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      id: '1',
      title: 'Orion-1 Space Probe',
      description: 'Sending a low-cost, open-source atmospheric probe to map outer orbit radiation levels and stream telemetry in real-time. This mission aims to gather crucial weather and radiation data for open science.',
      targetAmount: 500,
      raisedAmount: 420,
      deadline: new Date(now + 5 * dayMs).toISOString(),
      category: 'Technology',
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
      creator: 'GB7T77777777777777777777777777777777777777777777777777777777',
      creatorName: 'Orion Aerospace Group',
      withdrawn: false,
      investors: [
        { address: 'GD4K12345678901234567890123456789012345678901234567890123456', amount: 150, refunded: false, txHash: '5c28...1234', timestamp: new Date(now - 1.5 * dayMs).toISOString() },
        { address: 'GC3A99999999999999999999999999999999999999999999999999999999', amount: 270, refunded: false, txHash: '8b91...5678', timestamp: new Date(now - 8 * 3600 * 1000).toISOString() },
      ],
      comments: [
        { author: 'GD4K12345678901234567890123456789012345678901234567890123456', text: 'Stellar space tech! Stoked to see this telemetry feed live on testnet.', timestamp: new Date(now - 1.2 * dayMs).toISOString() }
      ],
      favorites: []
    },
    {
      id: '2',
      title: 'Ocean Plastic Cleanup Bot',
      description: 'An autonomous solar-powered micro-boat designed to patrol harbors, collect microplastics, and monitor water quality parameters. Capable of mapping plastic density logs in real time.',
      targetAmount: 300,
      raisedAmount: 350,
      deadline: new Date(now - 2 * dayMs).toISOString(), // Ended (success)
      category: 'Environment',
      coverImage: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=600&auto=format&fit=crop&q=80',
      creator: 'GB7T77777777777777777777777777777777777777777777777777777777', // User matches creator
      creatorName: 'Blue Horizon Tech',
      withdrawn: false,
      investors: [
        { address: 'GD4K12345678901234567890123456789012345678901234567890123456', amount: 200, refunded: false, txHash: '21ab...a1b2', timestamp: new Date(now - 6 * dayMs).toISOString() },
        { address: 'GC3A99999999999999999999999999999999999999999999999999999999', amount: 150, refunded: false, txHash: 'f4d9...3cd4', timestamp: new Date(now - 4 * dayMs).toISOString() },
      ],
      comments: [
        { author: 'GC3A99999999999999999999999999999999999999999999999999999999', text: 'This will clean up our local marina! Funding target achieved!', timestamp: new Date(now - 3.8 * dayMs).toISOString() }
      ],
      favorites: []
    },
    {
      id: '3',
      title: 'Retro Arcade Cabinet',
      description: 'A modular, Raspberry Pi-powered mini arcade console featuring a hand-finished walnut chassis and high-fidelity mechanical controls.',
      targetAmount: 400,
      raisedAmount: 120,
      deadline: new Date(now - 1 * dayMs).toISOString(), // Ended (failed)
      category: 'Art',
      coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      creator: 'GA9T99999999999999999999999999999999999999999999999999999999',
      creatorName: 'Classic Mechanics Ltd',
      withdrawn: false,
      investors: [
        { address: 'GD4K12345678901234567890123456789012345678901234567890123456', amount: 120, refunded: false, txHash: 'e71c...8e90', timestamp: new Date(now - 3 * dayMs).toISOString() },
      ],
      comments: [],
      favorites: []
    },
    {
      id: '4',
      title: 'Smart Park Solar Benches',
      description: 'Installing solar-powered park benches in public greenspaces equipped with Qi wireless chargers, environmental sensors, and localized community info hubs.',
      targetAmount: 600,
      raisedAmount: 620,
      deadline: new Date(now + 12 * dayMs).toISOString(),
      category: 'Community',
      coverImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80',
      creator: 'GB8X88888888888888888888888888888888888888888888888888888888',
      creatorName: 'Smart Park Initiative',
      withdrawn: false,
      investors: [
        { address: 'GD4K12345678901234567890123456789012345678901234567890123456', amount: 320, refunded: false, txHash: 'd3f2...a7b8', timestamp: new Date(now - 2 * dayMs).toISOString() },
        { address: 'GC3A99999999999999999999999999999999999999999999999999999999', amount: 300, refunded: false, txHash: '9a9f...c2d4', timestamp: new Date(now - 4 * 3600 * 1000).toISOString() },
      ],
      comments: [
        { author: 'GD4K12345678901234567890123456789012345678901234567890123456', text: 'Backed this. Perfect initiative for public spaces.', timestamp: new Date(now - 1.8 * dayMs).toISOString() }
      ],
      favorites: []
    },
  ];
};

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

  // Ensure arrays are initialized
  return {
    ...campaign,
    status,
    comments: campaign.comments || [],
    favorites: campaign.favorites || [],
  };
}

function saveCampaigns(campaigns) {
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
}

export function createCampaign({ title, description, targetAmount, deadline, category, coverImage, creator, creatorName }) {
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
    creatorName: creatorName || 'Anonymous Creator',
    withdrawn: false,
    investors: [],
    comments: [],
    favorites: [],
  };

  campaigns.push(newCampaign);
  saveCampaigns(campaigns);
  return appendStatus(newCampaign);
}

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

  campaigns[index].raisedAmount = Number((campaigns[index].raisedAmount + investAmount).toFixed(7));
  campaigns[index].investors = campaigns[index].investors || [];
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

export function withdrawCampaignFunds(campaignId, creatorAddress) {
  const campaigns = getCampaigns();
  const index = campaigns.findIndex(c => c.id === campaignId);
  if (index === -1) throw new Error('Campaign not found.');

  const campaign = appendStatus(campaigns[index]);
  if (campaign.creator !== creatorAddress) {
    throw new Error('Only the campaign creator can withdraw funds.');
  }

  if (campaign.status !== 'successful') {
    throw new Error('Funds can only be withdrawn from successful campaigns.');
  }

  if (campaigns[index].withdrawn) {
    throw new Error('Funds have already been withdrawn.');
  }

  campaigns[index].withdrawn = true;
  saveCampaigns(campaigns);
  return appendStatus(campaigns[index]);
}

export function claimInvestorRefund(campaignId, investorAddress) {
  const campaigns = getCampaigns();
  const index = campaigns.findIndex(c => c.id === campaignId);
  if (index === -1) throw new Error('Campaign not found.');

  const campaign = appendStatus(campaigns[index]);
  if (campaign.status !== 'failed') {
    throw new Error('Refunds are only available for failed campaigns.');
  }

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

/**
 * Adds a comment to a campaign.
 */
export function addCampaignComment(campaignId, authorName, text) {
  if (!text || !text.trim()) {
    throw new Error('Comment text cannot be empty.');
  }

  const campaigns = getCampaigns();
  const index = campaigns.findIndex(c => c.id === campaignId);
  if (index === -1) throw new Error('Campaign not found.');

  campaigns[index].comments = campaigns[index].comments || [];
  campaigns[index].comments.push({
    author: authorName,
    text: text.trim(),
    timestamp: new Date().toISOString(),
  });

  saveCampaigns(campaigns);
  return appendStatus(campaigns[index]);
}

/**
 * Toggles a campaign's favorite status for a given user.
 */
export function toggleFavoriteCampaign(campaignId, userAddress) {
  if (!userAddress) throw new Error('User address is required to favorite.');

  const campaigns = getCampaigns();
  const index = campaigns.findIndex(c => c.id === campaignId);
  if (index === -1) throw new Error('Campaign not found.');

  campaigns[index].favorites = campaigns[index].favorites || [];
  const favIndex = campaigns[index].favorites.indexOf(userAddress);
  if (favIndex === -1) {
    campaigns[index].favorites.push(userAddress);
  } else {
    campaigns[index].favorites.splice(favIndex, 1);
  }

  saveCampaigns(campaigns);
  return appendStatus(campaigns[index]);
}
