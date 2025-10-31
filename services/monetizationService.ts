// services/monetizationService.ts
import { Plan } from '../types';

// This file now only contains the default plans for initial database seeding.
// All logic for fetching plans is now in the apiService to allow for dynamic admin changes.

export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'single',
    name: 'Single Pass',
    credits: 5,
    price: 20,
    currency: 'PGK',
    description: 'Great for getting started.',
    tooltipDescription: 'Ideal for a one-time resume refresh or a single, important job application.',
  },
  {
    id: 'creator',
    name: 'Creator Pack',
    credits: 10,
    price: 35,
    currency: 'PGK',
    description: 'Best value for frequent users.',
    isBestValue: true,
    tooltipDescription: 'Perfect for active job seekers applying to multiple roles and creating variations of their documents.',
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 50,
    price: 125,
    currency: 'PGK',
    description: 'For power users and professionals.',
    tooltipDescription: 'The ultimate choice for career professionals, consultants, or anyone needing maximum flexibility.',
  },
];