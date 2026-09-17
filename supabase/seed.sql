-- Seed sample events
INSERT INTO events (title, slug, description, short_description, event_date, start_time, end_time, location, registration_required, registration_deadline)
VALUES
  (
    'Youth Fellowship Night',
    'youth-fellowship-night',
    'Join us for an exciting evening of worship, fellowship, and teaching. This is a great opportunity to connect with other young people in our community and grow in your faith.',
    'Weekly youth gathering with worship and teaching',
    CURRENT_DATE + INTERVAL '7 days',
    '18:00',
    '20:00',
    'TYM Community Center, Main Hall',
    true,
    CURRENT_DATE + INTERVAL '5 days'
  ),
  (
    'Sunday Service',
    'sunday-service',
    'Join us for our main worship gathering. We''ll experience powerful worship, hear God''s Word preached, and be challenged to grow deeper in our faith and commitment to Christ.',
    'Weekly worship and teaching service',
    CURRENT_DATE + INTERVAL '2 days',
    '09:00',
    '11:00',
    'TYM Main Sanctuary',
    false,
    NULL
  ),
  (
    'Discipleship Circle',
    'discipleship-circle',
    'A small group experience focused on biblical discipleship. We meet to study Scripture, pray, and encourage one another in our spiritual journey. Perfect for those wanting deeper growth.',
    'Small group biblical discipleship',
    CURRENT_DATE + INTERVAL '4 days',
    '19:00',
    '20:30',
    'TYM Community Center, Room B',
    true,
    CURRENT_DATE + INTERVAL '2 days'
  ),
  (
    'Leadership Development Conference',
    'leadership-conference-2026',
    'An intensive conference designed to equip young leaders with practical skills and biblical foundation for servant leadership. Learn from experienced leaders and network with peers.',
    'Three-day leadership training and development',
    CURRENT_DATE + INTERVAL '21 days',
    '08:00',
    '17:00',
    'TYM Event Center',
    true,
    CURRENT_DATE + INTERVAL '14 days'
  ),
  (
    'Worship Night',
    'worship-night',
    'An evening dedicated entirely to worship. Experience powerful music, prophetic ministry, and God''s presence in a focused worship atmosphere.',
    'Intimate worship gathering',
    CURRENT_DATE + INTERVAL '14 days',
    '19:00',
    '21:00',
    'TYM Main Sanctuary',
    false,
    NULL
  ),
  (
    'Community Outreach Day',
    'community-outreach-day',
    'Join us as we serve our community. We''ll be involved in practical ministry to those in need. This is a great way to put your faith into action.',
    'Hands-on community service',
    CURRENT_DATE + INTERVAL '10 days',
    '09:00',
    '13:00',
    'Multiple Community Locations',
    true,
    CURRENT_DATE + INTERVAL '8 days'
  )
ON CONFLICT (slug) DO NOTHING;

-- Seed sample media
INSERT INTO media (title, description, type, media_url, published)
SELECT seed.title, seed.description, seed.type, seed.media_url, seed.published
FROM (VALUES
  (
    'The Power of Transformation',
    'A powerful sermon about how God transforms us from the inside out.',
    'sermon',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    true
  ),
  (
    'Worship Service - Week 1',
    'Beautiful worship moments from our recent Sunday service.',
    'worship',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    true
  ),
  (
    'Leadership Principles from Scripture',
    'Teaching on biblical leadership principles for the next generation.',
    'teaching',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    true
  ),
  (
    'Youth Ministry Highlights',
    'Moments from recent youth events and gatherings.',
    'video',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    true
  )
) AS seed(title, description, type, media_url, published)
WHERE NOT EXISTS (
  SELECT 1
  FROM media
  WHERE media.title = seed.title
    AND media.media_url = seed.media_url
);
