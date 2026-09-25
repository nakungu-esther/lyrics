-- East African launch languages (run after migration)
INSERT INTO "Language" (code, name, "isActive") VALUES
  ('lg',  'Luganda',    true),
  ('en',  'English',    true),
  ('nyn', 'Runyankole', true),
  ('xog', 'Lusoga',     true),
  ('ach', 'Acholi',     true),
  ('xlu', 'Lugisu',     true),
  ('lwg', 'Lugwere',    true),
  ('sw',  'Swahili',    true)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, "isActive" = EXCLUDED."isActive";
