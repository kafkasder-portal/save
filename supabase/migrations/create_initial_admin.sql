-- Setup initial system configuration
-- This script sets up triggers and permissions for the system

-- Grant permissions to ensure authenticated users can access tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant basic read access to anon role for public data
GRANT SELECT ON user_profiles TO anon;
GRANT SELECT ON beneficiaries TO anon;
GRANT SELECT ON applications TO anon;
GRANT SELECT ON aid_records TO anon;
GRANT SELECT ON meetings TO anon;
GRANT SELECT ON tasks TO anon;
GRANT SELECT ON documents TO anon;

-- Create a function to update user profile after auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create sample beneficiary data (not tied to specific users)
INSERT INTO beneficiaries (
  id,
  full_name,
  identity_number,
  date_of_birth,
  gender,
  phone,
  email,
  address,
  city,
  district,
  category,
  priority_level,
  notes
) VALUES (
  gen_random_uuid(),
  'Ahmet Yılmaz',
  '12345678901',
  '1980-05-15',
  'male',
  '+90 555 123 4567',
  'ahmet.yilmaz@email.com',
  'Atatürk Mahallesi, 123. Sokak No:45',
  'İstanbul',
  'Kadıköy',
  'unemployed',
  'high',
  'Needs urgent financial assistance for family'
) ON CONFLICT DO NOTHING;

INSERT INTO beneficiaries (
  id,
  full_name,
  identity_number,
  date_of_birth,
  gender,
  phone,
  email,
  address,
  city,
  district,
  category,
  priority_level,
  notes
) VALUES (
  gen_random_uuid(),
  'Fatma Demir',
  '98765432109',
  '1975-08-22',
  'female',
  '+90 555 987 6543',
  'fatma.demir@email.com',
  'Cumhuriyet Mahallesi, 67. Sokak No:12',
  'Ankara',
  'Çankaya',
  'elderly',
  'medium',
  'Requires medical assistance and support'
) ON CONFLICT DO NOTHING;

-- Create sample application data
INSERT INTO applications (
  id,
  beneficiary_id,
  application_type,
  title,
  description,
  requested_amount,
  status,
  priority_level
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM beneficiaries WHERE full_name = 'Ahmet Yılmaz' LIMIT 1),
  'financial_aid',
  'Emergency Financial Assistance',
  'Request for emergency financial aid to cover basic living expenses',
  2500.00,
  'pending',
  'high'
) ON CONFLICT DO NOTHING;

INSERT INTO applications (
  id,
  beneficiary_id,
  application_type,
  title,
  description,
  requested_amount,
  status,
  priority_level
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM beneficiaries WHERE full_name = 'Fatma Demir' LIMIT 1),
  'medical_aid',
  'Medical Equipment Support',
  'Request for medical equipment and healthcare support',
  1800.00,
  'under_review',
  'medium'
) ON CONFLICT DO NOTHING;

COMMIT;