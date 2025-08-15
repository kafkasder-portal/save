import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Mail, Lock, User, Phone, Building } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır')
})

const registerSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: z.string().min(6, 'Şifre tekrarı gereklidir'),
  full_name: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
  department: z.string().optional(),
  phone: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
})

const forgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz')
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()
  const { user, session, loading, error, signIn, signUp, resetPassword, clearError } = useAuthStore()

  // Redirect if already authenticated
  if (session && user) {
    const from = location.state?.from?.pathname || '/'
    return <Navigate to={from} replace />
  }

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      department: '',
      phone: ''
    }
  })

  const forgotForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  })

  // Clear errors when switching modes
  useEffect(() => {
    clearError()
  }, [mode, clearError])

  const onLogin = async (data: LoginForm) => {
    try {
      const session = await signIn(data.email, data.password)
      if (session) {
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      }
    } catch (error) {
      // Error is handled in the store
    }
  }

  const onRegister = async (data: RegisterForm) => {
    try {
      await signUp(data.email, data.password, {
        full_name: data.full_name,
        department: data.department,
        phone: data.phone
      })
      setMode('login')
      registerForm.reset()
    } catch (error) {
      // Error is handled in the store
    }
  }

  const onForgotPassword = async (data: ForgotPasswordForm) => {
    try {
      await resetPassword(data.email)
      setMode('login')
      forgotForm.reset()
    } catch (error) {
      // Error is handled in the store
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'login' && 'Hoş Geldiniz'}
            {mode === 'register' && 'Hesap Oluşturun'}
            {mode === 'forgot' && 'Şifre Sıfırlama'}
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === 'login' && 'Dernek Yönetim Paneli'}
            {mode === 'register' && 'Yeni hesap oluşturmak için bilgilerinizi giriniz'}
            {mode === 'forgot' && 'Email adresinizi girerek şifrenizi sıfırlayın'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...loginForm.register('email')}
                  type="email"
                  placeholder="ornek@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              {loginForm.formState.errors.email && (
                <p className="text-red-600 text-sm mt-1">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...loginForm.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-red-600 text-sm mt-1">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 rounded-lg font-medium transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Şifremi unuttum
              </button>
              <div className="text-gray-600 text-sm">
                Hesabınız yok mu?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Kayıt olun
                </button>
              </div>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...registerForm.register('full_name')}
                  type="text"
                  placeholder="Adınız Soyadınız"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              {registerForm.formState.errors.full_name && (
                <p className="text-red-600 text-sm mt-1">{registerForm.formState.errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Adresi *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...registerForm.register('email')}
                  type="email"
                  placeholder="ornek@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              {registerForm.formState.errors.email && (
                <p className="text-red-600 text-sm mt-1">{registerForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-red-600 text-sm mt-1">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre Tekrar *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerForm.register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departman
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerForm.register('department')}
                    type="text"
                    placeholder="Departmanınız"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerForm.register('phone')}
                    type="tel"
                    placeholder="+90 555 123 45 67"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 rounded-lg font-medium transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Hesap oluşturuluyor...
                </>
              ) : (
                'Hesap Oluştur'
              )}
            </Button>

            <div className="text-center">
              <div className="text-gray-600 text-sm">
                Zaten hesabınız var mı?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Giriş yapın
                </button>
              </div>
            </div>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={forgotForm.handleSubmit(onForgotPassword)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...forgotForm.register('email')}
                  type="email"
                  placeholder="ornek@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              {forgotForm.formState.errors.email && (
                <p className="text-red-600 text-sm mt-1">{forgotForm.formState.errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 rounded-lg font-medium transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Gönderiliyor...
                </>
              ) : (
                'Şifre Sıfırlama Bağlantısı Gönder'
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ← Giriş sayfasına dön
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
