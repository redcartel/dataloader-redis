--! Previous: sha1:e9049dbac1d0371472494f9626caa2d637e0f1b9
--! Hash: sha1:839e5f685c11a167e5092c0ba4394914dba1dc45

-- Enter migration here

ALTER TABLE accounts ADD COLUMN password VARCHAR(72)
