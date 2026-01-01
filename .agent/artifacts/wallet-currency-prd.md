# MegaVX World - Wallet & Currency System PRD

## 1. Executive Summary

**Project:** Multi-Currency Wallet Engine  
**Purpose:** Central financial hub for all platform transactions  
**Core Principle:** "Near-perpetual revenue cycle through strategic fee redistribution"

---

## 2. Key Architecture Decisions

### ✅ Platform Currencies Only
The MegaVX platform handles **three internal currencies ONLY**:
1. **AFRO (AF)** - Platform stablecoin (1:1 GBP backing)
2. **MegaBucks (MB)** - Platform engagement currency
3. **NFTs** - Digital assets

### ✅ GBP is External
- GBP (£) is **NOT stored on the platform**
- Users convert AF → GBP via bank-issued debit cards
- Once converted to GBP, user is under **bank jurisdiction**

### ✅ Banking Partner Integration
- Partner bank provides **debit card accounts** for users
- Platform stores AF; Bank stores GBP
- Clean regulatory separation

---

## 3. Banking Infrastructure

### 3.1 Four Bank Accounts Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        MEGAVX BANKING INFRASTRUCTURE                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────┐    ┌──────────────────────┐                          │
│  │  1. MAIN OPERATING   │    │  2. MB BACKING       │                          │
│  │     ACCOUNT          │    │     ACCOUNT          │                          │
│  │                      │    │                      │                          │
│  │  Purpose:            │    │  Purpose:            │                          │
│  │  • Visa payments     │    │  • 100% MB backing   │                          │
│  │  • Operational costs │    │  • Authenticates MB  │                          │
│  │  • Company revenue   │    │    value at all times│                          │
│  │                      │    │                      │                          │
│  │  Balance: £X,XXX,XXX │    │  Balance: £X,XXX,XXX │                          │
│  └──────────────────────┘    └──────────────────────┘                          │
│                                                                                  │
│  ┌──────────────────────┐    ┌──────────────────────┐                          │
│  │  3. POVERTY FUND     │    │  4. USER DEBIT CARD  │                          │
│  │     ACCOUNT          │    │     ACCOUNTS         │                          │
│  │                      │    │     (Bank-Managed)   │                          │
│  │  Purpose:            │    │                      │                          │
│  │  • 80% relief funds  │    │  Purpose:            │                          │
│  │  • 20% MB value boost│    │  • User GBP holdings │                          │
│  │  • Overflow comms    │    │  • AF → GBP converts │                          │
│  │                      │    │  • Spending/ATM      │                          │
│  │  Balance: £X,XXX,XXX │    │                      │                          │
│  └──────────────────────┘    │  Under bank control  │                          │
│                              │  Not platform data   │                          │
│                              └──────────────────────┘                          │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Account Purposes

| Account | Purpose | Funding Source |
|---------|---------|----------------|
| **Main Operating** | Company operations, visa revenue | User visa purchases |
| **MB Backing** | Authenticates MB value | 20% company turnover + 20% poverty allocation |
| **Poverty Fund** | Relief programs + MB boost | Overflow commissions, cap surplus |
| **User Debit Cards** | User GBP holdings | AF → GBP conversions |

---

## 4. Currency Types

### 4.1 AFRO (AF) - Platform Stablecoin

| Property | Details |
|----------|---------|
| **Symbol** | AF |
| **Type** | Platform stablecoin pegged 1:1 to GBP |
| **Decimals** | 2 (e.g., 100.50 AF) |
| **Backing** | 100% GBP in Main Operating Account |
| **Storage** | Platform wallet only |

**AF Transaction Types:**
- Earned from commissions
- Visa purchases/upgrades
- Wallet-to-wallet transfers (barter/trade)
- Territory/NFT purchases
- Convert to GBP (via bank debit card)

---

### 4.2 MegaBucks (MB) - Engagement Currency

| Property | Details |
|----------|---------|
| **Symbol** | MB (MegaBillion) |
| **Type** | Platform engagement currency |
| **Decimals** | 0 (whole numbers only) |
| **Backing** | 100% GBP in MB Backing Account |

**MB Value Calculation (Real-Time):**
```
MB Value in AF = MB Backing Account Balance (£) / Total MB in Circulation

Example:
If MB Account = £1,000,000 and Total MB = 1,000,000
Then 1 MB = £1.00 = 1 AF
```

**MB Earning Methods:**
| Activity | MB Earned | Frequency |
|----------|-----------|-----------|
| Daily Login | TBD MB | Once per day |
| Post Created | TBD MB | Per post |
| Comment Made | TBD MB | Per comment |
| Ad Viewed | TBD MB | Per view |
| Ad Placed | TBD MB | Per ad |
| Referral Signup | TBD MB | Per referral |
| Game Win | TBD MB | Per win |

---

### 4.3 NFTs - Digital Assets

| Property | Details |
|----------|---------|
| **Type** | Non-fungible tokens |
| **Standard** | Future: Hedera HTS |
| **Pricing** | In AF or MB |

**NFT Categories:**
1. Territory NFTs - Land ownership
2. Collectible NFTs - Art, achievements
3. Badge NFTs - Status indicators
4. Utility NFTs - Platform perks

