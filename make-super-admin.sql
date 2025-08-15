-- Mevcut giriş yapmış kullanıcıyı SUPER ADMIN yapma script'i
-- Bu script mevcut oturumdaki kullanıcıyı otomatik olarak super admin yapar
-- Supabase SQL Editor'da çalıştırın

DO $$
DECLARE
    current_user_id UUID;
    current_user_email TEXT;
    old_role TEXT;
BEGIN
    -- Mevcut auth context'ten kullanıcı ID'sini al
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE NOTICE 'HATA: Giriş yapmış kullanıcı bulunamadı.';
        RAISE NOTICE 'Lütfen önce Supabase Dashboard''a giriş yapın.';
        RETURN;
    END IF;
    
    -- Kullanıcının email adresini al
    SELECT email INTO current_user_email
    FROM auth.users 
    WHERE id = current_user_id;
    
    -- Mevcut rolü al
    SELECT role INTO old_role
    FROM user_profiles 
    WHERE id = current_user_id;
    
    -- Kullanıcı profilini güncelle veya oluştur
    INSERT INTO user_profiles (id, full_name, email, role, is_active, created_at, updated_at)
    SELECT 
        current_user_id,
        COALESCE(u.raw_user_meta_data->>'full_name', 'Super Administrator') as full_name,
        u.email,
        'super_admin' as role,
        true as is_active,
        NOW(),
        NOW()
    FROM auth.users u
    WHERE u.id = current_user_id
    ON CONFLICT (id) DO UPDATE SET
        role = 'super_admin',
        is_active = true,
        updated_at = NOW();
    
    -- Rol değişiklik logunu ekle
    INSERT INTO role_change_logs (target_user_id, changed_by, old_role, new_role, reason, created_at)
    VALUES (
        current_user_id,
        current_user_id,
        COALESCE(old_role, 'viewer'),
        'super_admin',
        'Self-promotion to super admin - full system access granted',
        NOW()
    );
    
    RAISE NOTICE '🎉 BAŞARILI: % hesabı SUPER ADMIN rolüne atandı!', current_user_email;
    RAISE NOTICE '✅ Kullanıcı ID: %', current_user_id;
    RAISE NOTICE '🔑 Yeni Rol: super_admin (TÜM YETKİLER)';
    RAISE NOTICE '📧 Email: %', current_user_email;
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Artık şunları yapabilirsiniz:';
    RAISE NOTICE '   • Tüm kullanıcıları yönetebilirsiniz';
    RAISE NOTICE '   • Sistem ayarlarını değiştirebilirsiniz';
    RAISE NOTICE '   • Tüm modüllere erişebilirsiniz';
    RAISE NOTICE '   • Diğer kullanıcılara rol atayabilirsiniz';
    RAISE NOTICE '   • Sistem loglarını görüntüleyebilirsiniz';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Uygulamayı yenileyin veya tekrar giriş yapın.';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'HATA: %', SQLERRM;
        RAISE NOTICE 'Lütfen database yapılarının doğru kurulduğundan emin olun.';
END $$;

-- Sonuçları kontrol et
SELECT 
    'KONTROL: Kullanıcı Bilgileri' as info,
    u.email,
    up.full_name,
    up.role,
    up.is_active,
    up.created_at,
    up.updated_at
FROM auth.users u
LEFT JOIN user_profiles up ON up.id = u.id
WHERE u.id = auth.uid();

-- Yetkileri kontrol et
SELECT 
    'KONTROL: Yetki Durumu' as info,
    CASE 
        WHEN up.role = 'super_admin' THEN '🎉 SUPER ADMIN - Tüm yetkiler aktif'
        WHEN up.role = 'admin' THEN '👑 ADMIN - Yüksek yetkiler'
        WHEN up.role IS NULL THEN '❌ Profil bulunamadı'
        ELSE '⚠️ Düşük yetki: ' || up.role
    END as yetki_durumu,
    up.role as mevcut_rol
FROM user_profiles up
WHERE up.id = auth.uid();