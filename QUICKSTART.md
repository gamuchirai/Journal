# TradeFlow Journal - Quick Start Guide

## Setup & Installation

### Prerequisites
- Node.js v20.19+ installed
- npm v11.6+ installed
- For Android testing: Android Studio and Android SDK
- For iOS testing: macOS with Xcode

### Installation
The project is already initialized. To continue development:

```bash
cd "C:\Users\DoddleLearnZW\Documents\code\Journal\tradeflow-journal"

# Start the development server
npm start
```

## Running the App

### Android (if Android Studio is set up)
```bash
npm run android
```
Then use the Expo app on your Android device to scan the QR code.

### iOS (requires macOS)
```bash
npm run ios
```

### Web (for quick testing)
```bash
npm run web
```
Opens development server in browser.

### Expo App Method (Easiest)
1. Install Expo Go app on your phone
2. Run `npm start`
3. Scan the QR code with your phone camera or Expo Go app

## Project Structure

```
Journal/
├── tradeflow-journal/           # Main app project
│   ├── src/
│   │   ├── constants/           # Colors, forex pairs, timeframes
│   │   ├── database/            # SQLite setup and queries
│   │   ├── navigation/          # Screen navigation setup
│   │   ├── screens/             # All screen components
│   │   ├── store/               # Zustand state management
│   │   ├── types/               # TypeScript interfaces
│   │   └── utils/               # Image optimization utilities
│   ├── App.tsx                  # App entry point
│   ├── package.json             # Dependencies
│   └── app.json                 # Expo configuration
├── prd.md                       # Product requirements
└── IMPLEMENTATION_SUMMARY.md    # Detailed implementation docs
```

## Key Screens

### 1. Trade List Screen (Home)
- View all trades
- Filter by: All / Active / Closed
- Quick action buttons:
  - **+** (FAB) - Create new trade
  - **📊** - View analytics

### 2. Create/Edit Trade
- Market picker (with recent + forex pairs)
- Timeframe selection
- Bias toggle (Long/Short/Neutral)
- Narrative, Context, Entry text fields
- Risk Management: Stop Loss, Target, R:R Ratio
- **Chart Image Attachment**:
  - Tap "📷 Add Chart Screenshot"
  - Select image from phone gallery or take photo
  - Image is compressed (75% quality) and thumbnail created
  - Can change/remove image anytime

### 3. Trade Detail View
- Full trade information display
- Chart image (tap to expand)
- All 5 building blocks displayed
- **Outcome Evaluation** (if trade is closed):
  - Mark each block as Yes/No
  - Edit button to update outcomes
- Notes section (What Went Right / What Went Wrong)
- Action buttons: Edit / Delete

### 4. Analytics Dashboard
- **Win Rate** - Percentage of winning trades
- **Building Block Success Rates**:
  - Visual progress bars for each block
  - Color coded (Green ≥70%, Orange ≥50%, Red <50%)
- **Key Insights** - Auto-generated recommendations

## Common Tasks

### Create a New Trade
1. Tap the **+** button on trade list
2. Select market (or scroll to find one)
3. Choose timeframe
4. Select bias
5. Enter narrative and entry details
6. Set stop loss, target, and R:R ratio
7. Tap "📷 Add Chart Screenshot" to attach chart
8. Tap "Save Trade"

### Edit a Trade
1. Tap on a trade in the list
2. Tap "Edit Trade" button
3. Modify any fields
4. Change/add/remove chart image as needed
5. Tap "Save Trade"

### Mark Trade as Closed
1. Open trade detail
2. Tap "Edit Trade"
3. (In future, change status to "closed")
4. After trade closes, answer outcome questions

### View Analytics
1. From trade list, tap **📊** button
2. See win rate and building block success rates
3. Read generated insights

## Development Notes

### Database
- Uses expo-sqlite for local storage
- No internet required
- Data persists between app sessions
- Schema includes forex pairs, timeframes, and default contexts

### Image Handling
- Images are compressed to 75% JPEG quality for storage
- Thumbnails created at 300x300px for list view
- Stored locally with device file system
- Automatically cleaned up when trade is deleted

### State Management
- Zustand store for global state
- Automatically syncs with database
- Efficient updates and re-renders

### Type Safety
- Full TypeScript implementation
- No `any` types (mostly)
- Type-safe navigation

## Customization

### Add More Forex Pairs
Edit `src/constants/index.ts`:
```typescript
export const FOREX_PAIRS = [
  'EUR/USD',
  'GBP/USD',
  // Add more pairs here
];
```

### Change Color Scheme
Edit `src/constants/index.ts`:
```typescript
export const COLORS = {
  primary: '#16476a',     // Main color
  secondary: '#a9d0fb',   // Cards/inputs
  accent: '#e29e21',      // Buttons
  // ...
};
```

### Add More Context Types
Edit `src/constants/index.ts`:
```typescript
export const DEFAULT_CONTEXTS = [
  'HTF Trend',
  'Liquidity Sweep',
  // Add more contexts here
];
```

## Troubleshooting

### "Database initialization error"
- Delete app data and try again
- Clear npm cache: `npm cache clean --force`
- Reinstall: `rm -rf node_modules && npm install`

### Images not saving
- Check device storage permissions
- Try with a smaller image file
- Restart the app

### Navigation errors
- Ensure all screens are properly exported
- Check for typos in screen names
- Clear metro cache: `npm start --reset-cache`

### Build errors
- Clear cache: `npm run android --reset-cache` (for Android)
- Or `npm run web --reset-cache` (for web)

## Next Development Phases

### Phase 2 (Planned)
- [ ] Dark mode theme
- [ ] QR code scanner for chart attachment from PC
- [ ] Advanced filters and search
- [ ] Trade statistics breakdown by market
- [ ] Export trades to CSV/JSON

### Phase 3 (Future)
- [ ] Cloud backup and sync
- [ ] Desktop companion app
- [ ] Voice notes for trades
- [ ] AI-assisted review summaries
- [ ] Trading setup templates

## Performance Notes

- App is optimized for ~1000+ trades before performance optimization needed
- Image compression keeps storage usage minimal
- SQLite queries are indexed for fast filtering
- No network requests in current version

---

**Version**: 1.0 MVP
**Last Updated**: February 2, 2026
**Status**: Ready for Testing ✅