---

## 5. Payment Settlement Flow

### 5.1 Visa Purchase Settlement

```
User pays £495 for Executive Visa
│
├── Step 1: Payment received to Main Operating Account
│   └── GBP £495 → Main Account
│
├── Step 2: 10-day holding period begins
│   └── User sees "Pending: 495 AF"
│
├── Step 3: After 10 days - Settlement begins
│
│   ├── Commission Pool (40% = £198)
│   │   ├── Upline Level 1: 20% = £99.00 AF
│   │   ├── Upline Level 2: 3% = £14.85 AF
│   │   ├── Upline Level 3: 4% = £19.80 AF
│   │   ├── Upline Level 4: 5% = £24.75 AF
│   │   ├── Upline Level 5: 8% = £39.60 AF
│   │   └── Missing levels → Poverty Fund
│   │
│   ├── MegaPartner Pool (28.5% = £141.08) [Phase 2]
│   │   └── Geographic territory owners
│   │
│   └── Company Share (31.5% = £155.92)
│       ├── 20% → MB Backing Account (£31.18)
│       └── 80% → Operating/Expenses (£124.74)
│
├── Step 4: Poverty Fund Allocation
│   └── From overflow + cap surplus:
│       ├── 80% → Poverty Relief programs
│       └── 20% → MB Backing Account
│
└── Step 5: MB Value automatically updated
    └── New MB Value = MB Account Balance / Total MB
```

---

## 6. AF ↔ GBP Conversion (Bank Debit Card)

### 6.1 User Flow: AF → GBP

```
1. User requests withdrawal: 100 AF
2. Platform calculates fee (based on visa tier)
3. Platform deducts AF from user wallet
4. Platform triggers bank API transfer
5. Bank credits user's debit card account: £100 (minus any bank fees)
6. User now has GBP under bank jurisdiction
```

### 6.2 User Flow: GBP → AF

```
1. User deposits to platform via payment gateway
2. Payment received in Main Operating Account
3. Platform credits user wallet with AF (1:1)
4. User now has AF on platform
```

---

## 7. MB ↔ AF Exchange

### 7.1 MB → AF (Sell MegaBucks)

```
User wants to sell 100 MB

1. Calculate current MB value: 
   MB Account £1,000,000 / 1,000,000 MB = £1.00/MB

2. User receives: 100 × £1.00 = 100 AF (minus fee)

3. System burns: 100 MB from circulation

4. MB Backing Account → Main Account: Transfer £100

5. New MB value recalculates:
   £999,900 / 999,900 MB = £1.00/MB (maintained)
```

### 7.2 AF → MB (Buy MegaBucks)

```
User wants to buy MB with 100 AF

1. Calculate current MB value: £1.00/MB

2. User receives: 100 AF / £1.00 = 100 MB (minus fee in MB)

3. System mints: 100 MB to user

4. Main Account → MB Backing Account: Transfer £100

5. New MB value recalculates:
   £1,000,100 / 1,000,100 MB = £1.00/MB (maintained)
```

---

## 8. Exchange Fee Structure

### 8.1 Fee Tiers by Visa

| Visa Tier | Exchange Fee |
|-----------|--------------|
| Gold VIP Founder | 2.5% |
| VIP | 3.5% |
| Gold Premiere | 5.0% |
| Premiere | 6.0% |
| Ambassador | 7.5% |
| Executive | 8.5% |
| City Patron | 10.0% |
| City Dweller | 11.0% |
| Novice | 12.0% |
| Free | 12.5% |

### 8.2 Fee Distribution

```
Exchange Fee Collected (e.g., £10)
│
├── 20% → Back to User Ecosystem (£2)
│   └── Distributed via commission upline
│
└── 80% → Company Revenue (£8)
    ├── 20% → MB Backing Account (£1.60)
    │   └── Increases MB value for all holders
    │
    └── 80% → Operating Account (£6.40)
```

---

## 9. Monthly Cap System

### 9.1 Cap Rules

- Caps apply to **AF earnings** only (commissions)
- **MB earnings are unlimited**
- Cap triggers auto-upgrade check
- Surplus beyond cap → Poverty Fund

### 9.2 Cap Processing Flow

```
User earns 100 AF commission

1. Add to this_month_earnings

2. Check: Can upgrade?
   IF wallet >= next tier price → AUTO-UPGRADE

3. Check: At cap?
   IF this_month_earnings > monthly_cap
   THEN surplus → Poverty Fund

4. Credit remaining to user wallet
```

### 9.3 Caps by Visa

| Visa | Monthly AF Cap |
|------|---------------|
| Free | AF 75 |
| Novice | AF 250 |
| City Dweller | AF 1,350 |
| City Patron | AF 2,150 |
| Executive | AF 6,500 |
| Ambassador | AF 8,500 |
| Premiere | AF 12,500 |
| Gold Premiere | AF 18,500 |
| VIP | AF 21,000 |
| Gold VIP Founder | AF 25,000 |

---

## 10. Wallet Database Schema

