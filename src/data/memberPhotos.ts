// Helper untuk label absen.
// Foto member sekarang disimpan di Supabase Storage dan direferensi via members.photo_url.

export function getAttendanceLabel(attendanceNumber: number | null | undefined): string {
  if (!attendanceNumber) return '';
  return `#${String(attendanceNumber).padStart(2, '0')}`;
}
