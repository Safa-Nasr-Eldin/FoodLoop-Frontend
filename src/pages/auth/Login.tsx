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

export function Login() {
  const { errors, status, onSubmit } = useMockSubmit((data) => ({
    email: rules.email(String(data.get('email') ?? '')),
    password: String(data.get('password') ?? '') ? '' : 'Enter your password.',
  }))

  return (
    <AuthLayout
      variant="login"
      art={
        <>
          <BotanicalCorner position="top-right" className="auth-panel__contours" />
          <BotanicalBranch className="auth-panel__branch" />
        </>
      }
      panel={
        <>
          <span className="auth-panel__mark">
            <FoodLoopMark />
          </span>
          <div className="auth-panel__statement">
            <p className="display auth-panel__headline">
              Pick up where the <em>loop</em> left&nbsp;off.
            </p>
            <p className="auth-panel__copy">
              Every listing, claim and handoff on FoodLoop belongs to a real organization. Signing in keeps that chain
              of trust intact — for the food, and for the people waiting for it.
            </p>
          </div>
          <p className="t-label auth-panel__tagline">Rescue · Redistribute · Repeat</p>
        </>
      }
    >
      <RevealGroup className="auth-form-wrap">
        <RevealItem>
          <SectionEyebrow>Log in</SectionEyebrow>
        </RevealItem>
        <RevealItem>
          <h1 className="auth-title">
            Welcome <em>back.</em>
          </h1>
          <p className="auth-lead">Sign in to share surplus, claim food for your organization or pick up your next run.</p>
        </RevealItem>

        <form className="auth-form" noValidate onSubmit={onSubmit}>
          <RevealItem>
            <Field id="email" label="Email" type="email" autoComplete="email" required error={errors.email} />
          </RevealItem>
          <RevealItem>
            <Field
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              error={errors.password}
            />
          </RevealItem>
          <RevealItem className="auth-form__row">
            <label className="check">
              <input type="checkbox" name="remember" className="check__input" />
              <span className="check__box" aria-hidden="true" />
              Keep me signed in on this device
            </label>
          </RevealItem>
          <RevealItem className="auth-form__submit">
            <MagneticButton>
              <Button type="submit" size="lg" loading={status === 'submitting'} iconEnd={<ArrowRight />}>
                Log in
              </Button>
            </MagneticButton>
          </RevealItem>
          <div role="status" className="auth-status-slot">
            {status === 'done' && (
              <p className="auth-status">
                <Info aria-hidden="true" />
                This is a design prototype — sign-in isn’t connected yet, and nothing you entered was sent or stored.
              </p>
            )}
          </div>
        </form>

        <RevealItem>
          <p className="auth-switch">
            New to FoodLoop?{' '}
            <Link to={PATHS.register} className="link-underline">
              Create an account
            </Link>
          </p>
        </RevealItem>
      </RevealGroup>
    </AuthLayout>
  )
}
