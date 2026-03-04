# TradeFlow Journal - Database Schema Documentation

**Version**: 1.0
**Database**: SQLite (expo-sqlite)
**Date**: February 2, 2026

---

## Overview

TradeFlow Journal uses a simple, efficient SQLite database with 2 main tables:
1. **trades** - Stores all trade data and metadata
2. **user_preferences** - Stores user settings and recent selections

All data is stored locally on the device with no cloud dependency in v1.

---

## Table Structures

### 1. trades Table

The main table storing all trade information, from planning through execution to review.

```sql
CREATE TABLE trades (
  id TEXT PRIMARY KEY,
  date INTEGER NOT NULL,
  market TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  bias TEXT NOT NULL,
  narrative TEXT NOT NULL,
  context TEXT NOT NULL,
  entry TEXT NOT NULL,
  stop TEXT,
  target TEXT,
  riskReward TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  biasPlayedOut INTEGER,
  narrativePlayedOut INTEGER,
  contextHeld INTEGER,
  entryExecuted INTEGER,
  riskManaged INTEGER,
  screenshotUri TEXT,
  thumbnailUri TEXT,
  pnl TEXT,
  whatWentRight TEXT,
  whatWentWrong TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE INDEX idx_trades_date ON trades(date);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_market ON trades(market);
```

#### Field Details

| Field Name | Type | Required | Default | Description | Example |
|------------|------|----------|---------|-------------|---------|
| **id** | TEXT | Yes | - | Unique identifier | `"trade_1738502400000_abc123"` |
| **date** | INTEGER | Yes | - | Trade date (Unix timestamp) | `1738502400000` |
| **market** | TEXT | Yes | - | Trading pair/instrument | `"EUR/USD"` |
| **timeframe** | TEXT | Yes | - | Analysis timeframe | `"1h"`, `"4h"`, `"D"` |
| **bias** | TEXT | Yes | - | Directional outlook | `"Long"`, `"Short"`, `"Neutral"` |
| **narrative** | TEXT | Yes | - | Setup story/reasoning | `"HTF trend continuation after pullback to demand zone"` |
| **context** | TEXT | Yes | - | Market context type | `"HTF Trend"`, `"Liquidity Sweep"` |
| **entry** | TEXT | Yes | - | Entry method/details | `"Limit order at 1.0850 on pullback"` |
| **stop** | TEXT | No | null | Stop loss price/level | `"1.0820"` |
| **target** | TEXT | No | null | Take profit price/level | `"1.0920"` |
| **riskReward** | TEXT | No | null | Risk-to-reward ratio | `"1:2.5"` |
| **status** | TEXT | Yes | `'draft'` | Trade lifecycle stage | `"draft"`, `"active"`, `"closed"`, `"reviewed"` |
| **biasPlayedOut** | INTEGER | No | null | Outcome: Did bias play out? | `1` (yes), `0` (no), `null` (unanswered) |
| **narrativePlayedOut** | INTEGER | No | null | Outcome: Did narrative play out? | `1`, `0`, `null` |
| **contextHeld** | INTEGER | No | null | Outcome: Did context hold? | `1`, `0`, `null` |
| **entryExecuted** | INTEGER | No | null | Outcome: Was entry executed? | `1`, `0`, `null` |
| **riskManaged** | INTEGER | No | null | Outcome: Was risk managed? | `1`, `0`, `null` |
| **screenshotUri** | TEXT | No | null | Full image file path | `"file:///path/to/trade_images/img_full.jpg"` |
| **thumbnailUri** | TEXT | No | null | Thumbnail file path | `"file:///path/to/trade_images/img_thumb.jpg"` |
| **pnl** | TEXT | No | null | Profit/Loss amount | `"+150.50"`, `"-45.20"` |
| **whatWentRight** | TEXT | No | null | Post-trade notes (positive) | `"Entry timing was perfect, followed plan"` |
| **whatWentWrong** | TEXT | No | null | Post-trade notes (negative) | `"Took profit too early, missed larger move"` |
| **createdAt** | INTEGER | Yes | - | Record creation timestamp | `1738502400000` |
| **updatedAt** | INTEGER | Yes | - | Last update timestamp | `1738502500000` |

---

### 2. user_preferences Table

Stores user settings and recently-used values for smart defaults.

```sql
CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY,
  defaultTimeframe TEXT,
  recentMarkets TEXT,
  recentContexts TEXT,
  updatedAt INTEGER NOT NULL
);
```

#### Field Details

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| **id** | INTEGER | Yes | Primary key (always 1) | `1` |
| **defaultTimeframe** | TEXT | No | User's preferred timeframe | `"1h"` |
| **recentMarkets** | TEXT | No | JSON array of recent pairs | `'["EUR/USD","GBP/USD","USD/JPY"]'` |
| **recentContexts** | TEXT | No | JSON array of recent contexts | `'["HTF Trend","Liquidity Sweep"]'` |
| **updatedAt** | INTEGER | Yes | Last update timestamp | `1738502400000` |

