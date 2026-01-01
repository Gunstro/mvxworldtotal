# MegaMatrix Commission Engine - PRD

## 1. Executive Summary
- **Project**: MegaMatrix Commission Engine (Core Revenue System)
- **Purpose**: Automated commission distribution, user tier management, and poverty fund allocation for MegatonCities MVX
- **Currency**: GBP (£) exclusively (future: AFRO pegged 1:1 to GBP)
- **Core Principle**: "Auto-upgrade users to Ambassador tier as quickly as possible"

## 2. Business Objectives
- Automate 40% matrix commission distribution (20%/3%/4%/5%/8% upward flow)
- Enforce tier-based monthly earning caps
- Auto-manage user upgrades using earned commissions
- Allocate surplus to Poverty Fund (80% relief, 20% MegaBucks)
- Provide real-time financial visibility to users
- Ensure system scales to billions of transactions (Hedera Hashgraph)

## 3. User Personas
| Persona | Description |
|---------|-------------|
| Free User | Entry-level, £95 monthly cap, auto-upgrades to Novice at £95 |
| Standard User | Novice → City Dweller → City Patron → Executive → Ambassador |
| Premiere User | Gold Premiere & VIP Gold Premiere (Level 2 only) |
| Founder User | Gold Founder & VIP Gold Founder (Level 1 only) |
| Poverty Relief Ltd | Level 0 entity, receives overflow commissions |
| Megaton Devco Ltd | Platform owner, receives 31.5% revenue share |

## 4. Visa Tier Specifications (GBP)

| Tier | Once-off | Monthly Fee | Monthly Cap | Level | Stock Qty | Auto-upgrade Rule |
|------|----------|-------------|-------------|-------|-----------|-------------------|
| Free | £0 | £0 | £95 | 3+ | Unlimited | At £95 → Novice |
| Novice | £95 | £125 | £300 | 3+ | Unlimited | Wallet ≥ £295 |
| City Dweller | £295 | £195 | £1,350 | 3+ | Unlimited | Wallet ≥ £395 |
| City Patron | £395 | £325 | £2,150 | 3+ | Unlimited | Wallet ≥ £495 |
| Executive | £495 | £395 | £6,500 | 3+ | Unlimited | Wallet ≥ £695 |
| Ambassador | £695 | £545 | £8,500 | 3+ | Unlimited | Wallet ≥ £985 |
| Gold Premiere | £985 | £785 | £12,500 | 2 | 175,000 | Wallet ≥ £1,250 |
| VIP Gold Premiere | £1,250 | £995 | £18,000 | 2 | 225,000 | Wallet ≥ £2,250 |
| Gold Founder | £2,250 | £0 | £20,000 | 1 | 8,250 | Wallet ≥ £3,750 |
| VIP Gold Founder | £3,750 | £0 | £22,500 | 1 | 11,750 | MAX TIER |

## 5. Matrix Structure

### 5.1 Fixed Hierarchy
```
Level 0: Poverty Relief Ltd (1 position - ROOT)
    │
    └── Level 1: 20,000 positions (Founder visas ONLY)
         ├── VIP Gold Founder: 11,750 positions
         └── VIP (Gold Founder): 8,250 positions
              │
              └── Level 2: 400,000 positions (Premiere visas ONLY)
                   ├── Gold Premiere: 225,000 positions
                   └── Premiere: 175,000 positions
                        │
                        └── Level 3+: UNLIMITED positions (Standard visas)
                             Free, Novice, City Dweller, City Patron, 
                             Executive, Ambassador
```

### 5.2 Sponsorship Capacity
| Level | Max Children |
|-------|--------------|
| Level 0 (Poverty Relief) | 20,000 |
| Level 1 (Founders) | 20 each |
| Level 2 (Premiere) | 10 each |
| Level 3+ (Standard) | 5 each |

### 5.3 Commission Flow
- **Crosses ALL level boundaries**: Standard → Premiere → Founder
- **Everyone receives commission**: No visa tier restrictions
- **No marginalization**: Free users receive full 20% if they're upline
- **Missing uplines**: Commission goes to Poverty Fund

---

## 6. OPEN Spots System

### 6.1 What are OPEN Spots?
Pre-allocated **placeholder positions** in the matrix that:
- Hold structural positions in the tree
- Accumulate commissions from their downline
- Get claimed by new users (first-come-first-served)

### 6.2 OPEN Spot Rules
| Rule | Value |
|------|-------|
| **Commission Cap** | AF 1,000 maximum |
| **On Claim Split** | 50% → New owner wallet, 50% → Poverty Fund |
| **Expiry** | Never expire |
| **Assignment** | Round-robin across parent nodes |

### 6.3 Round-Robin Assignment
Instead of filling one parent completely, orphan users are distributed evenly:
```
Parent A: [1] [ ] [ ] [ ] [ ]  ← First orphan
Parent B: [2] [ ] [ ] [ ] [ ]  ← Second orphan
Parent C: [3] [ ] [ ] [ ] [ ]  ← Third orphan
Parent A: [4] [ ] [ ] [ ] [ ]  ← Fourth orphan (back to A)
```

