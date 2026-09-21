import { ArrowRight, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PATHS } from '../../app/routes'
import { BotanicalBranch, BotanicalCorner } from '../../components/brand/Botanical'
import { FoodLoopMark } from '../../components/brand/FoodLoopMark'
import { MagneticButton } from '../../components/motion/MagneticButton'
import { RevealGroup, RevealItem } from '../../components/motion/Reveal'
import { Button } from '../../components/ui/Button'
import { SectionEyebrow } from '../../components/ui/SectionEyebrow'
import { AuthLayout } from './AuthLayout'
import { Field } from '../../components/ui/Field'
import { rules, useMockSubmit } from './useMockSubmit'

const PARTICIPATION = [
  { value: 'donor', label: 'Donor', text: 'We have surplus food to share.' },
  { value: 'beneficiary', label: 'Beneficiary', text: 'We receive food for our community.' },
  { value: 'courier', label: 'Courier', text: 'We move food from pickup to delivery.' },
] as const

const NEXT_STEPS = ['Tell us about your organization', 'Create your personal account', 'We review and welcome you in']

export function Register() {
  const { errors, status, onSubmit } = useMockSubmit((data) => {
    const get = (k: string) => String(data.get(k) ?? '')
    return {
      orgName: rules.required(get('orgName'), 'Enter your organization’s name.'),
      role: get('role') ? '' : 'Choose how your organization takes part.',
      city: rules.required(get('city'), 'Enter the city you operate in.'),
      fullName: rules.required(get('fullName'), 'Enter your full name.'),
      email: rules.email(get('email')),
      password: rules.password(get('password')),
      terms: get('terms') ? '' : 'Please accept the terms to continue.',
    }
  })

  return (
    <AuthLayout
      variant="register"
      art={
        <>
          <BotanicalCorner position="bottom-right" className="auth-panel__contours auth-panel__contours--low" />
          <BotanicalBranch className="auth-panel__branch auth-panel__branch--register" />
        </>
      }
      panel={
        <>
          <span className="auth-panel__mark">
            <FoodLoopMark />
          </span>
          <div className="auth-panel__statement">
            <p className="display auth-panel__headline">
              Join the <em>loop</em>.
            </p>
            <ol className="auth-steps" role="list" aria-label="What happens next">
              {NEXT_STEPS.map((s, i) => (
                <li key={s}>
                  <span className="auth-steps__index">{String(i + 1).padStart(2, '0')}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <p className="t-label auth-panel__tagline">Donors · Beneficiaries · Couriers</p>
        </>
      }
    >
      <RevealGroup className="auth-form-wrap auth-form-wrap--wide">
        <RevealItem>
          <SectionEyebrow>Create an account</SectionEyebrow>
        </RevealItem>
        <RevealItem>
          <h1 className="auth-title">
            Bring your organization <em>into the loop.</em>
          </h1>
          <p className="auth-lead">Two short parts. It takes a few minutes, and you can finish your profile later.</p>
        </RevealItem>

        <form className="auth-form" noValidate onSubmit={onSubmit}>
          <RevealItem>
            <fieldset className="form-group">
              <legend className="form-group__legend">
                <span className="form-group__index">01</span>
                Organization
              </legend>
              <div className="form-group__grid">
                <Field
                  id="orgName"
                  label="Organization name"
                  autoComplete="organization"
                  required
                  error={errors.orgName}
                  className="span-2"
                />
                <fieldset
                  className={`choice span-2${errors.role ? ' has-error' : ''}`}
                  aria-describedby={errors.role ? 'role-error' : undefined}
                >
                  <legend className="field__label">How do you take part?</legend>
                  <div className="choice__options">
                    {PARTICIPATION.map((p) => (
                      <label key={p.value} className="choice__option">
                        <input type="radio" name="role" value={p.value} className="choice__input" required />
                        <span className="choice__card">
                          <span className="choice__label">{p.label}</span>
                          <span className="choice__text">{p.text}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.role && (
                    <p id="role-error" className="field__error">
                      {errors.role}
                    </p>
                  )}
                </fieldset>
                <Field id="city" label="City" autoComplete="address-level2" required error={errors.city} />
              </div>
            </fieldset>
          </RevealItem>

          <RevealItem>
            <fieldset className="form-group">
              <legend className="form-group__legend">
                <span className="form-group__index">02</span>
                Account
              </legend>
              <div className="form-group__grid">
                <Field id="fullName" label="Full name" autoComplete="name" required error={errors.fullName} />
                <Field id="email" label="Work email" type="email" autoComplete="email" required error={errors.email} />
                <Field
                  id="password"
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  hint="At least 8 characters."
                  required
                  error={errors.password}
                  className="span-2"
                />
                <div className={`span-2 check-field${errors.terms ? ' has-error' : ''}`}>
                  <label className="check">
                    <input
                      type="checkbox"
                      name="terms"
                      className="check__input"
                      required
                      aria-invalid={errors.terms ? true : undefined}
                      aria-describedby={errors.terms ? 'terms-error' : undefined}
                    />
                    <span className="check__box" aria-hidden="true" />
                    <span>
                      I agree to the FoodLoop{' '}
                      <Link to="/terms" className="link-underline">
                        terms
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="link-underline">
                        privacy policy
                      </Link>
                      .
                    </span>
                  </label>
                  {errors.terms && (
                    <p id="terms-error" className="field__error">
                      {errors.terms}
                    </p>
                  )}
                </div>
              </div>
            </fieldset>
          </RevealItem>

          <RevealItem className="auth-form__submit auth-form__submit--split">
            <MagneticButton>
              <Button type="submit" size="lg" loading={status === 'submitting'} iconEnd={<ArrowRight />}>
                Create account
              </Button>
            </MagneticButton>
            <p className="auth-switch">
              Already have an account?{' '}
              <Link to={PATHS.login} className="link-underline">
                Log in
              </Link>
            </p>
          </RevealItem>
          <div role="status" className="auth-status-slot">
            {status === 'done' && (
              <p className="auth-status">
                <Info aria-hidden="true" />
                This is a design prototype — registration isn’t connected yet, and nothing you entered was sent or
                stored.
              </p>
            )}
          </div>
        </form>
      </RevealGroup>
    </AuthLayout>
  )
}
