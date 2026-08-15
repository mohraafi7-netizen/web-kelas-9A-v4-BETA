-- Galaxy Class — Seed profiles untuk akun login
-- Jalankan di Supabase SQL Editor.
--
-- CATATAN:
--   Script ini HANYA membuat/mengisi public.profiles.
--   Akun auth.users harus dibuat melalui Admin API:
--     POST /api/setup/seed-users
--   Password awal: RFXSY (dikelola oleh Supabase Auth, bukan di sini).

DO $$
DECLARE
    r  record;
BEGIN
    FOR r IN
        VALUES
            ('Afwina Amni Bayu widi J', 'member', 'afwina@galaxyclass.local'),
            ('Ajeng Wachyu Supramono', 'admin', 'ajeng@galaxyclass.local'),
            ('Alika Azzahra', 'member', 'alika@galaxyclass.local'),
            ('Alvis Syandana Purwantoro', 'member', 'alvis@galaxyclass.local'),
            ('Alyssa Queenaya warman', 'member', 'alyssa@galaxyclass.local'),
            ('Annisa Luthfi MizQi Hidayak', 'member', 'annisa@galaxyclass.local'),
            ('Asadya Akbar Setiawan', 'member', 'asadya@galaxyclass.local'),
            ('Athaillah Gibran kurniawan', 'member', 'athaillah@galaxyclass.local'),
            ('Ayu Dhia Syarasana', 'member', 'ayu@galaxyclass.local'),
            ('Azizah Riska Munifah', 'member', 'azizah@galaxyclass.local'),
            ('Bilal Zaidan winanto', 'member', 'bilal@galaxyclass.local'),
            ('Calista Adzkia Fatka', 'member', 'calista@galaxyclass.local'),
            ('Deda Priyo sembodo', 'member', 'deda@galaxyclass.local'),
            ('Dhani Fadhil Ibrahim', 'member', 'dhani@galaxyclass.local'),
            ('Elena Arga kinasih', 'member', 'elena@galaxyclass.local'),
            ('Evan Dalvalova Yuwono', 'member', 'evan@galaxyclass.local'),
            ('Faiq Fawwaz Satria', 'admin', 'faiq@galaxyclass.local'),
            ('Fatimah Az- Zahra', 'member', 'fatimah@galaxyclass.local'),
            ('Hariz Azfarizi', 'member', 'hariz@galaxyclass.local'),
            ('Kania Chairinisa Queency', 'admin', 'kania@galaxyclass.local'),
            ('Maia Rania Maharani', 'member', 'maia@galaxyclass.local'),
            ('Mirza Afta Febrian', 'member', 'mirza@galaxyclass.local'),
            ('Mohammad Rizki Saputra', 'member', 'rizki@galaxyclass.local'),
            ('Muhammad Hazel Armando', 'member', 'hazel@galaxyclass.local'),
            ('Muhammad Raafi El- Mu''min', 'main_admin', 'raafi@galaxyclass.local'),
            ('My Kayla Alexandra P.R', 'member', 'kayla@galaxyclass.local'),
            ('Nadhira Abbiya Saptana', 'member', 'nadhira@galaxyclass.local'),
            ('Nareswara Jerry R.P', 'member', 'nares@galaxyclass.local'),
            ('Rafandra Aqlan Lazuardi', 'member', 'rafandra@galaxyclass.local'),
            ('Riffan Syam Zahir Arthendy', 'member', 'riffan@galaxyclass.local'),
            ('Siti Athallah Mumbaz S.H', 'member', 'siti@galaxyclass.local'),
            ('Syahla Diaara Brilian', 'member', 'syahla@galaxyclass.local'),
            ('Yorji Harlanewa', 'member', 'yorji@galaxyclass.local')
    LOOP
        INSERT INTO public.profiles (id, username, role, name, email, created_at)
        SELECT
            u.id,
            lower(regexp_replace(r.column1, '[^A-Za-z0-9]', '', 'g')),
            r.column2,
            r.column1,
            r.column3,
            now()
        FROM auth.users u
        WHERE u.email = r.column3
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
END
$$;