---

## Data Types Explained

### SQLite Types Used

| SQLite Type | JavaScript Type | Used For | Notes |
|-------------|-----------------|----------|-------|
| TEXT | string | All text fields, JSON arrays | UTF-8 encoded |
| INTEGER | number | Timestamps, booleans, IDs | 64-bit signed integer |
| NULL | null | Optional fields | Represents absence of value |

### Boolean Storage
- SQLite doesn't have native boolean type
- Stored as INTEGER: `1` = true, `0` = false, `null` = unanswered
- Used for outcome evaluation fields

### Date/Time Storage
- All dates stored as Unix timestamps (milliseconds since epoch)
- INTEGER type for efficient sorting and comparison
- Converted to Date objects in JavaScript: `new Date(timestamp)`

### JSON Storage
- Arrays stored as TEXT (JSON.stringify)
- Parsed when retrieved: `JSON.parse(field)`
- Used for `recentMarkets` and `recentContexts`

---

## Data Requirements by Trade Stage

### Stage 1: Planning (Draft)

**When Creating Trade**

Required fields:
- ✅ `market` - Must select a trading pair
- ✅ `timeframe` - Must select analysis timeframe
- ✅ `bias` - Must choose Long/Short/Neutral
- ✅ `narrative` - Must describe the setup
- ✅ `context` - Must identify market context
- ✅ `entry` - Must specify entry plan

Optional fields:
- 📋 `stop` - Recommended but not enforced
- 📋 `target` - Recommended but not enforced
- 📋 `riskReward` - Recommended but not enforced
- 📋 `screenshotUri` - Can attach chart later

Auto-generated:
- 🔄 `id` - Unique identifier created automatically
- 🔄 `date` - Set to current timestamp
- 🔄 `status` - Set to `"draft"` by default
- 🔄 `createdAt` - Current timestamp
- 🔄 `updatedAt` - Current timestamp

**Example Draft Trade:**
```json
{
  "id": "trade_1738502400000_abc123",
  "date": 1738502400000,
  "market": "EUR/USD",
  "timeframe": "1h",
  "bias": "Long",
  "narrative": "HTF uptrend, price pulled back to demand zone",
  "context": "HTF Trend",
  "entry": "Limit buy at 1.0850",
  "stop": "1.0820",
  "target": "1.0920",
  "riskReward": "1:2.3",
  "status": "draft",
  "screenshotUri": null,
  "thumbnailUri": null,
  "pnl": null,
  "biasPlayedOut": null,
  "narrativePlayedOut": null,
  "contextHeld": null,
  "entryExecuted": null,
  "riskManaged": null,
  "whatWentRight": null,
  "whatWentWrong": null,
  "createdAt": 1738502400000,
  "updatedAt": 1738502400000
}
```

---

### Stage 2: Active Trade

**When Trade is Running**

Can update:
- 📝 `status` - Change to `"active"`
- 📝 `screenshotUri` - Add chart screenshot
- 📝 `stop`, `target`, `riskReward` - Adjust risk parameters

Should NOT yet have:
- ❌ `pnl` - Trade not closed yet
- ❌ Outcome fields - Can't evaluate until closed
- ❌ Notes - Save for post-trade review

**Example Active Trade:**
```json
{
  "id": "trade_1738502400000_abc123",
  "status": "active",
  "screenshotUri": "file:///DocumentDirectory/trade_images/trade_1738502400000_abc123_full.jpg",
  "thumbnailUri": "file:///DocumentDirectory/trade_images/trade_1738502400000_abc123_thumb.jpg",
  // ...other fields unchanged...
  "updatedAt": 1738505000000
}
```

---

### Stage 3: Closed Trade

**When Trade is Finished**

Must add:
- ✅ `status` - Change to `"closed"`
- ✅ `pnl` - Enter profit/loss amount

Should add:
- 📋 All outcome fields:
  - `biasPlayedOut` - Did your bias play out? (1/0)
  - `narrativePlayedOut` - Did your narrative play out? (1/0)
  - `contextHeld` - Did context hold? (1/0)
  - `entryExecuted` - Was entry executed as planned? (1/0)
  - `riskManaged` - Did you manage risk correctly? (1/0)

**Example Closed Trade:**
```json
{
  "id": "trade_1738502400000_abc123",
  "status": "closed",
  "pnl": "+150.50",
  "biasPlayedOut": 1,      // Yes
  "narrativePlayedOut": 1,  // Yes
  "contextHeld": 1,         // Yes
  "entryExecuted": 1,       // Yes
  "riskManaged": 0,         // No - took profit too early
  // ...other fields...
  "updatedAt": 1738510000000
}
```

