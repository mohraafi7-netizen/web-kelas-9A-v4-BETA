'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { GalaxyBadge } from '@/components/ui';
import { storage } from '@/lib/storage';
import type { Profile } from '@/types';
import { getAttendanceLabel } from '@/data/memberPhotos';

function getInitials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface MemberCardProps {
  member: Profile;
  onClick: () => void;
}

function MemberCard({ member, onClick }: MemberCardProps) {
  const [showInitials, setShowInitials] = React.useState(false);
  const photoPath = member.photo_path;
  const supabasePhoto = member.photo_url;
  const attendanceLabel = getAttendanceLabel(member.attendance_number ?? null);

  const photoSrc = photoPath
    ? `${storage.getPublicUrl('member-photos', photoPath)}?v=${Date.now()}`
    : supabasePhoto;

  const handlePhotoError = React.useCallback(() => {
    setShowInitials(true);
  }, []);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="group relative text-left w-full"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md transition-all duration-300 group-hover:border-galaxy-400/40 group-hover:shadow-[0_0_25px_rgba(139,92,246,0.15)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-800">
          {!showInitials && photoSrc && (
            <img
              src={photoSrc}
              alt={`Foto ${member.name}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={handlePhotoError}
            />
          )}
          {showInitials || !photoSrc ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-galaxy-700 via-purple-700 to-cosmic-900">
              <span className="text-3xl font-bold text-white/90">{getInitials(member.name)}</span>
            </div>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <div className="p-4">
          {attendanceLabel && (
            <p className="text-[10px] font-semibold text-galaxy-300 tracking-wider mb-1">{attendanceLabel}</p>
          )}
          <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug mb-1.5">
            {member.name}
          </h3>
          {member.role && (
            <GalaxyBadge variant="secondary" size="sm" className="truncate">
              {member.role}
            </GalaxyBadge>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export { MemberCard };
export default MemberCard;
