# Galaxy Class — Password & Authentication Setup

## 1. Konsep Login

Login menggunakan **dropdown nama** + **password**.

User tidak perlu mengetik username/email.

### Flow:
1. User membuka website
2. Jika belum login, redirect ke `/login`
3. User memilih nama dari dropdown
4. User memasukkan password
5. Sistem mencari profile berdasarkan nama
6. Sistem mengambil email internal dari profile
7. Sistem login ke Supabase Auth dengan email + password
8. Jika berhasil, redirect ke `/dashboard`
9. Role ditentukan dari tabel `profiles`

### Keunggulan:
- User tidak perlu menghafal username
- Tidak ada email yang ditampilkan ke user
- Password aman di Supabase Auth
- Role terpusat di tabel `profiles`

## 2. Struktur Database

### Tabel `profiles`:
```sql
id uuid references auth.users on delete cascade primary key,
username text unique not null,
role text not null default 'member',
name text not null,
email text unique not null,
created_at timestamp with time zone default timezone('utc'::text, now()) not null
```

### Relasi:
- `profiles.id` → `auth.users.id`
- Satu user = satu profile
- Email di `profiles` adalah email internal untuk Supabase Auth

## 3. Cara Membuat Akun

### Via Supabase Dashboard:
1. Buka Supabase Project
2. Authentication → Users
3. Click "Add user"
4. Pilih "Create new user"
5. Masukkan email internal: `nama@galaxy.local` (contoh: `afwina@galaxy.local`)
6. Masukkan password awal
7. Copy user UUID
8. Buka SQL Editor
9. Insert ke tabel `profiles`:
```sql
insert into profiles (id, username, role, name, email)
values ('user-uuid', 'username', 'member', 'Nama Lengkap', 'nama@galaxy.local');
```

### Via Script (Recommended untuk bulk):
Jalankan SQL di Supabase SQL Editor:
```sql
-- Contoh untuk membuat semua member
insert into auth.users (id, email, encrypted_password, email_confirmed_at, confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data)
values
  ('uuid-1', 'afwina@galaxy.local', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
  ('uuid-2', 'ajeng@galaxy.local', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}');

insert into profiles (id, username, role, name, email)
values
  ('uuid-1', 'Afwina Amni Bayu widi J', 'member', 'Afwina Amni Bayu widi J', 'afwina@galaxy.local'),
  ('uuid-2', 'Ajeng Wachyu Supramono', 'admin', 'Ajeng Wachyu Supramono', 'ajeng@galaxy.local');
```

## 4. Role Assignment

### Member (33 orang):
Semua anggota kelas kecuali admin.

### Admin (4 orang):
- Ajeng Wachyu Supramono
- Faiq Fawwaz Satria
- Kania Chairinisa Queency
- Muhammad Raafi El- Mu'min

### Main Admin (1 orang):
- Muhammad Raafi El- Mu'min

## 5. Cara Login

### Member/Admin:
1. Buka `/login`
2. Pilih nama dari dropdown
3. Masukkan password
4. Klik Login

### Redirect:
- Member → `/dashboard`
- Admin → `/admin`
- Main Admin → `/admin` + akses ke `/admin/management`

## 6. Route Protection

### Public routes:
- `/login`
- `/signup`

### Protected routes:
- Semua route lainnya memerlukan login
- `/admin/*` → hanya admin/main_admin
- `/admin/management` → hanya main_admin

### Implementation:
Gunakan `RouteGuard` component di `src/components/RouteGuard.tsx`

## 7. Ganti Password

### Semua User:
1. Login ke website
2. Buka **Settings** → **Security**
3. Masukkan password baru
4. Konfirmasi password baru
5. Klik **Change Password**

Menggunakan Supabase Auth `updateUser`.

## 8. Reset Password

### Admin Reset Password Member:
1. Login sebagai Admin/Main Admin
2. Buka `/admin/management`
3. Pilih member
4. Klik reset password
5. Password baru ditampilkan sekali (tidak disimpan di DB)
6. Berikan password baru kepada member secara pribadi

### Member Reset Password Sendiri:
Gunakan fitur "Forgot Password" (jika sudah diimplementasi).

## 9. Keamanan

### PENTING:
- Password dikelola oleh Supabase Auth
- Password TIDAK disimpan di database project
- Password TIDAK ditampilkan di UI
- Email internal (`@galaxy.local`) TIDAK ditampilkan ke user
- Service role key TIDAK boleh masuk ke browser
- Semua operasi sensitif dilakukan via server/API

### Best Practices:
- Gunakan HTTPS
- Jangan commit `.env.local`
- Jangan expose service role key
- Gunakan RLS policies
- Validasi input di server

## 10. File Terkait

| File | Fungsi |
|------|--------|
| `src/providers/AuthProvider.tsx` | Authentication context |
| `src/components/RouteGuard.tsx` | Route protection |
| `src/app/login/page.tsx` | Login page dengan dropdown |
| `src/app/settings/page.tsx` | Ganti password |
| `src/app/admin/management/page.tsx` | Admin management |
| `src/app/api/admin/profiles/route.ts` | API manage profiles |
| `supabase/schema.sql` | Database schema |

## 11. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 12. Troubleshooting

### Login gagal:
- Pastikan tabel `profiles` sudah dibuat
- Pastikan `email` di profiles sesuai dengan email di Supabase Auth
- Check Supabase logs

### Redirect tidak bekerja:
- Clear localStorage
- Hard refresh browser
- Check RouteGuard component

### Admin tidak bisa akses:
- Pastikan role di `profiles` adalah `admin` atau `main_admin`
- Pastikan RLS policies sudah dibuat

## 13. Catatan Penting

- Password awal harus diberikan secara pribadi oleh admin
- Setelah login pertama, user sebaiknya mengganti password
- Main Admin dapat mengubah role member melalui `/admin/management`
- Semua password management dilakukan melalui Supabase Auth
- Tidak ada password yang disimpan di frontend/database project