```sql
-- Master user wallet (3 currencies)
CREATE TABLE user_wallets (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
    
    -- AFRO (AF) Balances
    afro_available DECIMAL(14,2) DEFAULT 0,
    afro_pending DECIMAL(14,2) DEFAULT 0,
    afro_locked DECIMAL(14,2) DEFAULT 0,
    
    -- MegaBucks (MB) Balance
    megabucks_balance BIGINT DEFAULT 0,
    
    -- Monthly tracking
    this_month_afro_earned DECIMAL(12,2) DEFAULT 0,
    monthly_cap DECIMAL(12,2) DEFAULT 75,
    monthly_fee_paid BOOLEAN DEFAULT FALSE,
    
    -- Lifetime stats
    lifetime_afro_earned DECIMAL(14,2) DEFAULT 0,
    lifetime_afro_withdrawn DECIMAL(14,2) DEFAULT 0,
    lifetime_megabucks_earned BIGINT DEFAULT 0,
    lifetime_megabucks_spent BIGINT DEFAULT 0,
    
    -- Visa reference
    current_visa_id UUID REFERENCES visas(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_monthly_reset TIMESTAMPTZ DEFAULT NOW()
);

-- Platform funds tracking
CREATE TABLE platform_funds (
    id UUID PRIMARY KEY,
    fund_type VARCHAR(50) NOT NULL UNIQUE,
    -- Types: 'mb_backing', 'poverty_fund', 'operating'
    
    balance DECIMAL(16,2) DEFAULT 0,
    
    -- For MB backing specifically
    total_mb_issued BIGINT DEFAULT 0,
    current_mb_value DECIMAL(10,6) DEFAULT 0.01,
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- All transactions (complete audit trail)
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    
    -- Transaction details
    currency_type VARCHAR(10) NOT NULL, -- 'af', 'mb', 'gbp'
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    fee_amount DECIMAL(10,2) DEFAULT 0,
    
    -- For exchanges
    from_currency VARCHAR(10),
    to_currency VARCHAR(10),
    exchange_rate DECIMAL(10,6),
    
    -- References
    related_transaction_id UUID,
    visa_purchase_id UUID,
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 11. Bank API Integration (Future)

### 11.1 Required Capabilities

| Feature | Purpose |
|---------|---------|
| Balance Query | Real-time MB backing verification |
| Transfer Initiate | MB ↔ GBP movements |
| Reconciliation | Daily account matching |
| Webhooks | Payment notifications |

### 11.2 Automation Goals

- **Zero human intervention** for standard flows
- Automated reconciliation hourly
- Alert system for discrepancies > 0.01%
- Multi-signature for large transfers (>£10,000)

## 12. Resolved Decisions

### ✅ MB Earning Rates
- Stored in configurable Supabase table: `mb_earning_rates`
- Rates can be adjusted dynamically without code changes
- New activities can be added as features expand
- See: `supabase/migrations/mb-earning-rates.sql`

### ✅ Bank Partner
- **Latvia Bank** (in discussions)
- Will provide debit card accounts for users
- Platform handles KYC, bank issues the card

### ✅ AF → GBP Withdrawal Process
```
1. User requests AF → GBP withdrawal on MegaVX platform
2. Platform validates user has completed KYC
3. Visa-based fee (2.5% - 12.5%) deducted
4. MegaVX World initiates EFT transfer
5. GBP credited to user's bank-issued debit card
6. User now under bank jurisdiction for GBP
```

### ✅ Fallback Payment Option
- **PayPal** as alternative if bank debit card not available
- Same fee structure applies

### ✅ P2P Transfer Fees
- **Same fee structure applies**: 2.5% - 12.5% based on visa tier
- Applies to ALL AF transactions including:
  - Wallet-to-wallet transfers
  - MB ↔ AF exchanges
  - Marketplace purchases
  - Territory purchases

### ✅ Commissions Currency
- **All commissions are in AFRO (AF), always**
- No GBP on platform - only AF, MB, NFTs

---

## 13. Open Questions (Remaining)

1. **Minimum Exchange Amount** - What's the minimum AF for withdrawal?
2. **Daily Limits** - Any daily exchange/withdrawal limits per user?
3. **KYC Requirements** - What documents needed for debit card issuance?
4. **Initial MB Earning Rates** - What are the starting values? (Table structure ready)

---

## 14. Migration Files Created

| File | Purpose |
|------|---------|
| `step1-visas-check.sql` | Add matrix_level columns to visas |
| `megamatrix-phase1-schema.sql` | Matrix positions, commissions |
| `mb-earning-rates.sql` | MB earning rates table + award_megabucks function |

---

## 15. Next Steps

1. ✅ Document complete currency architecture 58,295 

2. ✅ Define banking infrastructure  
3. ✅ Create MB earning rates table structure
4. ⬜ Fix SQL migration errors and run successfully
5. ⬜ Build unified wallet with AF + MB
6. ⬜ Build exchange engine (AF ↔ MB)
7. ⬜ Integrate with commission system
8. ⬜ Bank API integration (Latvia bank)

---

**Document Version:** 2.1  
**Last Updated:** 2025-12-21  
**Status:** Draft - Core Decisions Resolved

