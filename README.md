# Pet Management Application

A single-page React application for managing clients and their pets, built with TypeScript, Redux Toolkit, and CSS Modules.

## Features

- **Client & Pet List**: Searchable list of clients with their pets, with "Include Inactive" toggle
- **Pet Profile Drawer**: Detailed view with tabs for:
  - Pet Details (read + inline edit with validation)
  - Photos (upload/remove with drag-and-drop)
  - Vaccinations (read + quick add)
  - Grooming (read)
  - Bookings (read)
- **Optimistic Updates**: Pet edits update UI immediately with rollback on error
- **Accessibility**: Keyboard navigation, ARIA roles, and focus states
- **Responsive Design**: Works at 1280px desktop and stacks at ~768px

## Setup & Run Instructions

### Prerequisites

- Node.js (v20.13.1 or higher recommended)
- npm

### Installation

```bash
npm install
```

### Running the Application

1. **Start the mock API server** (in one terminal):
   ```bash
   npm run server
   ```
   This starts `json-server` on `http://localhost:4000` serving `data/db.json`.

2. **Start the development server** (in another terminal):
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (or the next available port).

### Other Commands

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint
```

## Architecture Decisions

### State Management: Redux Toolkit

- **Why**: Centralized state for clients, pets, vaccinations, grooming, and bookings enables predictable data flow and easier debugging.
- **Implementation**: 
  - Separate slices for each domain (`clientsSlice`, `petsSlice`, etc.)
  - `createAsyncThunk` for API calls with loading/error states
  - Optimistic updates for pet edits with automatic rollback on failure
  - Selectors (`selectClientsWithPets`) for derived/computed state

### Data Flow Pattern

- **App-level state**: `selectedPetId` stored in `App.tsx` local state
- **Derived data**: `selectedPet` object derived from Redux store using `useAppSelector`
- **Rationale**: Ensures the drawer always reflects the latest Redux state, even after optimistic updates or refetches

### Styling: CSS Modules

- **Why**: Component-scoped styles prevent naming conflicts and enable better maintainability
- **Pattern**: Each component has its own `.module.css` file (e.g., `PetDetails.module.css`)

### Type Safety: TypeScript

- **Strict mode enabled**: Catches errors at compile time
- **Type definitions**: Centralized in `src/types.ts` for consistency
- **Jest config**: Separate `tsconfig.jest.json` for test compilation (CommonJS) vs app (ESM)

### API Layer

- **Mock API**: `json-server` provides REST endpoints (`GET /pets`, `PATCH /pets/:id`, etc.)
- **API functions**: Centralized in `src/api/api.ts` for easy mocking in tests
- **Error handling**: Consistent error messages and rollback logic

### Component Architecture

- **Functional components**: All components use React hooks
- **Separation of concerns**:
  - `ClientList`: Handles search, filtering, and row selection
  - `PetDrawer`: Manages tab navigation and Actions menu
  - `PetDetails`: Handles inline editing with validation
  - `Photos`, `Vaccinations`, `Grooming`, `Bookings`: Domain-specific tabs

### Testing Strategy

- **Unit tests** (Jest + RTL): Test pure functions and isolated components
- **Component tests** (RTL): Test component interactions and Redux integration
- **Test setup**:
  - `jest.config.cjs`: Uses `ts-jest` with separate TypeScript config for tests
  - `src/setupTests.ts`: Imports `@testing-library/jest-dom` matchers
  - CSS modules mocked via `identity-obj-proxy`

## Testing

### Test Coverage

The test suite includes:

#### Unit Tests (`src/__tests__/unit/`)

1. **Age Calculation** (`age.test.ts`):
   - Normal date calculations (years & months)
   - Edge cases: less than 1 month, leap year birthdays
   - Formatting output

2. **Validation** (`validation.test.ts`):
   - Future DOB rejection
   - Weight validation (0-200 kg, max 2 decimals)
   - Required field validation

3. **Attribute Multi-Select** (`AttributeMultiSelect.test.tsx`):
   - Chip removal calls `onChange` correctly
   - Adding attributes from dropdown updates form state

#### Component Tests (`src/__tests__/components/`)

1. **PetDrawerFlow** (`PetDrawerFlow.test.tsx`):
   - Clicking a client row opens the Pet Drawer
   - Edit mode → changing weight → save triggers `updatePet` API call
   - Verifies Redux integration and optimistic updates

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- src/__tests__/unit/age.test.ts
```

## Change Requests Implemented

### Quick Add Vaccination

## Project Structure

```
src/
├── api/              # API client functions
├── components/       # React components
│   ├── ClientList.tsx
│   ├── PetDrawer.tsx
│   ├── PetDetails.tsx
│   └── ...
├── store/           # Redux store and slices
│   ├── slices/      # Redux Toolkit slices
│   ├── selectors.ts # Memoized selectors
│   └── store.ts     # Store configuration
├── types.ts         # TypeScript type definitions
├── utils/           # Utility functions (age, validation)
└── __tests__/       # Test files
    ├── unit/        # Unit tests
    └── components/  # Component tests
```

## Key Technologies

- **React 19.2** with TypeScript
- **Redux Toolkit 2.2** for state management
- **Vite 7.2** for build tooling
- **CSS Modules** for styling
- **Jest 29.7** + **React Testing Library 16.0** for testing
- **json-server** for mock API

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design tested at 1280px (desktop) and 768px (tablet)

