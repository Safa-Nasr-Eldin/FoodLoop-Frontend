// MOCK DATA BOUNDARY — sample organization for frontend development. R6 swaps these functions for API calls.
import type { Organization } from '../../types/organization'

const ORGANIZATION: Organization = {
  id: 'org-harbour',
  name: 'Harbour Street Kitchen',
  type: 'Restaurant',
  status: 'Active',
  licenseNumber: 'FBO-2291-HSK',
  registrationNumber: 'CRN 08812457',
  contactName: 'Amira Haddad',
  email: 'surplus@harbourstreetkitchen.example',
  phone: '+44 20 7946 0321',
  address: '14 Harbour Street',
  city: 'Harbourside, London',
  description:
    'A neighbourhood restaurant cooking seasonal, vegetable-led food for around 300 covers a day. We list surplus prepared meals, produce and pantry stock at the end of each service so it reaches community kitchens the same evening.',
  website: 'harbourstreetkitchen.example',
  createdAt: '2025-03-04T10:00:00Z',
  verifiedAt: '2025-03-11T14:30:00Z',
}

/** The organization the sample donor belongs to. */
export function getCurrentMockOrganization(): Organization {
  return ORGANIZATION
}
