import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, ArrowRight, Check, Info } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { PATHS, donationPath } from '../../app/routes'
import { DonationCard } from '../../components/food/DonationCard'
import { CATEGORY_META } from '../../components/food/presentation'
import { MagneticButton } from '../../components/motion/MagneticButton'
import { Button } from '../../components/ui/Button'
import { Field, FieldFrame } from '../../components/ui/Field'
import { SectionEyebrow } from '../../components/ui/SectionEyebrow'
import { getCurrentMockOrganization } from '../../data/mock/organization'
import { cn } from '../../lib/cn'
import { toLocalInput } from '../../lib/expiry'
import { spring } from '../../lib/motion'
import { FOOD_CATEGORIES, QUANTITY_UNITS, type Donation, type FoodCategory, type QuantityUnit } from '../../types/donation'
import './donation-form.css'

type Values = {
  title: string
  category: FoodCategory | null
  quantity: string
  unit: QuantityUnit
  expiresAt: string // datetime-local value
  pickupAddress: string
  description: string
}
type Key = keyof Values
type Errors = Partial<Record<Key, string>>

const TITLE_MAX = 80
const DESCRIPTION_MAX = 500

// Browser-side checks only (presence, shape). The API remains the authority once connected.
function validate(v: Values): Errors {
  const errors: Errors = {}
  const qty = Number(v.quantity)
  if (!v.title.trim()) errors.title = 'Give the donation a short title.'
  else if (v.title.length > TITLE_MAX) errors.title = `Keep the title under ${TITLE_MAX} characters.`
  if (!v.category) errors.category = 'Choose the category that fits best.'
  if (!v.quantity) errors.quantity = 'Enter a quantity.'
  else if (!Number.isInteger(qty) || qty < 1) errors.quantity = 'Use a whole number of 1 or more.'
  if (!v.expiresAt) errors.expiresAt = 'Choose when this food should be collected by.'
  else if (new Date(v.expiresAt).getTime() <= Date.now()) errors.expiresAt = 'Choose a time in the future.'
  if (!v.pickupAddress.trim()) errors.pickupAddress = 'Enter the pickup address.'
  if (!v.description.trim()) errors.description = 'Add a short description: contents, packaging, handling.'
  else if (v.description.length > DESCRIPTION_MAX) errors.description = `Keep it under ${DESCRIPTION_MAX} characters.`
  return errors
}

const SECTIONS: { id: string; index: string; title: string; keys: Key[] }[] = [
  { id: 'sec-food', index: '01', title: 'Food', keys: ['title', 'category'] },
  { id: 'sec-timing', index: '02', title: 'Quantity & timing', keys: ['quantity', 'expiresAt'] },
  { id: 'sec-pickup', index: '03', title: 'Pickup', keys: ['pickupAddress'] },
  { id: 'sec-details', index: '04', title: 'Details', keys: ['description'] },
]

type DonationFormProps = { mode: 'create' } | { mode: 'edit'; donation: Donation }

