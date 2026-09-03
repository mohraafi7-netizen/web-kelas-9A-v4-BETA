'use client';

import * as React from 'react';
import { Modal } from '@/components/ui';
import { GalaxyBadge } from '@/components/ui';
import { GalaxyButton } from '@/components/ui';
import { storage } from '@/lib/storage';
import { getAttendanceLabel } from '@/data/memberPhotos';
import { Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Profile } from '@/types';

function getInitials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface MemberModalProps {
  member: Profile | null;
  open: boolean;
  onClose: () => void;
}

function MemberModal({ member, open, onClose }: MemberModalProps) {
  const [showInitials, setShowInitials] = React.useState(false);
  const router = useRouter();

  const photoPath = member?.photo_path;
  const supabasePhoto = member?.photo_url ?? null;
  const attendanceLabel = member ? getAttendanceLabel(member.attendance_number ?? null) : '';

  const photoSrc = photoPath
    ? `${storage.getPublicUrl('member-photos', photoPath)}?v=${Date.now()}`
    : supabasePhoto;

  const handlePhotoError = React.useCallback(() => {
    setShowInitials(true);
  }, []);

  if (!member) return null;

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center">
        <div className="relative mx-auto mb-5 h-40 w-40 overflow-hidden rounded-2xl bg-slate-800">
          {!showInitials && photoSrc && (
            <img
              src={photoSrc}
              alt={`Foto ${member.name}`}
              className="h-full w-full object-cover"
              onError={handlePhotoError}
            />
          )}
          {showInitials || !photoSrc ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-galaxy-700 via-purple-700 to-cosmic-900">
              <span className="text-4xl font-bold text-white/90">{getInitials(member.name)}</span>
            </div>
          ) : null}
        </div>

        {attendanceLabel && (
          <p className="text-xs font-semibold text-galaxy-300 tracking-wider mb-1">{attendanceLabel}</p>
        )}
        <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
        {member.role && (
          <div className="mb-3">
            <GalaxyBadge variant="secondary">{member.role}</GalaxyBadge>
          </div>
        )}
        <p className="text-sm text-slate-400 mb-6">
          Member since {new Date(member.created_at).toLocaleDateString()}
        </p>
        <div className="flex gap-3">
          <GalaxyButton variant="secondary" onClick={() => router.push(`/messages/${member.id}`)} icon={<Mail className="w-4 h-4" />} className="flex-1">
            Message
          </GalaxyButton>
          <GalaxyButton variant="ghost" onClick={onClose} className="flex-1">Close</GalaxyButton>
        </div>
      </div>
    </Modal>
  );
}

export { MemberModal };
export default MemberModal;
