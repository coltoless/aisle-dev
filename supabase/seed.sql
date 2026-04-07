-- Seed file for local development only.
-- Creates a test couple with a full wedding profile, checklist, and budget.
-- Run with: pnpm supabase db reset (loads seed) or pnpm supabase db seed --db-url <uri>

-- NOTE: Inserts into auth.users — use only on local or a dedicated dev database.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  test_user_id   uuid := '00000000-0000-0000-0000-000000000001';
  test_couple_id uuid;
  wedding_date date := (CURRENT_DATE + INTERVAL '14 months')::date;
BEGIN

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_sso_user,
    is_anonymous
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    test_user_id,
    'authenticated',
    'authenticated',
    'test@aisle.dev',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    false
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO couples (user_id, partner1_name, partner2_name, email)
  VALUES (test_user_id, 'Alex', 'Jordan', 'test@aisle.dev')
  RETURNING id INTO test_couple_id;

  INSERT INTO wedding_profiles (
    couple_id, wedding_date, location_city, location_state,
    guest_count_range, budget_range, budget_exact,
    style_tags, priorities, onboarding_complete
  )
  VALUES (
    test_couple_id,
    wedding_date,
    'Nashville', 'TN',
    '100_150',
    '50k_75k',
    65000 * 100,
    ARRAY['romantic_classic', 'party_forward'],
    ARRAY['venue', 'photography', 'music_entertainment'],
    true
  );

  INSERT INTO budget_items (couple_id, category, category_label, estimated_cost, sort_order) VALUES
    (test_couple_id, 'venue',                'Venue',                    1820000, 1),
    (test_couple_id, 'catering_bar',         'Catering & Bar',           1430000, 2),
    (test_couple_id, 'photography',          'Photography',               650000, 3),
    (test_couple_id, 'videography',          'Videography',               390000, 4),
    (test_couple_id, 'florals_decor',        'Florals & Décor',           520000, 5),
    (test_couple_id, 'music_entertainment',  'Music & Entertainment',     390000, 6),
    (test_couple_id, 'officiant',            'Officiant',                  65000, 7),
    (test_couple_id, 'attire_partner1',      'Attire — Partner 1',        260000, 8),
    (test_couple_id, 'attire_partner2',      'Attire — Partner 2',        130000, 9),
    (test_couple_id, 'hair_makeup',          'Hair & Makeup',             195000, 10),
    (test_couple_id, 'invitations_stationery','Invitations & Stationery', 130000, 11),
    (test_couple_id, 'transportation',       'Transportation',            130000, 12),
    (test_couple_id, 'accommodations',       'Accommodations',             65000, 13),
    (test_couple_id, 'wedding_cake',         'Wedding Cake & Desserts',   130000, 14),
    (test_couple_id, 'favors_gifts',         'Favors & Gifts',             65000, 15),
    (test_couple_id, 'honeymoon',            'Honeymoon',                      0, 16),
    (test_couple_id, 'miscellaneous_buffer', 'Miscellaneous / Buffer',    130000, 17);

  INSERT INTO checklist_items (couple_id, title, category, phase, notes, sort_order) VALUES
    (test_couple_id, 'Set your wedding date',                     'admin',        '12_plus_months', 'Consider day of week, season, and holiday conflicts.', 1),
    (test_couple_id, 'Establish your total wedding budget',       'admin',        '12_plus_months', 'Include family contributions and savings. Be honest.', 2),
    (test_couple_id, 'Draft your initial guest list',             'guests',       '12_plus_months', 'Guest count drives nearly every other cost.', 3),
    (test_couple_id, 'Book your ceremony and reception venue',    'venue',        '12_plus_months', 'Popular venues book 12–18 months out.', 4),
    (test_couple_id, 'Book your photographer',                    'vendors',      '12_plus_months', 'Top photographers book out 12–18 months. Do not wait.', 5),
    (test_couple_id, 'Book your videographer',                    'vendors',      '12_plus_months', 'Often booked alongside the photographer.', 6),
    (test_couple_id, 'Secure your officiant',                     'vendors',      '12_plus_months', 'Confirm they are available on your date now.', 7),
    (test_couple_id, 'Create your wedding website',               'guests',       '12_plus_months', 'Include your date, location, and registry link.', 8),
    (test_couple_id, 'Start your wedding registry',               'guests',       '12_plus_months', 'Include a range of price points.', 9),
    (test_couple_id, 'Book your caterer (if not venue-provided)', 'vendors',      '9_12_months',    'If venue provides catering, schedule your tasting instead.', 10),
    (test_couple_id, 'Book your florist',                         'vendors',      '9_12_months',    'Bring inspo photos. Discuss what is in season.', 11),
    (test_couple_id, 'Book your DJ or band',                      'vendors',      '9_12_months',    'Good DJs and bands book fast.', 12),
    (test_couple_id, 'Send save-the-dates',                       'guests',       '9_12_months',    'Send 9–12 months out for destination weddings.', 13),
    (test_couple_id, 'Start shopping for wedding attire (Partner 1)', 'attire',   '9_12_months',    'Dresses take 4–6 months to order plus 2–3 months for alterations.', 14),
    (test_couple_id, 'Start shopping for wedding attire (Partner 2)', 'attire',   '9_12_months',    NULL, 15),
    (test_couple_id, 'Reserve hotel room blocks for guests',      'logistics',    '9_12_months',    'Negotiate a group rate.', 16),
    (test_couple_id, 'Begin planning the rehearsal dinner',       'logistics',    '9_12_months',    'Book the venue early.', 17),
    (test_couple_id, 'Book hair and makeup artist(s)',            'vendors',      '6_9_months',     'Book your trial for a date when you will be going out.', 18),
    (test_couple_id, 'Design and order wedding invitations',      'admin',        '6_9_months',     'Order extras (10% overage). Weigh a complete suite before buying postage.', 19),
    (test_couple_id, 'Book your honeymoon',                       'travel',       '6_9_months',     'Book flights and hotels now. Consider travel insurance.', 20),
    (test_couple_id, 'Outline your ceremony structure',           'ceremony',     '6_9_months',     'Processional, readings, vows, ring exchange, recessional.', 21),
    (test_couple_id, 'Book guest and wedding party transportation','logistics',   '6_9_months',     'Shuttles from hotel to venue are a guest experience win.', 22),
    (test_couple_id, 'Book your wedding cake or desserts',        'food_beverage','6_9_months',     'Schedule a tasting. Confirm the venue cake cutting fee.', 23),
    (test_couple_id, 'Mail wedding invitations',                  'guests',       '3_6_months',     'Send 6–8 weeks before. Include RSVP deadline 3–4 weeks out.', 24),
    (test_couple_id, 'Finalize catering menu and bar selections', 'food_beverage','3_6_months',     'Confirm dietary restrictions. Lock in headcount estimate.', 25),
    (test_couple_id, 'Write your vows',                           'ceremony',     '3_6_months',     'Give yourself more time than you think you need.', 26),
    (test_couple_id, 'Purchase wedding rings',                    'attire',       '3_6_months',     'Budget 4–6 weeks for custom or resizing orders.', 27),
    (test_couple_id, 'Finalize décor plan and rental orders',     'decor',        '3_6_months',     'Confirm all rentals in writing.', 28),
    (test_couple_id, 'Research marriage license requirements',    'legal',        '3_6_months',     'Requirements vary by state. Most licenses valid 30–60 days.', 29),
    (test_couple_id, 'Schedule the wedding rehearsal',            'ceremony',     '3_6_months',     'Typically the evening before. Confirm venue access time.', 30),
    (test_couple_id, 'Finalize guest list and RSVP tracking',     'guests',       '1_3_months',     'Follow up with non-responders 1 week after your RSVP deadline.', 31),
    (test_couple_id, 'Create seating chart',                      'guests',       '1_3_months',     'Do not start until RSVPs are mostly in.', 32),
    (test_couple_id, 'Build the day-of timeline',                 'logistics',    '1_3_months',     'Work backwards from ceremony start time.', 33),
    (test_couple_id, 'Complete attire alterations and final fitting', 'attire',   '1_3_months',     'Final fitting 2–3 weeks before the wedding.', 34),
    (test_couple_id, 'Obtain marriage license',                   'legal',        '1_3_months',     'Check your county clerk website for exact requirements.', 35),
    (test_couple_id, 'Finalize music requests with DJ/band',      'vendors',      '1_3_months',     'Must-plays, first dance, parent dances, do-not-plays.', 36),
    (test_couple_id, 'Order day-of stationery and signage',       'decor',        '1_3_months',     'Menus, programs, escort cards, table numbers, signs.', 37),
    (test_couple_id, 'Prepare vendor payments and gratuity envelopes', 'admin',   '1_3_months',     'Know which balances are due before vs. day-of.', 38),
    (test_couple_id, 'Confirm all vendors — date, time, logistics','vendors',     'final_month',    'Call every booked vendor. Reconfirm arrival times and address.', 39),
    (test_couple_id, 'Send day-of timeline to all vendors and wedding party', 'logistics', 'final_month', NULL, 40),
    (test_couple_id, 'Assign day-of responsibilities to trusted people', 'logistics', 'final_month', 'You should not be managing anything on your wedding day.', 41),
    (test_couple_id, 'Complete hair and makeup trial',            'vendors',      'final_month',    'Take photos after so you remember what you approved.', 42),
    (test_couple_id, 'Purchase and prepare wedding party gifts',  'admin',        'final_month',    NULL, 43),
    (test_couple_id, 'Assemble a wedding day emergency kit',      'logistics',    'final_month',    'Safety pins, stain pen, fashion tape, pain reliever, snacks.', 44),
    (test_couple_id, 'Pick up all wedding attire',                'attire',       'week_of',        NULL, 45),
    (test_couple_id, 'Final confirmation calls with all vendors', 'vendors',      'week_of',        'Quick check only — confirm time, address, your cell number.', 46),
    (test_couple_id, 'Wedding rehearsal',                         'ceremony',     'week_of',        'Walk through processional and recessional at least twice.', 47),
    (test_couple_id, 'Break in your wedding shoes',               'attire',       'week_of',        'Wear them around the house. Your future feet will thank you.', 48),
    (test_couple_id, 'Finalize all vendor payments and tip envelopes', 'admin',   'week_of',        NULL, 49),
    (test_couple_id, 'Eat a real breakfast',                      'logistics',    'day_of',         'Cocktail hour is hours away. Do not skip this.', 50),
    (test_couple_id, 'Hand off vendor payment envelopes',         'admin',        'day_of',         NULL, 51),
    (test_couple_id, 'Breathe. Be present. Let the day happen.',  'logistics',    'day_of',         'Something will go slightly off-script. It always does. It will not matter.', 52);

END $$;