---

### Stage 4: Reviewed Trade

**After Full Post-Trade Analysis**

Add:
- ✅ `status` - Change to `"reviewed"`
- ✅ `whatWentRight` - Positive learnings
- ✅ `whatWentWrong` - Areas for improvement

All outcome fields should be filled.

**Example Reviewed Trade:**
```json
{
  "id": "trade_1738502400000_abc123",
  "status": "reviewed",
  "pnl": "+150.50",
  "biasPlayedOut": 1,
  "narrativePlayedOut": 1,
  "contextHeld": 1,
  "entryExecuted": 1,
  "riskManaged": 0,
  "whatWentRight": "Perfect entry timing, bias and narrative confirmed. Patience paid off.",
  "whatWentWrong": "Took profit at 1:1 instead of letting it run to full target. Fear of giving back profits.",
  // ...other fields...
  "updatedAt": 1738515000000
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                  USER CREATES TRADE                 │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
         Required at Creation:
         • market (TEXT)
         • timeframe (TEXT)
         • bias (TEXT)
         • narrative (TEXT)
         • context (TEXT)
         • entry (TEXT)
         
         Auto-generated:
         • id (unique)
         • date (current timestamp)
         • status = "draft"
         • createdAt (timestamp)
         • updatedAt (timestamp)
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              TRADE SAVED TO DATABASE                │
│                  (STATUS: draft)                    │
└────────────────┬────────────────────────────────────┘
                 │
                 ├─ Can add/update:
                 │  • screenshotUri (image attachment)
                 │  • thumbnailUri (auto-generated)
                 │  • stop, target, riskReward
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│             USER EXECUTES TRADE                     │
│           (STATUS: draft → active)                  │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
         Trade is running...
         No changes to outcome fields yet
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              TRADE CLOSES                           │
│           (STATUS: active → closed)                 │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
         Must add:
         • pnl (profit/loss)
         
         Should evaluate:
         • biasPlayedOut (1/0)
         • narrativePlayedOut (1/0)
         • contextHeld (1/0)
         • entryExecuted (1/0)
         • riskManaged (1/0)
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│            FULL REVIEW COMPLETED                    │
│          (STATUS: closed → reviewed)                │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
         Add learnings:
         • whatWentRight (TEXT)
         • whatWentWrong (TEXT)
         
         All outcome fields filled
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│         TRADE COMPLETE & ANALYZED                   │
│    Data used for analytics & insights               │
└─────────────────────────────────────────────────────┘
```

---

## User Preferences Data Flow

```
┌─────────────────────────────────────┐
│    APP INITIALIZATION               │
└──────────────┬──────────────────────┘
               │
               ▼
       Check user_preferences table
               │
               ├─ Record exists?
               │  └─ Yes → Load preferences
               │  └─ No  → Create default record
               │
               ▼
┌─────────────────────────────────────┐
│    DEFAULT PREFERENCES              │
│  • defaultTimeframe: "1h"           │
│  • recentMarkets: [5 popular pairs] │
│  • recentContexts: [5 common types] │
└──────────────┬──────────────────────┘
               │
               ▼
       Used to populate:
       • Market picker (show recent first)
       • Timeframe picker (pre-select default)
       • Context picker (show recent first)
               │
               ▼
┌─────────────────────────────────────┐
│    USER CREATES/EDITS TRADE         │
│    Selects: EUR/USD, 4h, HTF Trend  │
└──────────────┬──────────────────────┘
               │
               ▼
       After save, update preferences:
       • Add EUR/USD to recentMarkets (if not present)
       • Move to front of array
       • Keep only 5 most recent
       
       • Add HTF Trend to recentContexts
       • Move to front of array
       • Keep only 5 most recent
               │
               ▼
┌─────────────────────────────────────┐
│    PREFERENCES UPDATED              │
│  • recentMarkets: ["EUR/USD", ...]  │
│  • recentContexts: ["HTF Trend"...] │
│  • updatedAt: [new timestamp]       │
└─────────────────────────────────────┘
```

---

## Validation Rules

### Required Field Validation

```typescript
// On trade creation/save
const validateTrade = (trade: Partial<Trade>): boolean => {
  // Always required
  if (!trade.market) return false;
  if (!trade.timeframe) return false;
  if (!trade.bias) return false;
  if (!trade.narrative) return false;
  if (!trade.context) return false;
  if (!trade.entry) return false;
  
  // Status-specific validation
  if (trade.status === 'closed' || trade.status === 'reviewed') {
    if (!trade.pnl) return false; // Must have P&L when closed
  }
  
  return true;
};
```

### Data Format Examples

