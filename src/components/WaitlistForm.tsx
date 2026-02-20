'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { addToWaitlist } from '@/app/actions'

const initialState = {
  message: '',
  success: false,
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Joining...' : 'Join Waitlist'}
    </button>
  )
}

export function WaitlistForm() {
  const [state, formAction] = useActionState(addToWaitlist, initialState as any)

  return (
    <form action={formAction} className="mt-10 flex flex-col gap-y-4 sm:flex-row sm:gap-x-4">
      <div className="flex-auto">
        <label htmlFor="email-address" className="sr-only">
          Email address
        </label>
        <input
          id="email-address"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 placeholder:text-gray-400 w-full"
          placeholder="Enter your email"
        />
      </div>
      <SubmitButton />
      <div className="w-full sm:w-auto">
      {state?.message && (
        <p className={`mt-2 text-sm ${state.success ? 'text-orange-400' : 'text-red-400'}`}>
          {state.message}
        </p>
      )}
      </div>
    </form>
  )
}
