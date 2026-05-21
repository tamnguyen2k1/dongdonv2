import { supabase } from "./supabase";

export async function saveGameScore(
  playerName: string,
  score: number,
  game = "catch_the_orders"
) {
  if (!playerName.trim()) return;

  const { error } = await supabase
    .from("game_scores")
    .insert({
      player_name: playerName,
      score,
      game,
    });

  if (error) {
    console.error(error);
  }
}

export async function getTopScores(
  game = "catch_the_orders"
) {
  const { data, error } = await supabase
    .from("game_scores")
    .select("*")
    .eq("game", game)
    .order("score", { ascending: false })
    .limit(10);

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}