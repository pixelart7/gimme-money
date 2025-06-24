# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gimme Money is a Nuxt 3 application for PromptPay QR generation and bill splitting. It's a local-first PWA that stores all data in localStorage and doesn't require a backend server.

### Core Features
- PromptPay QR code generation for Thai payments
- Bill splitting calculator with complex group-based calculations
- Local storage for user data and bills
- Optional OpenAI integration for receipt parsing
- Progressive Web App capabilities

## Development Commands

Use yarn as the package manager (configured with yarn@4.4.1):

```bash
# Install dependencies
yarn install

# Development server (localhost:3000)
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Generate static site
yarn generate
```

## Architecture

### Tech Stack
- **Framework**: Nuxt 3 with SSR disabled (`ssr: false`)
- **UI**: Vue 3 with Pug templates, Tailwind CSS, SCSS
- **Icons**: Unplugin Icons with Phosphor icons (`@iconify-json/ph`)
- **State**: VueUse composables with localStorage persistence
- **Fonts**: Roboto Mono via Google Fonts

### Key Directories
- `pages/` - File-based routing with nested bill management
- `components/` - Reusable Vue components including bill displays and editors
- `composables/` - Business logic (`useGimmeCalculator.ts`, `useStore.ts`)
- `layouts/` - Application layouts
- `assets/` - SCSS and static assets

### State Management
Data is managed through `useStore()` composable with localStorage persistence:
- User info (name, PromptPay ID, OpenAI key)
- Bill data with complex splitting calculations
- Migration logic for Vue 2 legacy data

### Bill Splitting Engine
The core calculation logic is in `useGimmeCalculator.ts`:
- Supports complex group-based bill splitting
- Handles multiple payers and shared/individual items
- Calculates change from store and debt transfers
- Groups people by menu participation patterns

### Component Structure
- `AccountsDisplay.vue` - QR code generation and display
- `Bill.vue` - Main bill component with view/edit modes
- `BillEditor.vue` - Bill creation and editing interface
- `PeopleChooser.vue` - Person selection for bill items
- Account-specific components in `components/accounts/`

### Routing
- `/` - PromptPay QR generator
- `/split` - Bill list view
- `/bill/new` - Create new bill
- `/bill/edit/[billIndex]` - Edit existing bill
- `/bill/view/[billIndex]` - View bill details
- `/info` - User settings

## Development Notes

### TypeScript Configuration
- Extends Nuxt's generated tsconfig
- Pug language plugin enabled for Vue templates
- Type definitions in composables for Bill, Entry, Payer interfaces

### Styling
- Tailwind CSS for utility classes
- SCSS for component-specific styling
- Custom CSS properties and responsive design
- Dark theme support in some components

### Local Storage Schema
Store structure includes version migration system:
```typescript
{
  version: number,
  userinfo: { name, promptpay, openaiKey, openaiModel, secondary },
  gimme: { amount, note },
  bills: Array<Bill>
}
```

### OpenAI Integration
Optional AI-powered receipt parsing using configurable model (default: gpt-4.1-mini).

### PWA Configuration
Configured via `nuxt.config.ts` with manifest, icons, and meta tags for mobile web app installation.