-- Users for authentication
CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(255),
  email        VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role         VARCHAR(100),
  avatar_url   TEXT,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Saved leads
CREATE TABLE leads (
  id           SERIAL PRIMARY KEY,
  user_id      INT REFERENCES users(id) ON DELETE CASCADE,
  name         VARCHAR(255),
  linkedin_url TEXT NOT NULL,
  title        VARCHAR(255),
  company      VARCHAR(255),
  location     VARCHAR(255),
  notes        TEXT,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, linkedin_url)
);

-- Tags available for labelling leads
CREATE TABLE tags (
  id      SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name    VARCHAR(100) NOT NULL,
  UNIQUE(user_id, name)
);

-- Many-to-many: leads <-> tags
CREATE TABLE lead_tags (
  lead_id  INT REFERENCES leads(id) ON DELETE CASCADE,
  tag_id   INT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (lead_id, tag_id)
);

-- Record of every AI search performed
CREATE TABLE search_history (
  id               SERIAL PRIMARY KEY,
  user_id          INT REFERENCES users(id) ON DELETE CASCADE,
  raw_query        TEXT NOT NULL,
  generated_dorks  JSONB,
  created_at       TIMESTAMP DEFAULT NOW()
);
