--! Previous: -
--! Hash: sha1:fe7a6a79f00f22eded7d112f69580576496d3e1a

-- Enter migration here
--! Previous: -
--! Hash: sha1:3ba78fab68bbaade9b8fe0fdd612aed0b3a50747

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY NOT NULL,
    email VARCHAR (128) NOT NULL UNIQUE,
    username VARCHAR (16) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY NOT NULL,
    accounts_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    body TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts_favorites_posts (
    id UUID PRIMARY KEY NOT NULL,
    accounts_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    posts_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT unique_accounts_favorites_posts UNIQUE(accounts_id, posts_id)
);
