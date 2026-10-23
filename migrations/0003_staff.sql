CREATE TABLE staff_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('ADMIN','STAFF')),
  password_hash text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE staff_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX staff_sessions_expiry_idx ON staff_sessions(expires_at);

ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('PENDING','ACCEPTED','PREPARING','READY','COMPLETED','CANCELLED'));
ALTER TABLE reservations ADD CONSTRAINT reservations_status_check CHECK (status IN ('PENDING','CONFIRMED','CANCELLED'));
