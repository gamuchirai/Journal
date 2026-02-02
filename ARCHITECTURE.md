# TradeFlow Journal - Visual Architecture & Flow

## App Architecture

```
┌─────────────────────────────────────────────────────┐
│                    App.tsx (Entry)                  │
│         Database Initialization & Router            │
└──────────────────┬──────────────────────────────────┘
                   │
     ┌─────────────┴─────────────┐
     │                           │
┌────▼────────────────┐   ┌──────▼────────────────┐
│  RootNavigator      │   │  Store (Zustand)     │
│  Navigation Stack   │   │  Global State        │
└────┬────────────────┘   └──────┬────────────────┘
     │                           │
     ├─TradeList ◄───────────────┼── Trades Array
     │  ├─ Filters               │
     │  ├─ Trade Cards           │
     │  └─ FAB Buttons           │
     │
     ├─CreateEditTrade ◄────────────┤ Load/Save Trade
     │  ├─ Market Picker           │
     │  ├─ Timeframe Picker        │
     │  ├─ Building Blocks Form    │
     │  ├─ Image Upload ────────────┼──► ImageUtils
     │  │  └─ Compression/Thumbnail │
     │  └─ Save Button             │
     │
     ├─TradeDetail ◄──────────────┤ Selected Trade
     │  ├─ Full Trade Info         │
     │  ├─ Chart Image             │
     │  ├─ Outcomes Display        │
     │  ├─ Notes                   │
     │  └─ Edit/Delete Buttons     │
     │
     └─Analytics ◄───────────────┤ Analytics Query
        ├─ Win Rate               │
        ├─ Block Success Rates    │
        └─ Insights               │
             
                   │
                   ▼
          ┌────────────────────┐
          │  SQLite Database   │
          │  ├─ trades table   │
          │  ├─ preferences    │
          │  └─ Indexes        │
          └────────────────────┘
                   │
                   ▼
          ┌────────────────────┐
          │  Device Storage    │
          │  ├─ Images folder  │
          │  ├─ Full images    │
          │  └─ Thumbnails    │
          └────────────────────┘
```

---

## User Flow Diagram

```
START
  │
  ▼
┌──────────────────────────────┐
│    TradeList Screen          │
│  - View all trades           │
│  - Filter by status          │
│  - See win rate summary      │
└────┬────────────────┬────────┘
     │                │
     │                ▼
     │        ┌────────────────┐
     │        │ [📊] Analytics │
     │        │   - Win Rate   │
     │        │   - Block      │
     │        │     Rates      │
     │        │   - Insights   │
     │        └────────────────┘
     │
     ▼
┌──────────────────────────────┐
│  CreateEditTrade Screen      │
│  - Enter trade details       │
│  - Select building blocks    │
│  - Attach chart image        │
│    └─ Image Picker           │
│      └─ Compress (75%)       │
│      └─ Create Thumbnail     │
└────┬─────────────────────────┘
     │
     ▼
┌──────────────────────────────┐
│  Trade Saved to DB           │
│  - All data persisted        │
│  - Image stored locally      │
│  - Recent values updated     │
└────┬─────────────────────────┘
     │
     ├─ ONGOING TRADE
     │  ├─ Active status
     │  └─ Ready to close
     │
     └─ CLOSE TRADE
        │
        ▼
     ┌──────────────────────────────┐
     │  TradeDetailScreen           │
     │  - View all information      │
     │  - See chart image           │
     │  └─ Tap to expand fullscreen │
     └────┬──────────────────────────┘
          │
          ▼
     ┌──────────────────────────────┐
     │  Edit Trade → Closed         │
     │  - Answer outcome questions  │
     │    ✓ Bias played out?        │
     │    ✓ Narrative played out?   │
     │    ✓ Context held?           │
     │    ✓ Entry executed?         │
     │    ✓ Risk managed?           │
     │  - Enter notes:              │
     │    ✓ What went right?        │
     │    ✓ What went wrong?        │
     │  - Enter P&L                 │
     └────┬──────────────────────────┘
          │
          ▼
     ┌──────────────────────────────┐
     │  Analytics Updated           │
     │  - Win rate recalculated     │
     │  - Block rates updated       │
     │  - New insights generated    │
     └──────────────────────────────┘

END
```

---

## Data Model Visualization

