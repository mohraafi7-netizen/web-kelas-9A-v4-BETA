import { createClientSupabaseAdmin } from '@/lib/supabase/admin';
import { MEMBERS_DATA } from '@/data/members';
import { PASSWORD_MAP } from '@/lib/auth/passwords';
import { NextResponse } from 'next/server';

const ROLE_MAP: Record<string, 'member' | 'admin' | 'main_admin'> = {
  "Muhammad Raafi El- Mu'min": 'main_admin',
  'Ajeng Wachyu Supramono': 'admin',
  'Faiq Fawwaz Satria': 'admin',
  'Kania Chairinisa Queency': 'admin',
};

const EMAIL_MAP: Record<string, string> = {
  'Afwina Amni Bayu widi J': 'afwina@galaxyclass.local',
  'Ajeng Wachyu Supramono': 'ajeng@galaxyclass.local',
  'Alika Azzahra': 'alika@galaxyclass.local',
  'Alvis Syandana Purwantoro': 'alvis@galaxyclass.local',
  'Alyssa Queenaya warman': 'alyssa@galaxyclass.local',
  'Annisa Luthfi MizQi Hidayak': 'annisa@galaxyclass.local',
  'Asadya Akbar Setiawan': 'asadya@galaxyclass.local',
  'Athaillah Gibran kurniawan': 'athaillah@galaxyclass.local',
  'Ayu Dhia Syarasana': 'ayu@galaxyclass.local',
  'Azizah Riska Munifah': 'azizah@galaxyclass.local',
  'Bilal Zaidan winanto': 'bilal@galaxyclass.local',
  'Calista Adzkia Fatka': 'calista@galaxyclass.local',
  'Deda Priyo sembodo': 'deda@galaxyclass.local',
  'Dhani Fadhil Ibrahim': 'dhani@galaxyclass.local',
  'Elena Arga kinasih': 'elena@galaxyclass.local',
  'Evan Dalvalova Yuwono': 'evan@galaxyclass.local',
  'Faiq Fawwaz Satria': 'faiq@galaxyclass.local',
  'Fatimah Az- Zahra': 'fatimah@galaxyclass.local',
  'Hariz Azfarizi': 'hariz@galaxyclass.local',
  'Kania Chairinisa Queency': 'kania@galaxyclass.local',
  'Maia Rania Maharani': 'maia@galaxyclass.local',
  'Mirza Afta Febrian': 'mirza@galaxyclass.local',
  'Mohammad Rizki Saputra': 'rizki@galaxyclass.local',
  'Muhammad Hazel Armando': 'hazel@galaxyclass.local',
  "Muhammad Raafi El- Mu'min": 'raafi@galaxyclass.local',
  'My Kayla Alexandra P.R': 'kayla@galaxyclass.local',
  'Nadhira Abbiya Saptana': 'nadhira@galaxyclass.local',
  'Nareswara Jerry R.P': 'nares@galaxyclass.local',
  'Rafandra Aqlan Lazuardi': 'rafandra@galaxyclass.local',
  'Riffan Syam Zahir Arthendy': 'riffan@galaxyclass.local',
  'Siti Athallah Mumbaz S.H': 'siti@galaxyclass.local',
  'Syahla Diaara Brilian': 'syahla@galaxyclass.local',
  'Yorji Harlanewa': 'yorji@galaxyclass.local',
};

type SeedResult = {
  name: string;
  status: 'created' | 'updated' | 'missing' | 'error' | 'skipped';
  error?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function getAllAuthUsers(supabase: any) {
  const allUsers: any[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(error.message);
    }

    const users = data?.users ?? [];
    allUsers.push(...users);

    if (users.length < perPage) {
      break;
    }

    page++;
  }

  return allUsers;
}

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not allowed in production' },
      { status: 403 }
    );
  }

  const supabase = createClientSupabaseAdmin();
  const results: SeedResult[] = [];

  let existingUsers: any[];

  try {
    existingUsers = await getAllAuthUsers(supabase);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to load Auth users',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }

  const userMap = new Map<string, string>();

  for (const user of existingUsers) {
    if (user.email && user.id) {
      userMap.set(normalizeEmail(user.email), user.id);
    }
  }

  for (const member of MEMBERS_DATA) {
    const email = EMAIL_MAP[member.name];

    if (!email) {
      results.push({
        name: member.name,
        status: 'skipped',
        error: 'Email mapping not found',
      });
      continue;
    }

    const normalizedEmail = normalizeEmail(email);
    const role = ROLE_MAP[member.name] ?? 'member';
    const password = PASSWORD_MAP[member.name];

    if (!password) {
      results.push({
        name: member.name,
        status: 'skipped',
        error: 'Password mapping not found',
      });
      continue;
    }

    if (password.length < 6) {
      results.push({
        name: member.name,
        status: 'error',
        error: `Password untuk ${member.name} kurang dari 6 karakter.`,
      });
      continue;
    }

    let userId = userMap.get(normalizedEmail);
    let status: 'created' | 'updated' = 'updated';

    if (!userId) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
      } as any);

      if (error) {
        const message = (error as any)?.message ?? '';
        const code = (error as any)?.code ?? '';
        const details = (error as any)?.details;
        const hint = (error as any)?.hint;

        results.push({
          name: member.name,
          status: 'error',
          error: JSON.stringify({ message, code, details, hint }),
        });
        continue;
      }

      userId = data?.user?.id;
      status = 'created';

      if (userId) {
        userMap.set(normalizedEmail, userId);
      }
    }

    if (!userId) {
      results.push({
        name: member.name,
        status: 'error',
        error: 'User ID tidak ditemukan',
      });
      continue;
    }

    if (status === 'updated') {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password }
      );

      if (updateError) {
        results.push({
          name: member.name,
          status: 'error',
          error: JSON.stringify({
            message: updateError.message,
            code: (updateError as any).code ?? '',
            details: (updateError as any).details ?? '',
            hint: (updateError as any).hint ?? '',
          }),
        });
        continue;
      }
    }

    const username = member.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          username,
          role,
          name: member.name,
          email: normalizedEmail,
        },
        {
          onConflict: 'id',
        }
      );

    if (profileError) {
      results.push({
        name: member.name,
        status: 'error',
        error: JSON.stringify({
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
        }),
      });
      continue;
    }

    results.push({
      name: member.name,
      status,
    });
  }

  return NextResponse.json({ results });
}
