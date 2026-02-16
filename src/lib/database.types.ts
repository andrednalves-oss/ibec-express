export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'operacional' | 'cliente' | 'colaborador';
          password_hash: string;
          avatar_url: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: 'admin' | 'operacional' | 'cliente' | 'colaborador';
          password_hash?: string;
          avatar_url?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'admin' | 'operacional' | 'cliente' | 'colaborador';
          password_hash?: string;
          avatar_url?: string | null;
          active?: boolean;
          updated_at?: string;
        };
      };
      drivers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          vehicle: string;
          plate: string;
          type: 'motorista' | 'motoboy';
          status: 'available' | 'busy' | 'offline';
          deliveries_count: number;
          rating: number;
          photo_url: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          vehicle: string;
          plate: string;
          type: 'motorista' | 'motoboy';
          status?: 'available' | 'busy' | 'offline';
          deliveries_count?: number;
          rating?: number;
          photo_url?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          vehicle?: string;
          plate?: string;
          type?: 'motorista' | 'motoboy';
          status?: 'available' | 'busy' | 'offline';
          deliveries_count?: number;
          rating?: number;
          photo_url?: string | null;
          active?: boolean;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          address: string;
          cnpj: string;
          contract_type: 'avulso' | 'fixo';
          total_orders: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          address: string;
          cnpj: string;
          contract_type: 'avulso' | 'fixo';
          total_orders?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          address?: string;
          cnpj?: string;
          contract_type?: 'avulso' | 'fixo';
          total_orders?: number;
          active?: boolean;
          updated_at?: string;
        };
      };
      deliveries: {
        Row: {
          id: string;
          client_id: string;
          client_name: string;
          driver_id: string;
          driver_name: string;
          origin: string;
          destination: string;
          status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
          delivery_date: string;
          value: number;
          type: 'avulsa' | 'contrato';
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          client_name: string;
          driver_id: string;
          driver_name: string;
          origin: string;
          destination: string;
          status?: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
          delivery_date?: string;
          value: number;
          type: 'avulsa' | 'contrato';
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          client_name?: string;
          driver_id?: string;
          driver_name?: string;
          origin?: string;
          destination?: string;
          status?: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
          delivery_date?: string;
          value?: number;
          type?: 'avulsa' | 'contrato';
          description?: string | null;
          updated_at?: string;
        };
      };
      financial_entries: {
        Row: {
          id: string;
          type: 'revenue' | 'expense';
          category: string;
          description: string;
          value: number;
          entry_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: 'revenue' | 'expense';
          category: string;
          description: string;
          value: number;
          entry_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: 'revenue' | 'expense';
          category?: string;
          description?: string;
          value?: number;
          entry_date?: string;
        };
      };
      payroll: {
        Row: {
          id: string;
          driver_id: string;
          driver_name: string;
          month: string;
          base_salary: number;
          bonus: number;
          deductions: number;
          total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          driver_name: string;
          month: string;
          base_salary: number;
          bonus?: number;
          deductions?: number;
          total: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          driver_id?: string;
          driver_name?: string;
          month?: string;
          base_salary?: number;
          bonus?: number;
          deductions?: number;
          total?: number;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
