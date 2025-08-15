import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Avatar } from '../ui/avatar'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit3,
  Save,
  X,
  Upload,
  Camera
} from 'lucide-react'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  firstName: z.string().min(1, 'Ad gereklidir'),
  lastName: z.string().min(1, 'Soyad gereklidir'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  phone: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  birthDate: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface UserProfileProps {
  user?: any // In real app, this would be a proper User type
  onSave: (data: ProfileFormData) => Promise<void>
}

export function UserProfile({ user, onSave }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      title: user?.title || '',
      department: user?.department || '',
      bio: user?.bio || '',
      location: user?.location || '',
      birthDate: user?.birthDate || '',
    }
  })

  const handleFormSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    try {
      await onSave(data)
      setIsEditing(false)
      toast.success('Profil başarıyla güncellendi')
    } catch (error) {
      toast.error('Profil güncellenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır')
        return
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Sadece resim dosyaları yükleyebilirsiniz')
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getFullName = () => {
    const firstName = user?.firstName || ''
    const lastName = user?.lastName || ''
    return `${firstName} ${lastName}`.trim() || 'Kullanıcı'
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar
              src={avatarPreview || user?.avatar}
              fallback={getFullName().charAt(0).toUpperCase()}
              size="xl"
            />
            
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {getFullName()}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {user?.title || 'Kullanıcı'} {user?.department && `• ${user.department}`}
            </p>
            
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {user?.email || 'E-posta belirtilmemiş'}
              </div>
              {user?.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {user.phone}
                </div>
              )}
              {user?.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {user.location}
                </div>
              )}
            </div>
          </div>

          {/* Edit Button */}
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="btn-primary"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-2" />
                İptal
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Form */}
      {isEditing ? (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="card space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Profil Bilgilerini Düzenle
          </h3>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                Ad *
              </label>
              <Input
                {...register('firstName')}
                placeholder="Adınızı girin"
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">
                Soyad *
              </label>
              <Input
                {...register('lastName')}
                placeholder="Soyadınızı girin"
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                E-posta *
              </label>
              <Input
                type="email"
                {...register('email')}
                placeholder="E-posta adresinizi girin"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">
                Telefon
              </label>
              <Input
                type="tel"
                {...register('phone')}
                placeholder="Telefon numaranızı girin"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                Ünvan
              </label>
              <Input
                {...register('title')}
                placeholder="Ünvanınızı girin"
              />
            </div>

            <div>
              <label className="form-label">
                Departman
              </label>
              <Input
                {...register('department')}
                placeholder="Departmanınızı girin"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                Lokasyon
              </label>
              <Input
                {...register('location')}
                placeholder="Şehir, Ülke"
              />
            </div>

            <div>
              <label className="form-label">
                Doğum Tarihi
              </label>
              <Input
                type="date"
                {...register('birthDate')}
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="form-label">
              Hakkında
            </label>
            <Textarea
              {...register('bio')}
              placeholder="Kendinizden bahsedin..."
              rows={4}
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              İptal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? (
                <div className="spinner h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Kaydet
            </Button>
          </div>
        </form>
      ) : (
        /* Profile View */
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Profil Bilgileri
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tam Ad
                </label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {getFullName()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  E-posta
                </label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {user?.email || 'Belirtilmemiş'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Telefon
                </label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {user?.phone || 'Belirtilmemiş'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ünvan
                </label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {user?.title || 'Belirtilmemiş'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Departman
                </label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {user?.department || 'Belirtilmemiş'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lokasyon
                </label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {user?.location || 'Belirtilmemiş'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Doğum Tarihi
                </label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {user?.birthDate ? new Date(user.birthDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kayıt Tarihi
                </label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                </p>
              </div>
            </div>
          </div>

          {user?.bio && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hakkında
              </label>
              <p className="mt-2 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {user.bio}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
