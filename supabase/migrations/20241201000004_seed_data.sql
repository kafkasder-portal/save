-- Seed data for development and testing
-- This migration adds sample data to help with development

-- Sample conversations for testing
INSERT INTO conversations (id, title, description, type, created_by) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Genel Duyuru Kanalı',
    'Tüm ekip için genel duyuru kanalı',
    'group',
    '00000000-0000-0000-0000-000000000000'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Proje Geliştirme',
    'Yazılım geliştirme ekibi için kanal',
    'group',
    '00000000-0000-0000-0000-000000000000'
),
(
    '33333333-3333-3333-3333-333333333333',
    'Yönetim Kurulu',
    'Yönetim kurulu toplantıları ve kararları',
    'group',
    '00000000-0000-0000-0000-000000000000'
)
ON CONFLICT (id) DO NOTHING;

-- Sample meeting data
INSERT INTO meetings (id, title, description, start_date, end_date, location, meeting_type, status, organizer_id) VALUES
(
    '44444444-4444-4444-4444-444444444444',
    'Haftalık Takım Toplantısı',
    'Haftalık ilerleme durumu ve planlama toplantısı',
    '2024-12-02 10:00:00+03',
    '2024-12-02 11:30:00+03',
    'Toplantı Salonu A',
    'physical',
    'scheduled',
    '00000000-0000-0000-0000-000000000000'
),
(
    '55555555-5555-5555-5555-555555555555',
    'Proje Değerlendirme Toplantısı',
    'Q4 proje sonuçlarının değerlendirilmesi',
    '2024-12-05 14:00:00+03',
    '2024-12-05 16:00:00+03',
    'https://meet.google.com/abc-defg-hij',
    'online',
    'scheduled',
    '00000000-0000-0000-0000-000000000000'
),
(
    '66666666-6666-6666-6666-666666666666',
    'Yıllık Strategi Toplantısı',
    '2025 yılı stratejik planlarının belirlenmesi',
    '2024-12-10 09:00:00+03',
    '2024-12-10 17:00:00+03',
    'Konferans Salonu',
    'hybrid',
    'scheduled',
    '00000000-0000-0000-0000-000000000000'
)
ON CONFLICT (id) DO NOTHING;

-- Sample agenda items
INSERT INTO meeting_agenda_items (meeting_id, title, description, duration_minutes, order_index) VALUES
('44444444-4444-4444-4444-444444444444', 'Açılış ve Yoklama', 'Toplantının açılışı ve katılımcı kontrolü', 10, 1),
('44444444-4444-4444-4444-444444444444', 'Geçen Hafta Değerlendirmesi', 'Geçen haftaki hedeflerin gözden geçirilmesi', 20, 2),
('44444444-4444-4444-4444-444444444444', 'Bu Hafta Planları', 'Bu hafta için hedef ve görev dağılımı', 30, 3),
('44444444-4444-4444-4444-444444444444', 'Sorunlar ve Çözümler', 'Karşılaşılan sorunların tartışılması', 25, 4),
('44444444-4444-4444-4444-444444444444', 'Kapanış', 'Toplantının kapatılması ve bir sonraki toplantı tarihi', 5, 5),

('55555555-5555-5555-5555-555555555555', 'Proje Sonuçları Sunumu', 'Q4 projelerinin genel sonuçları', 45, 1),
('55555555-5555-5555-5555-555555555555', 'Performans Analizi', 'Proje performansının detaylı analizi', 30, 2),
('55555555-5555-5555-5555-555555555555', 'Öğrenilen Dersler', 'Projeden çıkarılan dersler ve iyileştirmeler', 25, 3),
('55555555-5555-5555-5555-555555555555', 'Gelecek Planları', '2025 Q1 proje planları', 20, 4)
ON CONFLICT DO NOTHING;

-- Sample tasks
INSERT INTO tasks (id, title, description, priority, status, assigned_by, due_date) VALUES
(
    '77777777-7777-7777-7777-777777777777',
    'Kullanıcı Arayüzü Güncellemesi',
    'Ana dashboard sayfasının yeniden tasarlanması ve modernize edilmesi',
    'high',
    'in_progress',
    '00000000-0000-0000-0000-000000000000',
    '2024-12-15 23:59:59+03'
),
(
    '88888888-8888-8888-8888-888888888888',
    'Veritabanı Optimizasyonu',
    'Sorgu performansının iyileştirilmesi ve indekslerin gözden geçirilmesi',
    'medium',
    'pending',
    '00000000-0000-0000-0000-000000000000',
    '2024-12-20 23:59:59+03'
),
(
    '99999999-9999-9999-9999-999999999999',
    'Test Senaryolarının Hazırlanması',
    'Yeni özellikler için otomatik test senaryolarının yazılması',
    'medium',
    'pending',
    '00000000-0000-0000-0000-000000000000',
    '2024-12-12 23:59:59+03'
),
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Güvenlik Açığı Taraması',
    'Sistemin güvenlik açıkları taranması ve raporlanması',
    'urgent',
    'pending',
    '00000000-0000-0000-0000-000000000000',
    '2024-12-08 23:59:59+03'
)
ON CONFLICT (id) DO NOTHING;

