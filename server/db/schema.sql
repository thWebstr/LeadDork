-- Saved leads
CREATE TABLE leads (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255),
  linkedin_url TEXT NOT NULL UNIQUE,
  title       VARCHAR(255),
  company     VARCHAR(255),
  location    VARCHAR(255),
  notes       TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Tags available for labelling leads
CREATE TABLE tags (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(100) UNIQUE NOT NULL
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
  raw_query        TEXT NOT NULL,
  generated_dorks  JSONB,
  created_at       TIMESTAMP DEFAULT NOW()
);
