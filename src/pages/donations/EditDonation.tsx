import { ArrowLeft, Lock } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { PATHS, donationPath } from '../../app/routes'
import { STATUS_META, isEditable } from '../../components/food/presentation'
import { Button } from '../../components/ui/Button'
import { getMockDonationById } from '../../data/mock/donations'
import { DonationForm } from './DonationForm'

export function EditDonation() {
  const { id = '' } = useParams()
  const donation = getMockDonationById(id)

  if (!donation) {
    return (
      <div className="container ws-page">
        <div className="ws-empty">
          <h1 className="t-h2">There’s no donation to edit here.</h1>
          <p>It may have been removed, or the link is incomplete.</p>
          <Button to={PATHS.donations} iconStart={<ArrowLeft />}>
            Back to my donations
          </Button>
        </div>
      </div>
    )
  }

  if (!isEditable(donation)) {
    return (
      <div className="container ws-page">
        <div className="ws-empty">
          <Lock aria-hidden="true" width={28} height={28} />
          <h1 className="t-h2">This donation can’t be edited.</h1>
          <p>
            “{donation.title}” is {STATUS_META[donation.status].label.toLowerCase()}. Only drafts and available listings
            can be changed, so claims and deliveries stay trustworthy.
          </p>
          <Button to={donationPath(donation.id)} iconStart={<ArrowLeft />}>
            View donation
          </Button>
        </div>
      </div>
    )
  }

  // key: switching between two edit routes remounts the form with the other donation's values.
  return <DonationForm key={donation.id} mode="edit" donation={donation} />
}
