import { useEffect, useMemo, useState } from 'react'
import { Link, replace, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { server } from '../main'
import { AppData } from '../context/AppContext'

const VerifyOtp = () => {
  const navigate = useNavigate()
  const { setIsAuth, setUser } = AppData()
  const location = useLocation()
  const email = location.state?.email || ''

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const maskedEmail = useMemo(() => {
    if (!email) return ''

    const [name, domain] = email.split('@')
    if (!domain) return email

    const visibleName = name.length <= 2 ? name : `${name.slice(0, 2)}***`
    return `${visibleName}@${domain}`
  }, [email])

  useEffect(() => {
    if (countdown <= 0) return undefined

    const timer = setInterval(() => {
      setCountdown((timeLeft) => Math.max(timeLeft - 1, 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!email) {
      setError('Please login again to verify your OTP.')
      return
    }

    if (otp.length !== 6) {
      setError('Please enter the 6 digit OTP.')
      return
    }

    setLoading(true)

    try {
      const { data } = await axios.post(
        `${server}/api/v1/verify-otp`,
        { email, otp },
        { withCredentials: true }
      )
      localStorage.setItem('email', email)
      setUser(data.user)
      setIsAuth(true)
      navigate('/Dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return

    setError('')
    setMessage('')

    if (!email) {
      setError('Please login again to request a new OTP.')
      return
    }

    setResending(true)

    try {
      const { data } = await axios.post(
        `${server}/api/v1/resend-otp`,
        { email },
        { withCredentials: true }
      )
      setOtp('')
      setCountdown(60)
      setMessage(data?.message || 'A new OTP has been sent.')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to resend OTP. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Verify OTP</h1>
            <p className="text-slate-400 mt-2 text-sm">
              {email ? `Enter the code sent to ${maskedEmail}` : 'Login again to receive your OTP'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300">
                {message}
              </div>
            )}

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-slate-300 mb-1.5">
                OTP
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={handleOtpChange}
                placeholder="123456"
                required
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-center text-2xl font-semibold tracking-[0.45em] text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">Didn&apos;t receive the OTP?</p>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0 || resending || !email}
              className="mt-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 disabled:text-slate-500 disabled:cursor-not-allowed transition"
            >
              {resending
                ? 'Sending...'
                : countdown > 0
                  ? `Resend OTP in ${countdown}s`
                  : 'Resend OTP'}
            </button>
          </div>

          <p className="text-center text-sm text-slate-400 mt-6">
            Wrong email?{' '}
            <Link
              to="/Login"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyOtp
