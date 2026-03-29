import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { id, action, round_id, caption } = await req.json();

  if (action === "delete") {
    // Get photo URL to delete from storage
    const { data: photo } = await supabase.from("photos").select("url").eq("id", id).single();
    if (photo) {
      const fileName = photo.url.split("/").pop();
      if (fileName) await supabase.storage.from("photos").remove([fileName]);
    }
    const { error } = await supabase.from("photos").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "update") {
    const updates: Record<string, string | null> = {};
    if (round_id !== undefined) updates.round_id = round_id || null;
    if (caption !== undefined) updates.caption = caption || null;
    const { error } = await supabase.from("photos").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