```
TRADE
├─ Metadata
│  ├─ id (unique)
│  ├─ date (timestamp)
│  └─ status (draft|active|closed|reviewed)
│
├─ 5 Building Blocks
│  ├─ Bias (Long/Short/Neutral)
│  ├─ Narrative (text description)
│  ├─ Context (setup type)
│  ├─ Entry (entry details)
│  └─ Risk Management
│     ├─ Stop Loss
│     ├─ Target
│     └─ R:R Ratio
│
├─ Market Data
│  ├─ Market/Pair (EUR/USD, etc)
│  └─ Timeframe (1m, 5m, 1h, D, W, M)
│
├─ Outcomes (after closing)
│  ├─ Bias Played Out? (Yes/No/Unanswered)
│  ├─ Narrative Played Out?
│  ├─ Context Held?
│  ├─ Entry Executed?
│  └─ Risk Managed?
│
├─ Results
│  ├─ P&L (profit/loss amount)
│  └─ Notes
│     ├─ What Went Right
│     └─ What Went Wrong
│
└─ Media
   ├─ Screenshot URI (full image)
   ├─ Thumbnail URI (300x300)
   └─ Image Metadata
      ├─ Original size
      └─ Compressed size
```

---

## Screen Wireframes

### 1. Trade List Screen
```
┌─────────────────────────────┐
│  TradeFlow Journal          │
├─────────────────────────────┤
│ [All] [Active] [Closed]     │  ← Filters
├─────────────────────────────┤
│ ┌───────────────────────────┐ │
│ │ [IMG] EUR/USD    │  +$150  │ │ ← Trade Card
│ │       Jan 12     1h  Active│ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ [IMG] GBP/USD    │   -$50  │ │
│ │       Jan 11     4h  Closed│ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ [IMG] AUD/USD    │  +$230  │ │
│ │       Jan 10     D   Closed│ │
│ └───────────────────────────┘ │
├─────────────────────────────┤
│           [+]          [📊]  │ ← Action Buttons
└─────────────────────────────┘
```

### 2. Create/Edit Trade Screen
```
┌─────────────────────────────┐
│  New Trade                  │
├─────────────────────────────┤
│ Market                      │
│ [EUR/USD] [GBP/USD] [AUD/]  │
│                             │
│ Timeframe                   │
│ [5m] [1h] [4h] [D] [W]      │
│                             │
│ Bias                        │
│ [Long] [Short] [Neutral]    │
│                             │
│ Narrative                   │
│ [Enter narrative...]        │
│                             │
│ Context                     │
│ [HTF Trend] [Liquidity]     │
│                             │
│ Entry                       │
│ [Enter entry...]            │
│                             │
│ Risk Management             │
│ Stop Loss: [______]         │
│ Target:    [______]         │
│ R:R Ratio: [______]         │
│                             │
│ Chart Screenshot            │
│ [📷 Add Chart Screenshot]   │
│ (or shows preview if added) │
│                             │
│         [Save Trade]        │
└─────────────────────────────┘
```

### 3. Trade Detail Screen
```
┌─────────────────────────────┐
│  Trade Details              │
├─────────────────────────────┤
│ EUR/USD              +$150   │ ← Header
│ Jan 12, 10:45 AM            │
│ [1h] [Active]               │
│                             │
│ Chart Analysis              │
│ ┌───────────────────────────┐
│ │                           │
│ │   [Chart Image]           │ ← Full resolution
│ │   Tap to expand           │
│ │                           │
│ └───────────────────────────┘
│                             │
│ Trading Building Blocks     │
│ Bias: Long  │  Narrative    │
│ HTF Trend   │  Price Action │
│                             │
│ Context     │  Entry        │
│ Liquidity   │  Pullback     │
│                             │
│ Risk Management             │
│ Stop: 1.0500 Target: 1.0650 │
│ R:R: 1:2                    │
│                             │
│ Outcomes ✓                  │
│ Bias Played Out    [YES]    │
│ Narrative Played   [YES]    │
│ Context Held       [NO]     │
│ Entry Executed     [YES]    │
│ Risk Managed       [YES]    │
│                             │
│ [Edit Trade] [Delete]       │
└─────────────────────────────┘
```

### 4. Analytics Screen
```
┌─────────────────────────────┐
│  Analytics                  │
├─────────────────────────────┤
│ Overview                    │
│ ┌──────────────┐ ┌────────┐
│ │ Total Trades │ │ Win    │
│ │      24      │ │ Rate   │
│ └──────────────┘ │  62%   │
│                  └────────┘
│                             │
│ Building Blocks Success     │
│ Bias           [█████░] 75%  │
│ Narrative      [████░░] 70%  │
│ Context        [███░░░] 55%  │
│ Entry          [████░░] 68%  │
│ Risk Mgmt      [█████░] 80%  │
│                             │
│ Key Insights                │
│ ✓ Your bias analysis is     │
│   your strongest block.     │
│                             │
│ → Work on improving your    │
│   context evaluation.       │
│                             │
│ ✓ Win rate is excellent!    │
│   Keep up the process.      │
└─────────────────────────────┘
```

---

## Image Processing Pipeline

