-- ================================================
-- PLANSCAN — Initial Schema Migration
-- ================================================

-- ENUMS
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'operator');
CREATE TYPE plan_type AS ENUM ('starter', 'growth', 'pro');
CREATE TYPE field_status AS ENUM ('required', 'optional', 'hidden');
CREATE TYPE equipment_type AS ENUM ('gondola', 'geladeira', 'expositor', 'checkout', 'rack');

-- ================================================
-- COMPANIES (tenant root)
-- ================================================
CREATE TABLE companies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  logo_url    TEXT,
  plan        plan_type NOT NULL DEFAULT 'starter',
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin manages companies" ON companies
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
    )
  );

-- ================================================
-- PROFILES (admin users)
-- ================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id  UUID REFERENCES companies(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'admin',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Superadmin reads all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'superadmin')
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', new.email), new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ================================================
-- STORES
-- ================================================
CREATE TABLE stores (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  address      TEXT,
  city         TEXT,
  manager_name TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin reads own company stores" ON stores
  FOR SELECT USING (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin inserts stores" ON stores
  FOR INSERT WITH CHECK (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin updates own stores" ON stores
  FOR UPDATE USING (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin deletes own stores" ON stores
  FOR DELETE USING (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- ================================================
-- EQUIPMENT
-- ================================================
CREATE TABLE equipment (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id   UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  type       equipment_type NOT NULL DEFAULT 'gondola',
  qr_token   UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  active     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin reads own equipment" ON equipment
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM stores
      WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Public reads active equipment by qr_token" ON equipment
  FOR SELECT USING (active = true);

CREATE POLICY "Admin inserts equipment" ON equipment
  FOR INSERT WITH CHECK (
    store_id IN (
      SELECT id FROM stores
      WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admin updates equipment" ON equipment
  FOR UPDATE USING (
    store_id IN (
      SELECT id FROM stores
      WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ================================================
-- PLANOGRAMS
-- ================================================
CREATE TABLE planograms (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id   UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  image_url      TEXT NOT NULL,
  instructions   TEXT,
  capacity_boxes INTEGER,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE planograms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads planograms" ON planograms FOR SELECT USING (true);

CREATE POLICY "Admin manages planograms" ON planograms
  FOR ALL USING (
    equipment_id IN (
      SELECT e.id FROM equipment e
      JOIN stores s ON s.id = e.store_id
      WHERE s.company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ================================================
-- NEGOTIATIONS
-- ================================================
CREATE TABLE negotiations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  sku          TEXT NOT NULL,
  product_name TEXT NOT NULL,
  faces        INTEGER NOT NULL DEFAULT 1,
  position     TEXT,
  valid_until  DATE
);

ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads negotiations" ON negotiations FOR SELECT USING (true);

CREATE POLICY "Admin manages negotiations" ON negotiations
  FOR ALL USING (
    equipment_id IN (
      SELECT e.id FROM equipment e
      JOIN stores s ON s.id = e.store_id
      WHERE s.company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ================================================
-- FIELD CONFIGS
-- ================================================
CREATE TABLE field_configs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  field_name  TEXT NOT NULL,
  status      field_status NOT NULL DEFAULT 'required',
  UNIQUE(company_id, field_name)
);

ALTER TABLE field_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads field_configs" ON field_configs FOR SELECT USING (true);

CREATE POLICY "Admin manages field_configs" ON field_configs
  FOR ALL USING (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- ================================================
-- EXECUTIONS
-- ================================================
CREATE TABLE executions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id   UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  promoter_name  TEXT NOT NULL,
  badge          TEXT,
  photo_url      TEXT,
  conformity     BOOLEAN NOT NULL DEFAULT false,
  notes          TEXT,
  confirmed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  xp_earned      INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public inserts executions" ON executions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin reads own executions" ON executions
  FOR SELECT USING (
    equipment_id IN (
      SELECT e.id FROM equipment e
      JOIN stores s ON s.id = e.store_id
      WHERE s.company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ================================================
-- EXECUTION ITEMS
-- ================================================
CREATE TABLE execution_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id    UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
  product_name    TEXT NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 0,
  expiry_date     DATE,
  price           DECIMAL(10,2),
  price_photo_url TEXT
);

ALTER TABLE execution_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public inserts execution_items" ON execution_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin reads own execution_items" ON execution_items
  FOR SELECT USING (
    execution_id IN (
      SELECT ex.id FROM executions ex
      JOIN equipment e ON e.id = ex.equipment_id
      JOIN stores s ON s.id = e.store_id
      WHERE s.company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ================================================
-- STORAGE BUCKETS (run in Supabase Dashboard)
-- ================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('planogram-files', 'planogram-files', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('execution-photos', 'execution-photos', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true);

-- Storage policies for execution-photos
CREATE POLICY "Public upload execution photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'execution-photos');

CREATE POLICY "Auth reads execution photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'execution-photos');

-- Storage policies for planogram-files
CREATE POLICY "Auth upload planograms" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'planogram-files');

CREATE POLICY "Public reads planograms" ON storage.objects
  FOR SELECT USING (bucket_id = 'planogram-files');

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX idx_equipment_qr_token ON equipment(qr_token);
CREATE INDEX idx_stores_company_id ON stores(company_id);
CREATE INDEX idx_equipment_store_id ON equipment(store_id);
CREATE INDEX idx_executions_equipment_id ON executions(equipment_id);
CREATE INDEX idx_executions_confirmed_at ON executions(confirmed_at DESC);
CREATE INDEX idx_field_configs_company_id ON field_configs(company_id);
