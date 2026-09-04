export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          role: string | null;
          name: string;
          email: string;
          photo_url: string | null;
          photo_path: string | null;
          attendance_number: number | null;
          instagram_url: string | null;
          tiktok_url: string | null;
          last_seen: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          username?: string;
          role?: string | null;
          name?: string;
          email?: string;
          photo_url?: string | null;
          photo_path?: string | null;
          attendance_number?: number | null;
          instagram_url?: string | null;
          tiktok_url?: string | null;
          last_seen?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          role?: string | null;
          name?: string;
          email?: string;
          photo_url?: string | null;
          photo_path?: string | null;
          attendance_number?: number | null;
          instagram_url?: string | null;
          tiktok_url?: string | null;
          last_seen?: string | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          subject: string | null;
          created_by: string | null;
          deadline: string | null;
          status: string;
          attachment_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title?: string;
          description?: string | null;
          subject?: string | null;
          created_by?: string | null;
          deadline?: string | null;
          status?: string;
          attachment_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          subject?: string | null;
          created_by?: string | null;
          deadline?: string | null;
          status?: string;
          attachment_url?: string | null;
        };
      };
      task_completions: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          task_id?: string;
          user_id?: string;
          completed_at?: string;
        };
        Update: {
          task_id?: string;
          user_id?: string;
        };
      };
      piket: {
        Row: {
          id: string;
          date: string;
          day: string;
          student_name: string;
          task: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date?: string;
          day?: string;
          student_name?: string;
          task?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          date?: string;
          day?: string;
          student_name?: string;
          task?: string;
          created_by?: string | null;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          author: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          author?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          author?: string | null;
        };
      };
      gallery: {
        Row: {
          id: string;
          title: string;
          image_url: string | null;
          category: string | null;
          storage_path: string | null;
          file_name: string | null;
          file_type: string | null;
          file_size: number | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title?: string;
          image_url?: string | null;
          category?: string | null;
          storage_path?: string | null;
          file_name?: string | null;
          file_type?: string | null;
          file_size?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          image_url?: string | null;
          category?: string | null;
          storage_path?: string | null;
          file_name?: string | null;
          file_type?: string | null;
          file_size?: number | null;
          uploaded_by?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string;
          image_url: string | null;
          link: string | null;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          image_url?: string | null;
          link?: string | null;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          image_url?: string | null;
          link?: string | null;
          category?: string | null;
        };
      };
      teachers: {
        Row: {
          id: string;
          name: string;
          subject: string | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subject?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          subject?: string | null;
          photo_url?: string | null;
        };
      };
      achievements: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          icon?: string | null;
        };
      };
      polls: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          is_active: boolean;
          starts_at: string | null;
          ends_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title?: string;
          description?: string | null;
          is_active?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          is_active?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          created_by?: string | null;
        };
      };
      poll_options: {
        Row: {
          id: string;
          poll_id: string;
          option_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id?: string;
          option_text?: string;
          created_at?: string;
        };
        Update: {
          poll_id?: string;
          option_text?: string;
        };
      };
      poll_votes: {
        Row: {
          id: string;
          poll_id: string;
          option_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id?: string;
          option_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Update: {
          poll_id?: string;
          option_id?: string;
          user_id?: string;
        };
      };
      task_attachments: {
        Row: {
          id: string;
          task_id: string;
          file_name: string;
          storage_path: string;
          file_type: string;
          file_size: number;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id?: string;
          file_name?: string;
          storage_path?: string;
          file_type?: string;
          file_size?: number;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          file_name?: string;
          storage_path?: string;
          file_type?: string;
          file_size?: number;
          uploaded_by?: string | null;
        };
      };
      project_attachments: {
        Row: {
          id: string;
          project_id: string;
          file_name: string;
          storage_path: string;
          file_type: string;
          file_size: number;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string;
          file_name?: string;
          storage_path?: string;
          file_type?: string;
          file_size?: number;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          file_name?: string;
          storage_path?: string;
          file_type?: string;
          file_size?: number;
          uploaded_by?: string | null;
        };
      };
      announcement_attachments: {
        Row: {
          id: string;
          announcement_id: string;
          file_name: string;
          storage_path: string;
          file_type: string;
          file_size: number;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          announcement_id?: string;
          file_name?: string;
          storage_path?: string;
          file_type?: string;
          file_size?: number;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          file_name?: string;
          storage_path?: string;
          file_type?: string;
          file_size?: number;
          uploaded_by?: string | null;
        };
      };
      private_messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          message: string;
          message_type: string;
          reply_to_id: string | null;
          edited_at: string | null;
          deleted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          message?: string;
          message_type?: string;
          reply_to_id?: string | null;
          edited_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
        };
        Update: {
          message?: string;
          message_type?: string;
          reply_to_id?: string | null;
          edited_at?: string | null;
          deleted_at?: string | null;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          message: string;
          message_type: string;
          reply_to_id: string | null;
          edited_at: string | null;
          pinned: boolean;
          deleted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          username?: string;
          message?: string;
          message_type?: string;
          reply_to_id?: string | null;
          edited_at?: string | null;
          pinned?: boolean;
          deleted_at?: string | null;
          created_at?: string;
        };
        Update: {
          username?: string;
          message?: string;
          message_type?: string;
          reply_to_id?: string | null;
          edited_at?: string | null;
          pinned?: boolean;
          deleted_at?: string | null;
        };
      };
      reactions: {
        Row: {
          id: string;
          message_id: string;
          user_id: string;
          emoji: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id?: string;
          user_id?: string;
          emoji?: string;
          created_at?: string;
        };
        Update: {
          message_id?: string;
          user_id?: string;
          emoji?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          link: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          link?: string | null;
          read?: boolean;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          event_type: string;
          event_date: string;
          event_time: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title?: string;
          description?: string | null;
          event_type?: string;
          event_date?: string;
          event_time?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          event_type?: string;
          event_date?: string;
          event_time?: string | null;
          created_by?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export type TaskCompletion = Database['public']['Tables']['task_completions']['Row'];
export type TaskCompletionInsert = Database['public']['Tables']['task_completions']['Insert'];
export type TaskCompletionUpdate = Database['public']['Tables']['task_completions']['Update'];

export type Piket = Database['public']['Tables']['piket']['Row'];
export type PiketInsert = Database['public']['Tables']['piket']['Insert'];
export type PiketUpdate = Database['public']['Tables']['piket']['Update'];

export type Announcement = Database['public']['Tables']['announcements']['Row'];
export type AnnouncementInsert = Database['public']['Tables']['announcements']['Insert'];
export type AnnouncementUpdate = Database['public']['Tables']['announcements']['Update'];

export type GalleryItem = Database['public']['Tables']['gallery']['Row'];
export type GalleryItemInsert = Database['public']['Tables']['gallery']['Insert'];
export type GalleryItemUpdate = Database['public']['Tables']['gallery']['Update'];

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export type Teacher = Database['public']['Tables']['teachers']['Row'];
export type TeacherInsert = Database['public']['Tables']['teachers']['Insert'];
export type TeacherUpdate = Database['public']['Tables']['teachers']['Update'];

export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type AchievementInsert = Database['public']['Tables']['achievements']['Insert'];
export type AchievementUpdate = Database['public']['Tables']['achievements']['Update'];

export type Poll = Database['public']['Tables']['polls']['Row'];
export type PollInsert = Database['public']['Tables']['polls']['Insert'];
export type PollUpdate = Database['public']['Tables']['polls']['Update'];

export type PollOption = Database['public']['Tables']['poll_options']['Row'];
export type PollOptionInsert = Database['public']['Tables']['poll_options']['Insert'];
export type PollOptionUpdate = Database['public']['Tables']['poll_options']['Update'];

export type PollVote = Database['public']['Tables']['poll_votes']['Row'];
export type PollVoteInsert = Database['public']['Tables']['poll_votes']['Insert'];
export type PollVoteUpdate = Database['public']['Tables']['poll_votes']['Update'];

export type TaskAttachment = Database['public']['Tables']['task_attachments']['Row'];
export type TaskAttachmentInsert = Database['public']['Tables']['task_attachments']['Insert'];
export type TaskAttachmentUpdate = Database['public']['Tables']['task_attachments']['Update'];

export type ProjectAttachment = Database['public']['Tables']['project_attachments']['Row'];
export type ProjectAttachmentInsert = Database['public']['Tables']['project_attachments']['Insert'];
export type ProjectAttachmentUpdate = Database['public']['Tables']['project_attachments']['Update'];

export type AnnouncementAttachment = Database['public']['Tables']['announcement_attachments']['Row'];
export type AnnouncementAttachmentInsert = Database['public']['Tables']['announcement_attachments']['Insert'];
export type AnnouncementAttachmentUpdate = Database['public']['Tables']['announcement_attachments']['Update'];

export type PrivateMessage = Database['public']['Tables']['private_messages']['Row'];
export type PrivateMessageInsert = Database['public']['Tables']['private_messages']['Insert'];
export type PrivateMessageUpdate = Database['public']['Tables']['private_messages']['Update'];

export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
export type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert'];
export type ChatMessageUpdate = Database['public']['Tables']['chat_messages']['Update'];

export type Reaction = Database['public']['Tables']['reactions']['Row'];
export type ReactionInsert = Database['public']['Tables']['reactions']['Insert'];
export type ReactionUpdate = Database['public']['Tables']['reactions']['Update'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export type Event = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];
