-- ============================================================
-- FitBoard / NOVOdrift — Supabase Schema
-- Run this once against the project database
-- ============================================================

-- === TABLES ===

CREATE TABLE IF NOT EXISTS fits (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  image_url    text NOT NULL,
  vibe_tags    text[] NOT NULL DEFAULT '{}',
  published    boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pins (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fit_id        uuid NOT NULL REFERENCES fits(id) ON DELETE CASCADE,
  x_percent     numeric(5,2) NOT NULL CHECK (x_percent >= 0 AND x_percent <= 100),
  y_percent     numeric(5,2) NOT NULL CHECK (y_percent >= 0 AND y_percent <= 100),
  product_name  text NOT NULL,
  brand         text,
  price         numeric(10,2) CHECK (price >= 0),
  affiliate_url text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  brand         text,
  category      text NOT NULL,
  price         numeric(10,2) CHECK (price >= 0),
  image_url     text,
  affiliate_url text NOT NULL,
  tags          text[] NOT NULL DEFAULT '{}',
  published     boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- === UPDATED_AT TRIGGER ===

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_fits ON fits;
CREATE TRIGGER set_updated_at_fits
  BEFORE UPDATE ON fits
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- === INDEXES ===

CREATE INDEX IF NOT EXISTS idx_fits_published    ON fits(published);
CREATE INDEX IF NOT EXISTS idx_fits_vibe_tags    ON fits USING GIN(vibe_tags);
CREATE INDEX IF NOT EXISTS idx_pins_fit_id       ON pins(fit_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_tags     ON products USING GIN(tags);

-- === ROW LEVEL SECURITY ===

ALTER TABLE fits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE pins     ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- fits: public read published only; authenticated full access
DROP POLICY IF EXISTS fits_public_read ON fits;
CREATE POLICY fits_public_read ON fits
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS fits_admin_all ON fits;
CREATE POLICY fits_admin_all ON fits
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- pins: public read all; authenticated full access
DROP POLICY IF EXISTS pins_public_read ON pins;
CREATE POLICY pins_public_read ON pins
  FOR SELECT USING (true);

DROP POLICY IF EXISTS pins_admin_all ON pins;
CREATE POLICY pins_admin_all ON pins
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- products: public read published only; authenticated full access
DROP POLICY IF EXISTS products_public_read ON products;
CREATE POLICY products_public_read ON products
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS products_admin_all ON products;
CREATE POLICY products_admin_all ON products
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
