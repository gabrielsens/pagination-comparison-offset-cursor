DROP DATABASE IF EXISTS pagination;
CREATE DATABASE pagination;

\c pagination

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE system_sumary(
  entity VARCHAR(100) PRIMARY KEY,
  total_count INTEGER DEFAULT 0
);

-- Seeds
INSERT INTO system_sumary(entity) VALUES('posts');
INSERT INTO system_sumary(entity) VALUES('posts_cursor');

CREATE TABLE posts(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255),
  content TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seeds (População de dados)
DO $$
  DECLARE
   i INTEGER;

  BEGIN
    FOR i IN 1..100 LOOP
      INSERT INTO posts(title, content) VALUES ('POST ' || i, 'Conteudo do post ' || i);
      UPDATE system_sumary SET total_count = total_count + 1 WHERE entity = 'posts';
    END LOOP;
END $$;

-- Cursor Based
CREATE TABLE posts_cursor(
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  content TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seeds (População de dados)
DO $$
  DECLARE
   i INTEGER;

  BEGIN
    FOR i IN 1..100 LOOP
      INSERT INTO posts_cursor(title, content) VALUES ('POST CURSOR ' || i, 'Conteudo do post cursor ' || i);
      UPDATE system_sumary SET total_count = total_count + 1 WHERE entity = 'posts_cursor';
    END LOOP;
END $$;

-- Functions
CREATE FUNCTION update_posts_total_count() RETURNS TRIGGER AS $$
  BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE system_sumary SET total_count = total_count + 1 WHERE entity = 'posts';
  END IF;
  IF TG_OP = 'DELETE' THEN
    UPDATE system_sumary SET total_count = total_count - 1 WHERE entity = 'posts';
  END IF;
  RETURN NULL;
  END;
$$ LANGUAGE plpgsql;

-- Trggers
CREATE TRIGGER update_posts_total_count
AFTER INSERT OR DELETE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_posts_total_count();