**Market:**
- Valid: `"EUR/USD"`, `"GBP/JPY"`, `"US30"`, `"NAS100"`
- Invalid: Empty string, null

**Timeframe:**
- Valid: `"1m"`, `"5m"`, `"15m"`, `"1h"`, `"4h"`, `"D"`, `"W"`, `"M"`
- Invalid: Random text, null

**Bias:**
- Valid: `"Long"`, `"Short"`, `"Neutral"`
- Invalid: Other values

**Status:**
- Valid: `"draft"`, `"active"`, `"closed"`, `"reviewed"`
- Invalid: Other values

**PnL:**
- Format: String with optional + or - prefix
- Valid: `"+150.50"`, `"-45.20"`, `"0"`, `"250"`
- Invalid: Non-numeric text (but stored as TEXT for flexibility)

**Outcome Fields (boolean):**
- Valid: `1` (yes/true), `0` (no/false), `null` (unanswered)
- Invalid: Other integers

---

## Common Queries

### Get All Trades
```sql
SELECT * FROM trades ORDER BY date DESC;
```

### Get Active Trades
```sql
SELECT * FROM trades WHERE status = 'active' ORDER BY date DESC;
```

### Get Closed Trades
```sql
SELECT * FROM trades 
WHERE status IN ('closed', 'reviewed') 
ORDER BY date DESC;
```

### Calculate Win Rate
```sql
SELECT
  COUNT(CASE WHEN pnl IS NOT NULL AND pnl != '' THEN 1 END) as total,
  COUNT(CASE WHEN pnl IS NOT NULL AND pnl != '' AND CAST(pnl AS REAL) > 0 THEN 1 END) as wins
FROM trades WHERE status IN ('closed', 'reviewed');
```

### Calculate Block Success Rates
```sql
SELECT
  COUNT(CASE WHEN biasPlayedOut = 1 THEN 1 END) * 100.0 / 
    NULLIF(COUNT(CASE WHEN biasPlayedOut IS NOT NULL THEN 1 END), 0) as biasRate,
  COUNT(CASE WHEN narrativePlayedOut = 1 THEN 1 END) * 100.0 / 
    NULLIF(COUNT(CASE WHEN narrativePlayedOut IS NOT NULL THEN 1 END), 0) as narrativeRate,
  COUNT(CASE WHEN contextHeld = 1 THEN 1 END) * 100.0 / 
    NULLIF(COUNT(CASE WHEN contextHeld IS NOT NULL THEN 1 END), 0) as contextRate,
  COUNT(CASE WHEN entryExecuted = 1 THEN 1 END) * 100.0 / 
    NULLIF(COUNT(CASE WHEN entryExecuted IS NOT NULL THEN 1 END), 0) as entryRate,
  COUNT(CASE WHEN riskManaged = 1 THEN 1 END) * 100.0 / 
    NULLIF(COUNT(CASE WHEN riskManaged IS NOT NULL THEN 1 END), 0) as riskRate
FROM trades WHERE status IN ('closed', 'reviewed');
```

### Get Recent Markets
```sql
SELECT recentMarkets FROM user_preferences LIMIT 1;
```

---

## Storage Locations

### Database File
- **Path**: Device-specific SQLite storage
- **Filename**: `tradeflow.db`
- **Access**: Via expo-sqlite API

### Image Files
- **Path**: `DocumentDirectory/trade_images/`
- **Full Images**: `trade_{id}_full.jpg`
- **Thumbnails**: `trade_{id}_thumb.jpg`
- **Format**: JPEG (compressed)
- **Cleanup**: Deleted when trade is deleted

---

## Performance Considerations

### Indexes
Three indexes are created for fast queries:
1. `idx_trades_date` - Fast date-based sorting
2. `idx_trades_status` - Fast status filtering
3. `idx_trades_market` - Fast market-specific queries

### Query Optimization
- Use indexed fields in WHERE clauses
- Limit results when possible
- Use prepared statements for repeated queries
- Avoid SELECT * when only specific fields needed

### Storage Estimates
- Average trade record: ~1-2 KB (without images)
- With compressed images: ~50-100 KB per trade
- 1000 trades ≈ 50-100 MB total storage

---

## Backup Considerations

### v1 (Current)
- No cloud backup
- Data only on device
- User should use device backup (iCloud, Google Backup)

### v2 (Planned)
- Optional cloud sync
- Export to CSV/JSON
- Manual backup functionality

---

## Migration Notes

### Future Schema Changes
If adding new fields:
1. Use `ALTER TABLE` statements
2. Provide default values for existing records
3. Update TypeScript interfaces
4. Test migration on sample data

Example:
```sql
ALTER TABLE trades ADD COLUMN newField TEXT DEFAULT null;
```

---

**Last Updated**: February 2, 2026
**Schema Version**: 1.0
**Status**: Production ✅