-- Sample task comments
INSERT INTO task_comments (task_id, user_id, content) VALUES
('77777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000000', 'Tasarım mockup''ları hazırlandı. İnceleme için paylaştım.'),
('77777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000000', 'Component yapısı güncellendi. React 18 özelliklerini kullanarak performans artırıldı.'),
('88888888-8888-8888-8888-888888888888', '00000000-0000-0000-0000-000000000000', 'Mevcut sorgu analizi tamamlandı. En yavaş sorgular belirlendi.'),
('99999999-9999-9999-9999-999999999999', '00000000-0000-0000-0000-000000000000', 'Test framework kurulumu tamamlandı. Örnek test dosyaları oluşturuldu.')
ON CONFLICT DO NOTHING;

-- Sample task activities
INSERT INTO task_activities (task_id, user_id, action, details) VALUES
('77777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000000', 'created', '{"message": "Görev oluşturuldu"}'),
('77777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000000', 'status_changed', '{"from": "pending", "to": "in_progress", "message": "Göreve başlandı"}'),
('88888888-8888-8888-8888-888888888888', '00000000-0000-0000-0000-000000000000', 'created', '{"message": "Görev oluşturuldu"}'),
('99999999-9999-9999-9999-999999999999', '00000000-0000-0000-0000-000000000000', 'created', '{"message": "Görev oluşturuldu"}'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'created', '{"message": "Acil görev oluşturuldu"}'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'priority_changed', '{"from": "high", "to": "urgent", "message": "Öncelik acil olarak güncellendi"}')
ON CONFLICT DO NOTHING;

-- Sample conversation participants (system admin participates in all conversations)
INSERT INTO conversation_participants (conversation_id, user_id, role) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'admin'),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'admin'),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'admin')
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- Sample messages
INSERT INTO internal_messages (conversation_id, sender_id, content, message_type) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'Herkese merhaba! Bu genel duyuru kanalı tüm ekip için önemli bildirimler paylaşmak amacıyla oluşturulmuştur.', 'text'),
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'Yeni proje yönetim sistemi aktif hale getirilmiştir. Tüm görevler artık bu sistemden takip edilecektir.', 'text'),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'Geliştirme ekibi için özel kanal oluşturuldu. Teknik konuları burada tartışabiliriz.', 'text'),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'Database migration scriptleri hazırlandı. Test ortamında deneme yapılması gerekiyor.', 'text'),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'Yönetim kurulu toplantı kanalına hoş geldiniz. Toplantı notları ve kararlar burada paylaşılacaktır.', 'text')
ON CONFLICT DO NOTHING;

-- Update conversations with last message timestamps
UPDATE conversations 
SET last_message_at = NOW() - INTERVAL '1 hour'
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE conversations 
SET last_message_at = NOW() - INTERVAL '30 minutes'
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE conversations 
SET last_message_at = NOW() - INTERVAL '2 hours'
WHERE id = '33333333-3333-3333-3333-333333333333';

-- Update conversation participants' last read timestamps
UPDATE conversation_participants 
SET last_read_at = NOW() - INTERVAL '5 minutes'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Sample meeting action items
INSERT INTO meeting_action_items (meeting_id, title, description, assigned_to, due_date, status) VALUES
('44444444-4444-4444-4444-444444444444', 'Haftalık rapor hazırlama', 'Geçen haftaki çalışmaların özetlenmesi', '00000000-0000-0000-0000-000000000000', '2024-12-03 17:00:00+03', 'pending'),
('44444444-4444-4444-4444-444444444444', 'Kod review sürecinin iyileştirilmesi', 'Mevcut kod review sürecinin gözden geçirilmesi ve iyileştirilmesi', '00000000-0000-0000-0000-000000000000', '2024-12-06 17:00:00+03', 'pending'),
('55555555-5555-5555-5555-555555555555', 'Q4 raporu finalizasyonu', 'Proje sonuçları raporunun tamamlanması', '00000000-0000-0000-0000-000000000000', '2024-12-08 17:00:00+03', 'pending')
ON CONFLICT DO NOTHING;

-- Sample meeting notes
INSERT INTO meeting_notes (meeting_id, content, created_by) VALUES
('44444444-4444-4444-4444-444444444444', 'Toplantı 10:00''da başladı. Tüm ekip üyeleri hazır bulundu.', '00000000-0000-0000-0000-000000000000'),
('44444444-4444-4444-4444-444444444444', 'Geçen haftaki hedeflerin %85''i tamamlandı. Başarılı bir hafta geçirildi.', '00000000-0000-0000-0000-000000000000'),
('55555555-5555-5555-5555-555555555555', 'Proje genel olarak başarılı tamamlandı. Müşteri memnuniyeti yüksek.', '00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;

-- Add meeting participants for sample meetings
INSERT INTO meeting_participants (meeting_id, user_id, role, response_status) VALUES
('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'organizer', 'accepted'),
('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'organizer', 'accepted'),
('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000000', 'organizer', 'accepted')
ON CONFLICT (meeting_id, user_id) DO NOTHING;
