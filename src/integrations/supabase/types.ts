export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "superadmin" | "admin" | "operator";
export type PlanType = "starter" | "growth" | "pro";
export type FieldStatus = "required" | "optional" | "hidden";
export type EquipmentType = "gondola" | "geladeira" | "expositor" | "checkout" | "rack";

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: { id: string; name: string; logo_url: string | null; plan: PlanType; active: boolean; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["companies"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
      };
      profiles: {
        Row: { id: string; company_id: string | null; name: string; email: string; role: UserRole; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at"> & { created_at?: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      stores: {
        Row: { id: string; company_id: string; name: string; address: string | null; city: string | null; manager_name: string | null; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["stores"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["stores"]["Insert"]>;
      };
      equipment: {
        Row: { id: string; store_id: string; name: string; type: EquipmentType; qr_token: string; active: boolean; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["equipment"]["Row"], "id" | "created_at" | "qr_token"> & { id?: string; created_at?: string; qr_token?: string };
        Update: Partial<Database["public"]["Tables"]["equipment"]["Insert"]>;
      };
      planograms: {
        Row: { id: string; equipment_id: string; image_url: string; instructions: string | null; capacity_boxes: number | null; updated_at: string };
        Insert: Omit<Database["public"]["Tables"]["planograms"]["Row"], "id" | "updated_at"> & { id?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["planograms"]["Insert"]>;
      };
      negotiations: {
        Row: { id: string; equipment_id: string; sku: string; product_name: string; faces: number; position: string | null; valid_until: string | null };
        Insert: Omit<Database["public"]["Tables"]["negotiations"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["negotiations"]["Insert"]>;
      };
      field_configs: {
        Row: { id: string; company_id: string; field_name: string; status: FieldStatus };
        Insert: Omit<Database["public"]["Tables"]["field_configs"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["field_configs"]["Insert"]>;
      };
      executions: {
        Row: { id: string; equipment_id: string; promoter_name: string; badge: string | null; photo_url: string | null; conformity: boolean; notes: string | null; confirmed_at: string; xp_earned: number };
        Insert: Omit<Database["public"]["Tables"]["executions"]["Row"], "id" | "confirmed_at"> & { id?: string; confirmed_at?: string };
        Update: Partial<Database["public"]["Tables"]["executions"]["Insert"]>;
      };
      execution_items: {
        Row: { id: string; execution_id: string; product_name: string; quantity: number; expiry_date: string | null; price: number | null; price_photo_url: string | null };
        Insert: Omit<Database["public"]["Tables"]["execution_items"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["execution_items"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { user_role: UserRole; plan_type: PlanType; field_status: FieldStatus; equipment_type: EquipmentType };
  };
      }