```
User Selection
      │
      ▼
┌─────────────────────┐
│  Image Picker       │
│  (Device gallery    │
│   or camera)        │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────┐
│  Process Images              │
├──────────────────────────────┤
│ ┌─────────────┐              │
│ │   Full      │              │
│ │  Image      │ ──────────┐  │
│ │  Input      │           │  │
│ └─────────────┘           │  │
│                           ▼  │
│                 ┌──────────────────┐
│                 │ expo-image-      │
│                 │ manipulator      │
│                 │ Compress 75%     │
│                 │ JPEG Format      │
│                 └────────┬─────────┘
│                          │
│                          ▼
│                 ┌──────────────────┐
│                 │ Compressed Full  │
│                 │ Image (JPEG)     │
│                 │ ~50-100KB        │
│                 └────────┬─────────┘
│                          │
│           ┌──────────────┴───────────┐
│           │                          │
│    Save to DB (URI)            Also Process for
│           │                    Thumbnail
│           │                    │
│           │                    ▼
│           │          ┌──────────────────┐
│           │          │ Resize 300x300   │
│           │          │ Compress 70%     │
│           │          │ JPEG Format      │
│           │          └────────┬─────────┘
│           │                   │
│           │                   ▼
│           │          ┌──────────────────┐
│           │          │ Thumbnail Image  │
│           │          │ (JPEG)           │
│           │          │ ~10-20KB         │
│           │          └────────┬─────────┘
│           │                   │
│           └───────┬───────────┘
│                   │
│                   ▼
│          Save Both to
│          DocumentDirectory/
│          trade_images/
│                   │
│                   ▼
│          Store URIs in
│          Trade Record
│          - screenshotUri
│          - thumbnailUri
│
└──────────────────────────────┘
           │
           ▼
      Trade Saved
      │
      ├─ Full: Show in detail view
      └─ Thumbnail: Show in list card
```

---

## State Flow (Zustand Store)

```
┌────────────────────────────────────┐
│      Global State (Zustand)        │
├────────────────────────────────────┤
│                                    │
│ trades: Trade[]                    │
│ ├─ Populated by loadTrades()       │
│ ├─ Updated by saveTrade()          │
│ └─ Cleared by deleteTrade()        │
│                                    │
│ preferences: UserPreferences       │
│ ├─ defaultTimeframe                │
│ ├─ recentMarkets[]                 │
│ └─ recentContexts[]                │
│ └─ Loaded by loadPreferences()     │
│                                    │
│ selectedTrade: Trade | null        │
│ ├─ Set by setSelectedTrade()       │
│ └─ Loaded by loadTrade()           │
│                                    │
│ loading: boolean                   │
│ error: string | null               │
│                                    │
├────────────────────────────────────┤
│          Actions                   │
├────────────────────────────────────┤
│ loadTrades(status?) → void         │
│ loadTrade(id) → void               │
│ saveTrade(trade) → void            │
│ deleteTrade(id) → void             │
│ loadPreferences() → void           │
│ setLoading(bool) → void            │
│ setError(string|null) → void       │
│                                    │
└────────────────────────────────────┘
        │
        │ Subscribes
        ▼
┌────────────────────────────────────┐
│      React Components              │
│  (All screens auto-re-render       │
│   on state changes)                │
└────────────────────────────────────┘
```

---

## Color Usage Across UI

```
COLORS IMPLEMENTATION

┌─────────────────────────────────────────┐
│ PRIMARY (#16476a - Deep Blue)           │
├─────────────────────────────────────────┤
│ • Header background                     │
│ • Screen title text                     │
│ • Primary buttons                       │
│ • Section titles                        │
│ • Selected states                       │
│ • Links and active items                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ SECONDARY (#a9d0fb - Light Blue)        │
├─────────────────────────────────────────┤
│ • Card backgrounds                      │
│ • Input field backgrounds               │
│ • Picker option backgrounds             │
│ • Inactive state backgrounds            │
│ • Dividers and borders                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ACCENT (#e29e21 - Warm Amber)           │
├─────────────────────────────────────────┤
│ • Primary CTA buttons (Save, Add)       │
│ • FAB (Floating Action Button)          │
│ • Important highlights                  │
│ • Key action indicators                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ BACKGROUND (#f1f1e6 - Neutral Beige)    │
├─────────────────────────────────────────┤
│ • Main screen background                │
│ • Container backgrounds                 │
│ • Overall page background               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ SUCCESS (#4caf50 - Green)               │
├─────────────────────────────────────────┤
│ • Positive outcomes (Yes)               │
│ • Profitable trades                     │
│ • Success messages                      │
│ • High success rates (70%+)             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ERROR (#f44336 - Red)                   │
├─────────────────────────────────────────┤
│ • Negative outcomes (No)                │
│ • Losing trades                         │
│ • Error messages                        │
│ • Delete buttons                        │
│ • Low success rates (<50%)              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ WARNING (#ff9800 - Orange)              │
├─────────────────────────────────────────┤
│ • Moderate success rates (50-70%)       │
│ • Caution indicators                    │
│ • Medium priority items                 │
└─────────────────────────────────────────┘
```

---

**Architecture & Flow Diagram Created**: February 2, 2026
**Status**: Complete & Verified ✅