/** Create / Edit share this form. All state is local presentation state; nothing is submitted anywhere. */
export function DonationForm(props: DonationFormProps) {
  const org = getCurrentMockOrganization()
  const editing = props.mode === 'edit' ? props.donation : null
  const [values, setValues] = useState<Values>(() =>
    editing
      ? {
          title: editing.title,
          category: editing.category,
          quantity: String(editing.quantity),
          unit: editing.unit,
          expiresAt: toLocalInput(editing.expiresAt),
          pickupAddress: editing.pickupAddress,
          description: editing.description,
        }
      : {
          title: '',
          category: null,
          quantity: '',
          unit: 'kg',
          expiresAt: '',
          pickupAddress: `${org.address}, ${org.city.split(',')[0]}`,
          description: '',
        },
  )
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle')
  const [minExpiry] = useState(() => toLocalInput(new Date().toISOString()))
  const formRef = useRef<HTMLFormElement>(null)

  const complete = validate(values)
  const sectionDone = (keys: Key[]) => keys.every((k) => !complete[k])
  const doneCount = SECTIONS.filter((s) => sectionDone(s.keys)).length

  function set<K extends Key>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key])
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    if (status === 'done') setStatus('idle')
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    const first = (Object.keys(found) as Key[])[0]
    if (first) {
      setStatus('idle')
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setStatus('submitting')
    window.setTimeout(() => setStatus('done'), 800)
  }

  // Live preview: the same card the marketplace renders, fed by the form state.
  const preview: Donation = {
    id: editing?.id ?? 'preview',
    title: values.title.trim() || 'Your donation title',
    description: values.description.trim(),
    category: values.category ?? 'Mixed',
    quantity: Number(values.quantity) > 0 ? Number(values.quantity) : 0,
    unit: values.unit,
    expiresAt: values.expiresAt && !Number.isNaN(Date.parse(values.expiresAt)) ? new Date(values.expiresAt).toISOString() : '',
    pickupAddress: values.pickupAddress.trim() || '—',
    status: editing?.status ?? 'Available',
    organizationId: org.id,
    organizationName: org.name,
    createdAt: editing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrl: editing?.imageUrl,
  }

  const sectionState = (keys: Key[]) =>
    keys.some((k) => errors[k]) ? 'error' : sectionDone(keys) ? 'done' : 'todo'

  return (
    <div className="container ws-page dform">
      <Link to={editing ? donationPath(editing.id) : PATHS.donations} className="ws-back">
        <ArrowLeft aria-hidden="true" />
        {editing ? 'Back to donation' : 'My donations'}
      </Link>

      <header className="ws-intro dform__intro">
        <SectionEyebrow>{editing ? `Donor workspace · #${editing.id.toUpperCase()}` : 'Donor workspace · New listing'}</SectionEyebrow>
        <h1 className="ws-intro__title">
          {editing ? (
            <>
              Edit <em>donation</em>
            </>
          ) : (
            <>
              Create <em>donation</em>
            </>
          )}
        </h1>
        <p className="t-lead ws-intro__lead">
          {editing
            ? 'Update the details organizations see. Changes appear in the preview as you type.'
            : 'Four short sections. The live preview shows exactly how organizations will see your listing.'}
        </p>
      </header>

      <div className="dform__grid">
        <form ref={formRef} className="dform__form" noValidate onSubmit={onSubmit} aria-label={editing ? 'Edit donation' : 'Create donation'}>
          {SECTIONS.map((section) => {
            const state = sectionState(section.keys)
            return (
              <fieldset key={section.id} id={section.id} className={cn('dsec', `is-${state}`)}>
                <legend className="dsec__legend">
                  <span className="dsec__index">{section.index}</span>
                  <span className="dsec__title">{section.title}</span>
                  <span className="dsec__state">
                    {state === 'done' ? (
                      <>
                        <Check aria-hidden="true" /> Complete
                      </>
                    ) : state === 'error' ? (
                      <>
                        <AlertCircle aria-hidden="true" /> Needs attention
                      </>
                    ) : (
                      'To do'
                    )}
                  </span>
                </legend>

                <div className="dsec__fields">
                  {section.id === 'sec-food' && (
                    <>
                      <Field
                        id="title"
                        label="Title"
                        hint={`What is it, in a few words — e.g. “Fresh vegetable crate”. ${values.title.length}/${TITLE_MAX}`}
                        value={values.title}
                        onChange={(e) => set('title', e.target.value)}
                        error={errors.title}
                        required
                      />
                      <CategoryPicker value={values.category} error={errors.category} onChange={(c) => set('category', c)} />
                    </>
                  )}

                  {section.id === 'sec-timing' && (
                    <>
                      <div className="dsec__row">
                        <Field
                          id="quantity"
                          label="Quantity"
                          type="number"
                          inputMode="numeric"
                          min={1}
                          step={1}
                          value={values.quantity}
                          onChange={(e) => set('quantity', e.target.value)}
                          error={errors.quantity}
                          required
                        />
                        <FieldFrame id="unit" label="Unit">
                          {(describedBy) => (
                            <select
                              id="unit"
                              name="unit"
                              className="field__input field__select"
                              value={values.unit}
                              aria-describedby={describedBy}
                              onChange={(e) => set('unit', e.target.value as QuantityUnit)}
                            >
                              {QUANTITY_UNITS.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>
                          )}
                        </FieldFrame>
                      </div>
                      <Field
                        id="expiresAt"
                        label="Collect by"
                        hint="The latest time this food can be picked up."
                        type="datetime-local"
                        min={minExpiry}
                        value={values.expiresAt}
                        onChange={(e) => set('expiresAt', e.target.value)}
                        error={errors.expiresAt}
                        required
                      />
                    </>
                  )}

                  {section.id === 'sec-pickup' && (
                    <Field
                      id="pickupAddress"
                      label="Pickup address"
                      hint={`Pre-filled from ${org.name}. Change it if the food is somewhere else.`}
                      autoComplete="street-address"
                      value={values.pickupAddress}
                      onChange={(e) => set('pickupAddress', e.target.value)}
                      error={errors.pickupAddress}
                      required
                    />
                  )}

                  {section.id === 'sec-details' && (
                    <FieldFrame
                      id="description"
                      label="Description"
                      hint={`Contents, packaging, allergens, storage. ${values.description.length}/${DESCRIPTION_MAX}`}
                      error={errors.description}
                    >
                      {(describedBy) => (
                        <textarea
                          id="description"
                          name="description"
                          className="field__input field__textarea"
                          rows={5}
                          value={values.description}
                          aria-describedby={describedBy}
                          aria-invalid={errors.description ? true : undefined}
                          required
                          onChange={(e) => set('description', e.target.value)}
                        />
                      )}
                    </FieldFrame>
                  )}
                </div>
              </fieldset>
            )
          })}

          <div className="dform__submit">
            <MagneticButton>
              <Button type="submit" size="lg" loading={status === 'submitting'} iconEnd={<ArrowRight />}>
                {editing ? 'Save changes' : 'Publish donation'}
              </Button>
            </MagneticButton>
            <Button variant="ghost" size="lg" to={editing ? donationPath(editing.id) : PATHS.donations}>
              Cancel
            </Button>
          </div>
          <div role="status" className="dform__status">
            {status === 'done' && (
              <p className="ws-notice">
                <Info aria-hidden="true" />
                {editing
                  ? 'Prototype only — your changes look good, but saving isn’t connected yet. Nothing was sent or stored.'
                  : 'Prototype only — this donation is ready, but publishing isn’t connected yet. Nothing was sent or stored.'}
              </p>
            )}
          </div>
        </form>

        <aside className="dform__aside" aria-labelledby="preview-title">
          <div className="readiness">
            <p className="readiness__head">
              <span className="t-label">Listing readiness</span>
              <span className="readiness__count t-data">
                {doneCount}/{SECTIONS.length}
              </span>
            </p>
            <ol role="list" className="readiness__steps">
              {SECTIONS.map((s) => {
                const done = sectionDone(s.keys)
                return (
                  <li key={s.id} className={cn('readiness__step', done && 'is-done')}>
                    <span className="readiness__bar" aria-hidden="true" />
                    <span className="readiness__label">
                      {s.title}
                      <span className="visually-hidden">{done ? ' — complete' : ' — to do'}</span>
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>

          <h2 id="preview-title" className="dform__preview-title t-label">
            Live preview
          </h2>
          <DonationCard donation={preview} preview className="dform__preview" />
          <p className="dform__preview-note">How organizations will see this listing on the marketplace.</p>
        </aside>
      </div>
    </div>
  )
}

function CategoryPicker({
  value,
  error,
  onChange,
}: {
  value: FoodCategory | null
  error?: string
  onChange: (c: FoodCategory) => void
}) {
  return (
    <fieldset className={cn('cat-pick', error && 'has-error')}>
      <legend className="field__label">Category</legend>
      <div className="cat-pick__grid">
        {FOOD_CATEGORIES.map((c) => {
          const meta = CATEGORY_META[c]
          const Icon = meta.icon
          const checked = value === c
          return (
            <label key={c} className={cn('cat-pick__option', checked && 'is-checked')}>
              <input
                type="radio"
                name="category"
                value={c}
                checked={checked}
                onChange={() => onChange(c)}
                className="cat-pick__input"
                aria-describedby={error ? 'category-error' : undefined}
              />
              {checked && <motion.span layoutId="cat-pick-indicator" className="cat-pick__indicator" transition={spring.indicator} />}
              <Icon aria-hidden="true" className="cat-pick__icon" />
              <span className="cat-pick__label">{meta.label}</span>
            </label>
          )
        })}
      </div>
      {error && (
        <p id="category-error" className="field__error">
          <AlertCircle aria-hidden="true" />
          {error}
        </p>
      )}
    </fieldset>
  )
}
