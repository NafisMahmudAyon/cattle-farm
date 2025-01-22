CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Internal ID for your app
  clerk_user_id UUID NOT NULL UNIQUE, -- Clerk's user ID
  name VARCHAR(255) NOT NULL, -- User's name from Clerk
  first_name VARCHAR(255), -- User's name from Clerk
  last_name VARCHAR(255), -- User's name from Clerk
  email VARCHAR(255) NOT NULL UNIQUE, -- User's email from Clerk
  role VARCHAR(50) NOT NULL DEFAULT 'Worker', -- Default role: Worker
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Farm owner
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE farm_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- Roles: Owner, Manager, Worker
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (farm_id, user_id) -- Prevent duplicate user assignments to the same farm
);
CREATE TABLE cattle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  breed VARCHAR(255) NOT NULL,
  gender VARCHAR(10) NOT NULL, -- Male, Female
  dob DATE NOT NULL,
  purchase_date DATE,
  purchase_price NUMERIC(10, 2),
  status VARCHAR(50) DEFAULT 'Active', -- Active, Sold, Deceased
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE cattle_weight_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattle_id UUID REFERENCES cattle(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight NUMERIC(10, 2) NOT NULL
);
CREATE TABLE cattle_health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattle_id UUID REFERENCES cattle(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL, -- Vaccination, Treatment
  description TEXT NOT NULL
);
CREATE TABLE reproductive_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattle_id UUID REFERENCES cattle(id) ON DELETE CASCADE,
  breeding_date DATE,
  calving_date DATE,
  calf_id UUID REFERENCES cattle(id), -- Reference to the calf born
  calf_gender VARCHAR(10)
);
CREATE TABLE milk_production (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattle_id UUID REFERENCES cattle(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL -- Quantity in liters
);
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- Feed, Veterinary, Labor, Equipment, Utilities, etc.
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL, -- kg, bottle, etc.
  cost_per_unit NUMERIC(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  cattle_id UUID REFERENCES cattle(id) ON DELETE SET NULL, -- Nullable for product sales
  product_type VARCHAR(50) NOT NULL DEFAULT 'Cattle'; -- Defaulting to 'Cattle' for existing records
  buyer_name VARCHAR(255),
  sale_price NUMERIC(10, 2) NOT NULL,
  sale_date DATE NOT NULL,
  quantity NUMERIC(10, 2);
  COLUMN unit VARCHAR(50);
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- HealthCheck, InventoryLow, etc.
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
