import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { server } from '../main'

const Verify = () => {
  const { token } = useParams()
  const verificationStarted = useRef(false)
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Verifying your email address...')

  useEffect(() => {
    if (verificationStarted.current) return
    verificationStarted.current = true

    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('The verification token is missing.')
        return
      }

      try {
        const { data } = await axios.post(
          `${server}/api/v1/verify/${encodeURIComponent(token)}`
        )
        setStatus('success')
        setMessage(data.message || 'Your email has been verified successfully.')
      } catch (error) {
        setStatus('error')
        setMessage(
          error.response?.data?.message ||
            'This verification link is invalid or has expired.'
        )
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl">
        {status === 'loading' && (
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-slate-600 border-t-indigo-500" />
        )}

        {status === 'success' && (
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl text-emerald-400">
            ✓
          </div>
        )}

        {status === 'error' && (
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-2xl text-red-400">
            ×
          </div>
        )}

        <h1 className="text-3xl font-bold tracking-tight text-white">
          {status === 'loading'
            ? 'Verifying email'
            : status === 'success'
              ? 'Email verified'
              : 'Verification failed'}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">{message}</p>

        {status !== 'loading' && (
          <Link
            to={status === 'success' ? '/Login' : '/Register'}
            className="mt-7 inline-block w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white transition hover:bg-indigo-500"
          >
            {status === 'success' ? 'Continue to login' : 'Register again'}
          </Link>
        )}
      </div>
    </div>
  )
}

export default Verify
