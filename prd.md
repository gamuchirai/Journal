# Product Requirements Document (PRD)

## Product Name

TradeFlow Journal (working name)

## Overview

TradeFlow Journal is a mobile-first trading journal built with React Native. The goal is to help discretionary traders journal trades quickly, with minimal friction, while enforcing structured thinking based on five trading building blocks: Bias, Narrative, Context, Entry, and Risk Management. The app prioritizes speed, clarity, and post-trade learning over long-form note taking.

A core feature is the ability to attach TradingView analysis screenshots from a PC to a specific trade on the phone using an in-app QR code scanner.

## Problem Statement

Most trading journals are either too detailed and time-consuming or too unstructured to generate meaningful insights. Traders often skip journaling altogether because it interrupts their workflow. Additionally, transferring analysis screenshots from PC to phone is clumsy and breaks focus.

## Goals

* Make journaling fast enough to be done consistently
* Enforce structured thinking without heavy typing
* Allow each trade to be reviewed objectively using clear yes/no outcomes
* Seamlessly attach chart screenshots to the correct trade
* Provide simple statistics that reveal which parts of the trader’s process actually work

## Non-Goals

* No signal generation or trade execution
* No broker integration in v1
* No social or copy trading features

## Target User

* Discretionary forex and indices traders
* Traders who analyze on PC (TradingView) and execute or journal on mobile
* Users familiar with structured trading frameworks (SMC, price action, etc.)

## Core Trading Framework

Each trade is structured around five building blocks:

* Bias
* Narrative
* Context
* Entry
* Risk Management

Each block must be defined during trade creation and evaluated after the trade is closed.

## Key Features

### 1. Trade Creation

Users can create a new trade with:

* Market / Pair
* Timeframe
* Bias (short text or picker)
* Narrative (short text)
* Context (picker or tag-based)
* Entry (picker or short text)
* Risk details (stop, target, RR)

Defaults should be applied where possible to reduce typing.

### 2. Trade Lifecycle

Each trade moves through states:

* Draft (planned, not taken)
* Active (trade running)
* Closed (trade finished)
* Reviewed (post-analysis complete)

### 3. Outcome Evaluation

After closing a trade, the user marks whether each block played out:

* Bias played out: Yes / No
* Narrative played out: Yes / No
* Context held: Yes / No
* Entry executed as planned: Yes / No
* Risk managed correctly: Yes / No

Optional short notes:

* What went right
* What went wrong

### 4. Screenshot Attachment via QR Code

#### PC Side (External)

* User takes a screenshot of TradingView analysis
* Screenshot is uploaded to a hosting service or backend
* A QR code is generated containing the image URL or embedded image data

#### Mobile App Side

* In the trade creation or edit screen, user taps "Add Chart from QR"
* App opens an in-app QR scanner
* QR code is scanned directly from the PC screen
* App retrieves the image
* Image is saved locally and attached to the trade

The screenshot must be permanently linked to the specific trade.

### 5. Trade List

* Scrollable list of trades
* Each trade card shows market, date, result, and optional thumbnail of chart
* Filters by date, market, and result

### 6. Trade Detail View

* Full breakdown of the trade
* Display attached chart image
* Show all building blocks and outcomes

### 7. Dashboard / Analytics

* Win rate
* Frequency each building block plays out
* Breakdown by market or setup (future enhancement)

## User Experience Principles

* Speed over perfection
* Minimal typing, maximum toggles and pickers
* Journaling should take under 60 seconds per trade
* No clutter, no unnecessary metrics

## Color and Theme Guidelines

The app uses a calm, professional palette optimized for focus and long sessions.

* Primary color: #16476a (deep blue) used for headers, primary buttons, active states, and navigation accents
* Secondary color: #a9d0fb (soft light blue) used for cards, input backgrounds, and secondary UI elements
* Accent color: #e29e21 (warm amber) used sparingly for CTAs such as "Save Trade", "Scan QR", and highlights
* Neutral background: #f1f1e6 used as the main background color for light mode

Text colors should be derived from the primary blue and darker neutrals for readability. Success states may use subtle green tints derived from the palette rather than introducing new colors.

Dark mode should be supported early due to trader usage patterns.

## Technical Requirements

### Tech Stack

* React Native (Expo-managed workflow for faster iteration)
* TypeScript for type safety
* React Navigation for screen and modal navigation
* React Hook Form for fast, low-boilerplate form handling
* Zustand or Context API for lightweight state management

### Storage

* SQLite (expo-sqlite) for structured trade data
* Expo FileSystem for local image storage
* AsyncStorage for small preferences and defaults

Image storage uses the device file system with URIs stored in the trade record.

### QR Scanning

* Expo Camera for camera access
* QR code decoding using expo-barcode-scanner or vision-camera-code-scanner
* Support for QR codes containing either:

  * Public image URLs
  * Base64-encoded image data

After scanning, the app downloads or decodes the image and persists it locally, then links it to the active trade.

### Image Handling

* Store image URI in trade record
* Display thumbnails and full-size previews

## Data Model (High Level)

* Trade

  * id
  * date
  * market
  * timeframe
  * bias
  * narrative
  * context
  * entry
  * risk
  * status
  * outcomes
  * screenshotUri
  * pnl
  * notes

## Security and Privacy

* No cloud sync in v1
* All data stored locally on device
* Camera access used only for QR scanning

## Success Metrics

* Trades journaled per week
* Percentage of trades reviewed
* Average time to log a trade
* User retention after 30 days

## Future Enhancements

* Cloud sync
* Desktop companion app
* Setup tagging and performance breakdown
* Voice notes
* AI-assisted review summaries

## Open Questions

* Preferred image hosting method for QR flow
* Maximum screenshot size
* Should multiple images per trade be supported in v2

---

End of PRD
