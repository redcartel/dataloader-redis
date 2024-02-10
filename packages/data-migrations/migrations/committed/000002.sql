--! Previous: sha1:fe7a6a79f00f22eded7d112f69580576496d3e1a
--! Hash: sha1:e9049dbac1d0371472494f9626caa2d637e0f1b9

-- Enter migration here
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

ALTER TABLE accounts ADD COLUMN "created_at" TIMESTAMP DEFAULT now();
ALTER TABLE posts ADD COLUMN "created_at" TIMESTAMP DEFAULT now();
ALTER TABLE accounts_favorites_posts ADD COLUMN "created_at" TIMESTAMP DEFAULT now();

ALTER TABLE accounts ADD COLUMN "updated_at" TIMESTAMP DEFAULT now();
ALTER TABLE posts ADD COLUMN "updated_at" TIMESTAMP DEFAULT now();
ALTER TABLE accounts_favorites_posts ADD COLUMN "updated_at" TIMESTAMP DEFAULT now();

DROP TRIGGER IF EXISTS auto_updated_at ON accounts;
DROP TRIGGER IF EXISTS auto_updated_at ON posts;
DROP TRIGGER IF EXISTS auto_updated_at ON accounts_favorites_posts;

CREATE TRIGGER auto_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE PROCEDURE  update_modified_column();
CREATE TRIGGER auto_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE PROCEDURE  update_modified_column();
CREATE TRIGGER auto_updated_at BEFORE UPDATE ON accounts_favorites_posts FOR EACH ROW EXECUTE PROCEDURE  update_modified_column();
