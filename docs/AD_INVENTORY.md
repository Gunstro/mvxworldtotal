# MegaVX World - Advertising Inventory

## Overview
This document tracks all advertising spaces available in the MegaVX World platform. Keep this updated as new ad placements are added.

---

## 📍 Active Ad Placements

### 1. Homepage - Right Sidebar Ad
- **Location**: `src/pages/HomePage.tsx`
- **Size**: 300x250 (Medium Rectangle)
- **Position**: Right sidebar, below "Today's Earnings" card
- **Visibility**: Desktop only (hidden on mobile)
- **Type**: Standard display ad
- **Status**: ✅ Active

### 2. Auth Page - Premium Partner Banner
- **Location**: `src/pages/AuthPage.tsx`
- **Size**: 728x90 (Leaderboard)
- **Position**: Left branding panel, between stats and testimonial
- **Visibility**: Both desktop and mobile
- **Type**: Premium brand partnership
- **Status**: ✅ Active

---

## 📋 Planned Ad Placements

### 3. Profile Page - Sidebar Ad
- **Location**: `src/pages/ProfilePage.tsx`
- **Size**: 300x250 (Medium Rectangle)
- **Position**: Right sidebar
- **Status**: ⏳ Planned

### 4. Messages Page - Conversation List Ad
- **Location**: `src/pages/MessagesPage.tsx`
- **Size**: 300x100 (Small banner)
- **Position**: Between conversations
- **Status**: ⏳ Planned

### 5. Explore Page - Feed Interstitial
- **Location**: `src/pages/ExplorePage.tsx`
- **Size**: Full width
- **Position**: Every 5th post
- **Status**: ⏳ Planned

### 6. Notifications Page - Top Banner
- **Location**: `src/pages/NotificationsPage.tsx`
- **Size**: 728x90 (Leaderboard)
- **Position**: Top of page
- **Status**: ⏳ Planned

---

## 💰 Ad Pricing Tiers (Suggested)

| Placement | Size | CPM Rate | Monthly Fixed |
|-----------|------|----------|---------------|
| Homepage Sidebar | 300x250 | $5-10 | $500-1000 |
| Auth Page Premium | 728x90 | $15-25 | $2000-5000 |
| Profile Sidebar | 300x250 | $3-8 | $300-600 |
| Feed Interstitial | Full Width | $8-15 | $800-1500 |

---

## 🎨 Ad Design Guidelines

### Colors
- Background: `#1a1a1a` (dark)
- Border: `rgba(212, 175, 55, 0.3)` (gold accent)
- Text: `#888888` (placeholder text)
- CTA: `#d4af37` (gold)

### Placeholder Template
```tsx
<div 
    className="w-full h-48 flex items-center justify-center"
    style={{ 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        border: '1px dashed #444444'
    }}
>
    <div className="text-center">
        <div className="text-3xl mb-2">📢</div>
        <p className="text-sm font-medium" style={{ color: '#888888' }}>
            Your Ad Here
        </p>
        <p className="text-xs mt-1" style={{ color: '#666666' }}>
            [SIZE]
        </p>
    </div>
</div>
```

---

## 📊 Tracking & Analytics

### Required Data Points
- Impressions
- Clicks
- CTR (Click-through Rate)
- Viewability %
- Time on screen

### Integration Options
- Google Ad Manager
- Custom analytics via Supabase
- Direct sold campaigns

---

## 🔄 Last Updated
- **Date**: December 20, 2025
- **Total Active Placements**: 2
- **Total Planned Placements**: 4

---

## Notes
- All ads must comply with MegaVX content policies
- Premium placements (Auth page) require approval
- Native ads should match the black & gold theme
