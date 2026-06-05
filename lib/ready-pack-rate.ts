import { supabase } from "./supabase";

export type ReadyPackRate = {
  id?: number;
  ngay: string;
  nhan_vien: string;
  mat_hang?: string;
  mat_hang_id?: number;
  tong_don: number;
  don_san: number;
  ghi_chu?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  
};

export async function getReadyPackRates() {
  const { data, error } = await supabase
    .from("ready_pack_rates")
    .select("*")
    .order("ngay", { ascending: false })
    .order("id", { ascending: false });

  if (error) throw error;

  return data as ReadyPackRate[];
}

export async function createReadyPackRate(input: ReadyPackRate) {
  const { error } = await supabase.from("ready_pack_rates").insert(input);

  if (error) throw error;
}

export async function updateReadyPackRate(id: number, input: ReadyPackRate) {
  const { error } = await supabase
    .from("ready_pack_rates")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteReadyPackRate(id: number) {
  const { error } = await supabase
    .from("ready_pack_rates")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
