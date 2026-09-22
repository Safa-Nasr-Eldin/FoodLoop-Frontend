import { useEffect, useRef, useState, type FormEvent } from 'react'

export type Errors = Record<string, string>
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const rules = {
  required: (v: string, msg: string) => (v.trim() ? '' : msg),
  email: (v: string) => (!v.trim() ? 'Enter your email address.' : EMAIL.test(v.trim()) ? '' : 'Enter a valid email, like name@organization.org.'),
  password: (v: string) => (!v ? 'Enter a password.' : v.length < 8 ? 'Use at least 8 characters.' : ''),
}

/**
 * FRONTEND PROTOTYPE ONLY. Validates in the browser, simulates a short wait, then reports that
 * accounts are not connected yet. No request is made and nothing is stored. Real auth lands in R6.
 */
export function useMockSubmit(validate: (data: FormData) => Errors) {
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const found = Object.fromEntries(Object.entries(validate(new FormData(form))).filter(([, msg]) => msg))
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      setStatus('idle')
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setStatus('submitting')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setStatus('done'), 900)
  }

  return { errors, status, onSubmit }
}
