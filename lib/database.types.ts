export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          domain: string | null
          settings: Json
          subscription_plan: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          domain?: string | null
          settings?: Json
          subscription_plan?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string | null
          settings?: Json
          subscription_plan?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          organization_id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: Database['public']['Enums']['user_role']
          permissions: Json
          preferences: Json
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          full_name: string
          avatar_url?: string | null
          role?: Database['public']['Enums']['user_role']
          permissions?: Json
          preferences?: Json
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          role?: Database['public']['Enums']['user_role']
          permissions?: Json
          preferences?: Json
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          organization_id: string
          name: string
          slug: string | null
          category_id: string | null
          current_plan_id: string | null
          contact_info: Json
          address: Json
          contract_info: Json
          status: Database['public']['Enums']['business_status']
          responsible_user_id: string | null
          tags: string[]
          custom_fields: Json
          metrics: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          slug?: string | null
          category_id?: string | null
          current_plan_id?: string | null
          contact_info?: Json
          address?: Json
          contract_info?: Json
          status?: Database['public']['Enums']['business_status']
          responsible_user_id?: string | null
          tags?: string[]
          custom_fields?: Json
          metrics?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          slug?: string | null
          category_id?: string | null
          current_plan_id?: string | null
          contact_info?: Json
          address?: Json
          contract_info?: Json
          status?: Database['public']['Enums']['business_status']
          responsible_user_id?: string | null
          tags?: string[]
          custom_fields?: Json
          metrics?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      creators: {
        Row: {
          id: string
          organization_id: string
          name: string
          slug: string | null
          social_media: Json
          contact_info: Json
          profile_info: Json
          performance_metrics: Json
          status: Database['public']['Enums']['creator_status']
          tags: string[]
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          slug?: string | null
          social_media?: Json
          contact_info?: Json
          profile_info?: Json
          performance_metrics?: Json
          status?: Database['public']['Enums']['creator_status']
          tags?: string[]
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          slug?: string | null
          social_media?: Json
          contact_info?: Json
          profile_info?: Json
          performance_metrics?: Json
          status?: Database['public']['Enums']['creator_status']
          tags?: string[]
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          organization_id: string
          business_id: string
          title: string
          slug: string | null
          description: string | null
          campaign_type: string
          month: string
          start_date: string | null
          end_date: string | null
          budget: number
          spent_amount: number
          status: Database['public']['Enums']['campaign_status']
          objectives: Json
          deliverables: Json
          settings: Json
          results: Json
          created_by: string
          responsible_user_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          business_id: string
          title: string
          slug?: string | null
          description?: string | null
          campaign_type?: string
          month: string
          start_date?: string | null
          end_date?: string | null
          budget?: number
          spent_amount?: number
          status?: Database['public']['Enums']['campaign_status']
          objectives?: Json
          deliverables?: Json
          settings?: Json
          results?: Json
          created_by: string
          responsible_user_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          business_id?: string
          title?: string
          slug?: string | null
          description?: string | null
          campaign_type?: string
          month?: string
          start_date?: string | null
          end_date?: string | null
          budget?: number
          spent_amount?: number
          status?: Database['public']['Enums']['campaign_status']
          objectives?: Json
          deliverables?: Json
          settings?: Json
          results?: Json
          created_by?: string
          responsible_user_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      campaign_creators: {
        Row: {
          id: string
          campaign_id: string
          creator_id: string
          role: string
          fee: number
          payment_status: string
          status: string
          deliverables: Json
          performance_data: Json
          notes: string | null
          assigned_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          creator_id: string
          role?: string
          fee?: number
          payment_status?: string
          status?: string
          deliverables?: Json
          performance_data?: Json
          notes?: string | null
          assigned_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          creator_id?: string
          role?: string
          fee?: number
          payment_status?: string
          status?: string
          deliverables?: Json
          performance_data?: Json
          notes?: string | null
          assigned_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          organization_id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          source: string
          status: string
          score: number
          assigned_to: string | null
          contact_info: Json
          notes: string | null
          converted_to_business_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          source?: string
          status?: string
          score?: number
          assigned_to?: string | null
          contact_info?: Json
          notes?: string | null
          converted_to_business_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          source?: string
          status?: string
          score?: number
          assigned_to?: string | null
          contact_info?: Json
          notes?: string | null
          converted_to_business_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          organization_id: string
          title: string
          description: string | null
          task_type: string
          priority: Database['public']['Enums']['task_priority']
          status: Database['public']['Enums']['task_status']
          assigned_to: string | null
          created_by: string
          related_to_type: string | null
          related_to_id: string | null
          due_date: string | null
          completed_at: string | null
          estimated_hours: number | null
          actual_hours: number | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          title: string
          description?: string | null
          task_type?: string
          priority?: Database['public']['Enums']['task_priority']
          status?: Database['public']['Enums']['task_status']
          assigned_to?: string | null
          created_by: string
          related_to_type?: string | null
          related_to_id?: string | null
          due_date?: string | null
          completed_at?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          title?: string
          description?: string | null
          task_type?: string
          priority?: Database['public']['Enums']['task_priority']
          status?: Database['public']['Enums']['task_status']
          assigned_to?: string | null
          created_by?: string
          related_to_type?: string | null
          related_to_id?: string | null
          due_date?: string | null
          completed_at?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          organization_id: string
          table_name: string
          record_id: string
          action: string
          old_values: Json | null
          new_values: Json | null
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          table_name: string
          record_id: string
          action: string
          old_values?: Json | null
          new_values?: Json | null
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          table_name?: string
          record_id?: string
          action?: string
          old_values?: Json | null
          new_values?: Json | null
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          organization_id: string
          organization_name: string
          total_businesses: number
          active_businesses: number
          total_creators: number
          active_creators: number
          total_campaigns: number
          active_campaigns: number
          total_budget: number
          total_spent: number
          avg_roi: number
        }
      }
      campaign_journey_view: {
        Row: {
          id: string
          organization_id: string
          title: string
          month: string
          status: string
          business_name: string
          business_id: string
          total_creators: number
          confirmed_creators: number
          completed_creators: number
          completion_percentage: number
          created_at: string
          updated_at: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'manager' | 'user' | 'viewer'
      business_status: 'Reunião de briefing' | 'Agendamentos' | 'Entrega final' | 'Finalizado'
      creator_status: 'Ativo' | 'Não parceiro' | 'Precisa engajar' | 'Inativo'
      campaign_status: 'Reunião de briefing' | 'Agendamentos' | 'Entrega final' | 'Finalizado'
      task_status: 'todo' | 'in_progress' | 'review' | 'done'
      task_priority: 'low' | 'medium' | 'high' | 'urgent'
    }
  }
}
