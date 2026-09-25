INSERT INTO "VideoTemplate" (id, slug, name, description, config, "isPremium", "isActive", "createdAt", "updatedAt")
VALUES
  (
    '00000000-0000-4000-8000-000000000001',
    'classic',
    'Classic',
    'Clean centered lyrics on a simple background.',
    '{"family":"classic","defaultStyle":{"fontFamily":"Inter","fontSize":42,"textColor":"#FFFFFF","highlightColor":"#A78BFA","position":"bottom","animation":"fade","background":{"type":"solid","color":"#0a0a0a"}}}'::jsonb,
    false,
    true,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    'karaoke',
    'Karaoke',
    'Word-by-word highlight sync for sing-along.',
    '{"family":"karaoke","defaultStyle":{"fontFamily":"Inter","fontSize":48,"textColor":"#E4E4E7","highlightColor":"#FACC15","position":"center","animation":"karaoke-fill","background":{"type":"solid","color":"#18181b"}}}'::jsonb,
    false,
    true,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000003',
    'music-video-overlay',
    'Music Video Overlay',
    'Lyrics over your uploaded music video.',
    '{"family":"overlay","defaultStyle":{"fontFamily":"Inter","fontSize":40,"textColor":"#FFFFFF","highlightColor":"#22D3EE","position":"bottom","animation":"none","background":{"type":"video"}}}'::jsonb,
    false,
    true,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000010',
    'gospel-worship',
    'Gospel — Worship',
    'Calm typography, scripture-inspired visual style, slow lyric transitions.',
    '{"family":"gospel-worship","category":"gospel","tags":["Gospel","Worship"],"defaultStyle":{"fontFamily":"Georgia","fontSize":40,"textColor":"#F5F5F4","highlightColor":"#FDE68A","position":"center","animation":"fade-slow","background":{"type":"gradient","colors":["#1c1917","#292524"]}}}'::jsonb,
    false,
    true,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000011',
    'gospel-praise',
    'Gospel — Praise',
    'Energetic animated lyrics with beat-synchronized transitions.',
    '{"family":"gospel-praise","category":"gospel","tags":["Gospel","Praise"],"defaultStyle":{"fontFamily":"Inter","fontSize":46,"textColor":"#FFFFFF","highlightColor":"#F97316","position":"center","animation":"bounce-sync","background":{"type":"solid","color":"#0f172a"}}}'::jsonb,
    false,
    true,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000012',
    'gospel-choir',
    'Gospel — Choir',
    'Group/choir visual emphasis with synchronized lyric highlighting.',
    '{"family":"gospel-choir","category":"gospel","tags":["Gospel","Gospel Choir"],"defaultStyle":{"fontFamily":"Inter","fontSize":44,"textColor":"#E7E5E4","highlightColor":"#A78BFA","position":"center","animation":"karaoke-fill","background":{"type":"solid","color":"#1e1b4b"}}}'::jsonb,
    false,
    true,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000013',
    'gospel-music-video',
    'Gospel — Music Video',
    'Original music video background with synchronized lyrics overlay.',
    '{"family":"gospel-music-video","category":"gospel","tags":["Gospel"],"defaultStyle":{"fontFamily":"Inter","fontSize":38,"textColor":"#FFFFFF","highlightColor":"#34D399","position":"bottom","animation":"none","background":{"type":"video"}}}'::jsonb,
    false,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  config = EXCLUDED.config,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();