### 6.4 Initial Setup (Launch)
- **350 Legacy Founders** imported (early investors, FREE positions)
- When 350 Founders loaded:
  - 350 × 20 = **7,000 Level 2 OPEN spots** created
  - 7,000 × 10 = **70,000 Level 3 OPEN spots** created
- Provides growth buffer for initial user signups

### 6.5 OPEN Spot Claim Example
```
OPEN Spot has accumulated AF 800 in commissions
    ↓
New orphan user claims this spot
    ↓
├── AF 400 → New user's wallet (starting bonus!)
└── AF 400 → Poverty Fund
```

---

## 7. Position Assignment Rules

### 7.1 Users WITH Referrer
1. Find referrer's position in matrix
2. If referrer has space → Place directly under referrer
3. If referrer full → Spillover to referrer's subtree (BFS)
4. Respect visa level restrictions

### 7.2 Orphan Users (No Referrer)
1. Find OPEN spots at appropriate level
2. Use round-robin assignment across available OPEN spots
3. Claim OPEN spot and inherit 50% of accumulated commissions


## 6. Commission Distribution

### 6.1 Trigger
- Visa purchase (after 10-day holding period)

### 6.2 Calculation
- 40% of purchase → Matrix commissions
- Distribution: 5 levels upward from purchaser
- **Rates**: 20% → 3% → 4% → 5% → 8%
- Overflow: Missing upline levels → Poverty Relief Ltd
- MegaPartner: Separate 28.5% geographic commission (Phase 2)

### 6.3 Financial Flow Example (£100 Purchase)
```
Total: £100
├── Company Share: £31.50 (31.5%)
│   ├── Product Costs: TBD
│   ├── Platform Costs: TBD
│   └── Profit: TBD
│
└── Commission Pool: £68.50 (68.5%)
    ├── Matrix Commissions: £40.00 (40%)
    │   ├── Upline Level 1: £20.00 (20%)
    │   ├── Upline Level 2: £3.00 (3%)
    │   ├── Upline Level 3: £4.00 (4%)
    │   ├── Upline Level 4: £5.00 (5%)
    │   └── Upline Level 5: £8.00 (8%)
    │
    └── MegaPartner Commissions: £28.50 (28.5%) [Phase 2]
```

## 7. Auto-Upgrade System

### 7.1 Priority Order
1. Check if wallet ≥ next tier price
2. If YES → Auto-upgrade immediately
3. If NO → Check monthly fee trigger
4. If NO → Check cap surplus

### 7.2 Rules
- Free users: Auto-upgrade to Novice at £95 wallet
- Paid users: Upgrade when wallet ≥ next tier price
- Goal: Push all users to Ambassador tier

## 8. Monthly Fee Management

### 8.1 Trigger
- Monthly earnings ≥ (monthly_fee × 110%)

### 8.2 Example: City Dweller (£195 monthly fee)
- Trigger at: £195 × 110% = £214.50
- Deduct: £195 from wallet
- Excess: £19.50 stays in wallet for upgrades

## 9. Cap Enforcement

### 9.1 Rule
- Wallet cannot exceed monthly cap

### 9.2 Process
1. Check upgrade possibility first
2. If upgrade possible → upgrade (increases cap)
3. If upgrade not possible → surplus to Poverty Fund
4. Remaining balance ≤ monthly cap

## 10. Poverty Fund Allocation

### 10.1 Sources
- Cap surplus (when users can't upgrade)
- Overflow commissions (missing upline levels)
- Direct donations

### 10.2 Monthly Distribution
- 80% → Actual poverty relief projects
- 20% → MegaBucks value increase

## 11. Phased Implementation

### Phase 1: Core Engine (Weeks 1-4)
- [x] Database schema (GBP) - Visas table exists
- [ ] Matrix positions table
- [ ] User wallet tracking
- [ ] User registration & visa assignment
- [ ] Basic commission calculation
- [ ] Auto-upgrade for Free → Novice
- [ ] Monthly fee triggers

### Phase 2: Enhanced Features (Weeks 5-8)
- [ ] Full auto-upgrade system
- [ ] Cap enforcement & Poverty Fund
- [ ] Matrix visualization API
- [ ] Admin dashboard
- [ ] Audit logging

### Phase 3: Scale & Integration (Weeks 9-12)
- [ ] MegaPartner commission system
- [ ] Payment gateway integration
- [ ] Advanced reporting
- [ ] Performance optimization
- [ ] Production deployment (Hedera Hashgraph)

## 12. Database Tables Required

### Phase 1 Tables
1. `matrix_positions` - User positions in the matrix
2. `user_wallets` - User wallet balances and tracking
3. `commission_transactions` - All commission events
4. `visa_purchases` - Purchase history with holding period
5. `poverty_fund` - Poverty fund balance tracking
6. `megabucks_fund` - MegaBucks fund balance tracking

### Existing Tables to Modify
1. `visas` - Already exists, may need adjustments
2. `profiles` - Link to matrix position and wallet
