# Veritabanı Migration Dosyaları

Bu klasör Supabase veritabanına uygulanması gereken SQL migration dosyalarını içerir.

## 🚀 Migration Dosyalarını Uygulama

### Yöntem 1: Supabase Dashboard (Önerilen)
1. [Supabase Dashboard](https://supabase.com/dashboard)'a gidin
2. Projenizi seçin
3. Sol menüden **SQL Editor**'ı açın
4. **New Query** butonuna tıklayın
5. Migration dosyalarını sırasıyla kopyalayıp çalıştırın:

### Yöntem 2: Supabase CLI
```bash
# CLI kurulumu (eğer kurulu değilse)
npm install -g supabase

# Projeye login
supabase login

# Migration dosyalarını sırasıyla uygula
supabase db push

# Veya manuel olarak
psql -h your-host -p 5432 -U postgres -d postgres -f migrations/001_meetings_module.sql
```

## 📋 Migration Sırası

Migration dosyalarını **mutlaka sırasıyla** uygulayın:

1. **001_meetings_module.sql** - Toplantı planlama modülü
   - `meetings` tablosu
   - `meeting_participants` tablosu  
   - `meeting_agenda_items` tablosu
   - `meeting_notes` tablosu
   - `meeting_action_items` tablosu

2. **002_tasks_module.sql** - Görev yönetimi modülü
   - `tasks` tablosu
   - `task_comments` tablosu
   - `task_attachments` tablosu
   - `task_activities` tablosu

3. **003_messages_module.sql** - Mesajlaşma modülü
   - `conversations` tablosu
   - `conversation_participants` tablosu
   - `internal_messages` tablosu
   - `message_reactions` tablosu
   - `message_notifications` tablosu

4. **004_uploads_storage.sql** - Dosya yükleme ve depolama
   - Storage bucket'ları
   - `students` tablosu
   - `student_documents` tablosu

## ⚠️ Önemli Notlar

- Migration dosyaları `IF NOT EXISTS` kontrolleri içerir, tekrar çalıştırılabilir
- RLS (Row Level Security) politikaları otomatik olarak uygulanır
- Storage bucket'ları ve policy'ler dahil edilmiştir
- Tüm tablolar için uygun indeksler oluşturulur

## 🔐 Güvenlik

- Tüm tablolar RLS ile korunmuştur
- Kullanıcılar sadece kendi verilerine erişebilir
- File upload için güvenlik policy'leri mevcuttur

## ✅ Migration Başarılı mı Kontrol Et

Migration sonrası kontrol için:

```sql
-- Tabloları listele
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- RLS durumunu kontrol et
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- Storage bucket'ları kontrol et
SELECT * FROM storage.buckets;
```

## 🐛 Sorun Giderme

### Hata: "permission denied for schema auth"
```sql
-- Admin olarak çalıştır:
GRANT USAGE ON SCHEMA auth TO postgres;
```

### Hata: "relation already exists"
- Normal bir durum, migration devam edecek
- `IF NOT EXISTS` kullanıldığı için güvenli

### Hata: Storage bucket oluşturulamıyor
- Supabase Dashboard'dan Storage sekmesinde manuel oluştur
- Bucket isimleri: `uploads`, `message-files`, `student-documents`, `task-attachments`

## 📞 Destek

Migration ile ilgili sorunlar için:
1. Supabase loglarını kontrol edin
2. SQL Editor'da hata mesajlarını inceleyin  
3. Gerekirse tabloları DROP edip tekrar oluşturun

**Migration tamamlandıktan sonra uygulama tam olarak çalışacaktır!** 🎉
