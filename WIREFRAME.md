# TradeFlow Journal Wireframe

## 1. App Structure

```text
Root (Stack)
├─ Tabs
│  ├─ Dashboard (Analytics view)
│  └─ Trades
├─ CreateEditTrade (Modal)
└─ TradeDetail
```

## 2. Bottom Navigation

```text
+--------------------------------------------------+
|                                                  |
|                 Current Screen                   |
|                                                  |
+--------------------------------------------------+
|   [⊞] Dashboard         [+]         [☰] Trades  |
+--------------------------------------------------+
```

## 3. Dashboard Screen (Analytics)

```text
+--------------------------------------------------+
| HEADER: TradeFlow                                |
+--------------------------------------------------+
| OVERVIEW                                         |
| +------------------+ +-------------------------+ |
| | Total Trades     | | Win Rate                | |
| | 24               | | 58%                     | |
| +------------------+ +-------------------------+ |
|                                                  |
| BUILDING BLOCKS SUCCESS RATE                     |
| Bias            [########----] 72%               |
| Narrative       [######------] 61%               |
| Context         [#####-------] 49%               |
| Entry           [#######-----] 67%               |
| Risk Management [#########---] 81%               |
|                                                  |
| KEY INSIGHTS                                     |
| +----------------------------------------------+ |
| | Win rate above 50%. Focus on consistency.    | |
| +----------------------------------------------+ |
| +----------------------------------------------+ |
| | Strongest: Risk management                   | |
| +----------------------------------------------+ |
| +----------------------------------------------+ |
| | Improve: Context evaluation                  | |
| +----------------------------------------------+ |
+--------------------------------------------------+
|   [⊞] Dashboard         [+]         [☰] Trades  |
+--------------------------------------------------+
```

## 4. Trades List Screen

```text
+--------------------------------------------------+
| HEADER: My Trades                                |
+--------------------------------------------------+
| FILTERS                                          |
| [All] [Active] [Closed]                          |
+--------------------------------------------------+
| Trade Card                                       |
| EURUSD            +2.5R                          |
| Mar 11, 2026      15m           [closed]         |
+--------------------------------------------------+
| Trade Card                                       |
| XAUUSD            -1.0R                          |
| Mar 10, 2026      5m            [closed]         |
+--------------------------------------------------+
| Trade Card                                       |
| GBPUSD            -                              |
| Mar 10, 2026      1h            [active]         |
+--------------------------------------------------+
|                                                  |
| (No side floating buttons)                       |
+--------------------------------------------------+
|   [⊞] Dashboard         [+]         [☰] Trades  |
+--------------------------------------------------+
```

## 5. Create/Edit Trade Modal

```text
+--------------------------------------------------+
| Modal Header: New Trade / Edit Trade        [X]  |
+--------------------------------------------------+
| Market:        [ Select Market            ▼ ]    |
|                                                  |
| Bias                                             |
| - Direction:   [Long] [Short] [Neutral]          |
| - [ PD Array  ▼ ]    [ Timeframe ▼ ]             |
| - Played out:  [ ✓ ] [ ✕ ]                      |
|                                                  |
| Narrative                                        |
| - Context:     [ ... chips ... ]                 |
| - [ PD Array  ▼ ]    [ Timeframe ▼ ]             |
| - Played out:  [ ✓ ] [ ✕ ]                      |
|                                                  |
| Entry                                            |
| - [ Pattern   ▼ ]    [ Timeframe ▼ ]             |
| - Played out:  [ ✓ ] [ ✕ ]                      |
|                                                  |
| Risk                                             |
| - Stop:        [____]                            |
| - Target:      [____]                            |
| - RR:          [____]                            |
|                                                  |
| Screenshot:    [Add / Replace]                   |
| Notes:         [............................]    |
|               [............................]     |
|                                                  |
| [Save Trade]                         [Cancel]    |
+--------------------------------------------------+
```

```text
Select Box Behavior
- Tap a select box (Market / PD Array / Pattern / Timeframe)
- Modal opens with a vertical options list
- Tap option to select and close modal
- Cancel closes modal without changes
- Bias/Narrative use side-by-side: PD Array + Timeframe
- Entry uses side-by-side: Pattern + Timeframe
```

## 6. Trade Detail Screen

```text
+--------------------------------------------------+
| HEADER: Trade Details                            |
+--------------------------------------------------+
| Market / Date / Timeframe                        |
| Status / PnL                                     |
|                                                  |
| Screenshot Preview                               |
| +----------------------------------------------+ |
| |                                              | |
| +----------------------------------------------+ |
|                                                  |
| Bias Summary                                     |
| Narrative Summary                                |
| Entry Summary                                    |
| Risk Summary                                     |
|                                                  |
| Notes                                             |
| - What went right                                |
| - What went wrong                                |
|                                                  |
| [Edit Trade]                     [Delete Trade]  |
+--------------------------------------------------+
```

## 7. Empty States

```text
Dashboard (No data)
- Overview shows 0 trades, 0% win rate
- Insights show guidance text

Trades (No data)
- "No trades yet"
- "Create your first trade to get started"
```

## 8. User Flow

```text
Open App
  -> Dashboard (Analytics)
     -> Tap Trades tab
        -> Trades list
           -> Tap + (center button)
              -> Create Trade modal
                 -> Save
                    -> Back to Trades
                       -> Tap trade
                          -> Trade Detail
                             -> Edit (optional)
```
