import { supabase } from "./supabase";

export type ReadyPackProduct = {
  id?: number;
  ten_mat_hang: string;
  sku?: string;
  phan_loai?: string;
  is_active?: boolean;
  created_at?: string;
};

export async function getReadyPackProducts() {
  const { data, error } = await supabase
    .from("ready_pack_products")
    .select("*")
    .order("ten_mat_hang", { ascending: true });

  if (error) throw error;

  return data as ReadyPackProduct[];
}

export async function createReadyPackProduct(input: ReadyPackProduct) {
  const { error } = await supabase
    .from("ready_pack_products")
    .insert(input);

  if (error) throw error;
}

export async function updateReadyPackProduct(
  id: number,
  input: ReadyPackProduct
) {
  const { error } = await supabase
    .from("ready_pack_products")
    .update(input)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteReadyPackProduct(id: number) {
  const { error } = await supabase
    .from("ready_pack_products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
}