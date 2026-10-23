CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE menu_categories (id text PRIMARY KEY, name text NOT NULL UNIQUE, sort_order integer NOT NULL);
CREATE TABLE menu_items (
  id text PRIMARY KEY, slug text NOT NULL UNIQUE, name text NOT NULL, description text NOT NULL,
  category_id text NOT NULL REFERENCES menu_categories(id), price_cents integer NOT NULL CHECK (price_cents >= 0),
  image text NOT NULL, dietary text[] NOT NULL DEFAULT '{}', allergens text[] NOT NULL DEFAULT '{}',
  popular boolean NOT NULL DEFAULT false, recommended boolean NOT NULL DEFAULT false,
  available boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0
);
CREATE TABLE modifier_groups (
  id text PRIMARY KEY, menu_item_id text NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name text NOT NULL, required boolean NOT NULL DEFAULT false,
  max_selections integer NOT NULL DEFAULT 1 CHECK (max_selections > 0), sort_order integer NOT NULL DEFAULT 0
);
CREATE TABLE modifier_options (
  id text PRIMARY KEY, group_id text NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
  name text NOT NULL, price_cents integer NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  available boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0
);
CREATE TABLE restaurant_settings (
  id text PRIMARY KEY DEFAULT 'primary', timezone text NOT NULL DEFAULT 'Europe/Paris',
  ordering_enabled boolean NOT NULL DEFAULT true, reservations_enabled boolean NOT NULL DEFAULT true,
  collection_lead_minutes integer NOT NULL DEFAULT 20, delivery_lead_minutes integer NOT NULL DEFAULT 40,
  delivery_fee_cents integer NOT NULL DEFAULT 390, delivery_postcodes text[] NOT NULL DEFAULT '{}',
  reservation_slot_minutes integer NOT NULL DEFAULT 30, reservation_capacity integer NOT NULL DEFAULT 24,
  max_party_size integer NOT NULL DEFAULT 8
);
CREATE TABLE opening_hours (
  id serial PRIMARY KEY, day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time time NOT NULL, close_time time NOT NULL, collection_enabled boolean NOT NULL DEFAULT true,
  delivery_enabled boolean NOT NULL DEFAULT true, reservations_enabled boolean NOT NULL DEFAULT true,
  CHECK (open_time < close_time)
);
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reference text NOT NULL UNIQUE, customer_name text NOT NULL,
  email text NOT NULL, phone text NOT NULL, fulfilment_mode text NOT NULL CHECK (fulfilment_mode IN ('COLLECTION','DELIVERY')),
  requested_date date NOT NULL, requested_time time NOT NULL, address_line text, postcode text, city text,
  delivery_notes text, subtotal_cents integer NOT NULL, fee_cents integer NOT NULL, total_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'PENDING', payment_mode text NOT NULL DEFAULT 'DEMO', created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (subtotal_cents >= 0 AND fee_cents >= 0 AND total_cents = subtotal_cents + fee_cents)
);
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id text NOT NULL REFERENCES menu_items(id), name_snapshot text NOT NULL,
  unit_price_cents integer NOT NULL, quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 20), notes text
);
CREATE TABLE order_item_modifiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_item_id uuid NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  modifier_option_id text NOT NULL REFERENCES modifier_options(id), group_name_snapshot text NOT NULL,
  option_name_snapshot text NOT NULL, price_cents integer NOT NULL
);
CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reference text NOT NULL UNIQUE, reservation_date date NOT NULL,
  reservation_time time NOT NULL, party_size integer NOT NULL CHECK (party_size BETWEEN 1 AND 20),
  customer_name text NOT NULL, email text NOT NULL, phone text NOT NULL, special_requests text,
  status text NOT NULL DEFAULT 'CONFIRMED', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX reservation_customer_slot_idx ON reservations(reservation_date, reservation_time, email);
CREATE INDEX reservations_slot_idx ON reservations(reservation_date, reservation_time, status);
CREATE INDEX orders_created_idx ON orders(created_at DESC);
CREATE INDEX menu_items_category_idx ON menu_items(category_id, sort_order);
