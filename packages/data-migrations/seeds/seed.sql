DELETE FROM accounts WHERE id = '018d83be-6893-7e0d-97dd-3bf475f6c3da';
DELETE FROM accounts WHERE id = '018d83be-bbbe-71fe-b466-1fb1d1677377';

INSERT INTO accounts (id, email, username, password) VALUES
-- pw: password
    ('018d83be-6893-7e0d-97dd-3bf475f6c3da', 'carteradams@gmail.com', 'redcartel', '$2b$10$MJ1u5YupA3dzszCcvf70GOhPXWlonIZdFLeCded1TYQltFhcJqaZ2'),
-- pw: 12345
    ('018d83be-bbbe-71fe-b466-1fb1d1677377', 'carteradams+test@gmail.com', 'testuser', '$2b$10$/SZEpAjr.961ZOjig3mpeuuKgk2G6ZnDw/phM1ZDDS8Ts8G07onve');

INSERT INTO posts (id, accounts_id, body) VALUES
    ('018d83c7-6b66-799b-8aec-8be520520c7d', '018d83be-6893-7e0d-97dd-3bf475f6c3da', 'First post!'),
    ('018d83c7-c0e4-7ea0-930b-42cd1c16ba49', '018d83be-6893-7e0d-97dd-3bf475f6c3da', 'Second post!'),
    ('018d83c7-f6fa-75ef-90b8-c7050577326f', '018d83be-bbbe-71fe-b466-1fb1d1677377', 'Test Post!');

INSERT INTO accounts_favorites_posts (id, accounts_id, posts_id) VALUES
    ('018d83cb-9453-717d-8d53-83ce264b8526', '018d83be-6893-7e0d-97dd-3bf475f6c3da', '018d83c7-6b66-799b-8aec-8be520520c7d'),
    ('018d83cb-ce97-7161-8cbb-a2aa66e1e052', '018d83be-6893-7e0d-97dd-3bf475f6c3da', '018d83c7-f6fa-75ef-90b8-c7050577326f'),
    ('018d83cb-ee12-774c-9dd3-3cc8c82e74b4', '018d83be-bbbe-71fe-b466-1fb1d1677377', '018d83c7-6b66-799b-8aec-8be520520c7d');