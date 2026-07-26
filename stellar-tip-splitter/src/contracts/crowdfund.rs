// src/contracts/crowdfund.rs
//
// Soroban Smart Contract Spec for CrowdFundX
// Compiled for reference and architecture completeness.

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Campaign {
    pub id: u64,
    pub creator: Address,
    pub goal_amount: i128,
    pub raised_amount: i128,
    pub deadline: u64,
    pub withdrawn: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Investment {
    pub investor: Address,
    pub amount: i128,
    pub refunded: bool,
}

#[contract]
pub struct CrowdFundContract;

#[contractimpl]
impl CrowdFundContract {
    /// Initializes a campaign state.
    pub fn initialize(
        env: Env,
        creator: Address,
        goal_amount: i128,
        deadline: u64,
    ) -> u64 {
        assert!(goal_amount > 0, "Goal must be positive");
        assert!(deadline > env.ledger().timestamp(), "Deadline must be in the future");
        
        let campaign_id = 1; // Auto-incremented sequence in dynamic storage
        
        let campaign = Campaign {
            id: campaign_id,
            creator,
            goal_amount,
            raised_amount: 0,
            deadline,
            withdrawn: false,
        };
        
        env.storage().instance().set(&symbol_short!("CAMPAIGN"), &campaign);
        campaign_id
    }

    /// Invests native tokens into a campaign.
    pub fn invest(env: Env, investor: Address, amount: i128) {
        let mut campaign: Campaign = env.storage().instance().get(&symbol_short!("CAMPAIGN")).unwrap();
        
        assert!(env.ledger().timestamp() < campaign.deadline, "Campaign deadline has passed");
        assert!(amount > 0, "Investment must be positive");

        // Transfer funds from investor to contract escrow
        // token::Client::new(&env, &token_address).transfer(&investor, &env.current_contract_address(), &amount);

        campaign.raised_amount += amount;
        env.storage().instance().set(&symbol_short!("CAMPAIGN"), &campaign);

        // Record investment details
        let mut investments: Vec<Investment> = env.storage().instance().get(&symbol_short!("INVESTS")).unwrap_or(Vec::new(&env));
        investments.push_back(Investment {
            investor,
            amount,
            refunded: false,
        });
        env.storage().instance().set(&symbol_short!("INVESTS"), &investments);
    }

    /// Allows campaign creator to withdraw funds if goal is met.
    pub fn withdraw(env: Env, creator: Address) {
        let mut campaign: Campaign = env.storage().instance().get(&symbol_short!("CAMPAIGN")).unwrap();
        
        assert!(creator == campaign.creator, "Only creator can withdraw");
        assert!(env.ledger().timestamp() >= campaign.deadline, "Campaign is still active");
        assert!(campaign.raised_amount >= campaign.goal_amount, "Goal not met");
        assert!(!campaign.withdrawn, "Already withdrawn");

        campaign.withdrawn = true;
        env.storage().instance().set(&symbol_short!("CAMPAIGN"), &campaign);

        // Transfer contract balance to creator
        // token::Client::new(&env, &token_address).transfer(&env.current_contract_address(), &creator, &campaign.raised_amount);
    }

    /// Allows backers to claim refunds if campaign fails.
    pub fn refund(env: Env, investor: Address) {
        let campaign: Campaign = env.storage().instance().get(&symbol_short!("CAMPAIGN")).unwrap();
        
        assert!(env.ledger().timestamp() >= campaign.deadline, "Campaign is still active");
        assert!(campaign.raised_amount < campaign.goal_amount, "Goal was achieved, no refunds");

        let mut investments: Vec<Investment> = env.storage().instance().get(&symbol_short!("INVESTS")).unwrap();
        let mut refunded_amount = 0;
        let mut found = false;

        for i in 0..investments.len() {
            let mut inv = investments.get(i).unwrap();
            if inv.investor == investor && !inv.refunded {
                inv.refunded = true;
                refunded_amount = inv.amount;
                investments.set(i, inv);
                found = true;
                break;
            }
        }

        assert!(found, "No refundable investments found or already refunded");
        env.storage().instance().set(&symbol_short!("INVESTS"), &investments);

        // Transfer funds back to investor
        // token::Client::new(&env, &token_address).transfer(&env.current_contract_address(), &investor, &refunded_amount);
    }
}
