import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Trash2, EyeOff, Eye, ExternalLink, Plus } from "lucide-react";

export default function ManageLinks({ hidden = false }: { hidden?: boolean }) {
  const { user } = useAuth();
  const [links, setLinks] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newUrl, setNewUrl] = useState("");

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("links").select("*")
      .eq("user_id", user.id).eq("hidden", hidden).order("created_at", { ascending: false });
    setLinks(data ?? []);
  };
  useEffect(() => { load(); }, [user, hidden]);

  const toggleHide = async (id: string, h: boolean) => {
    await supabase.from("links").update({ hidden: !h }).eq("id", id);
    load(); toast.success(h ? "Unhidden" : "Hidden");
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this link?")) return;
    await supabase.from("links").delete().eq("id", id);
    load(); toast.success("Deleted");
  };
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const code = Array.from({length:6}, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random()*62)]).join("");
    const { error } = await supabase.from("links").insert({ user_id: user.id, original_url: newUrl, short_code: code });
    if (error) toast.error(error.message); else { setNewUrl(""); setShowNew(false); load(); toast.success("Created"); }
  };

  const filtered = links.filter((l) => l.original_url.toLowerCase().includes(search.toLowerCase()) || l.short_code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">{hidden ? "Hidden Links" : "All Links"}</h1>
        <Button onClick={() => setShowNew(!showNew)}><Plus className="h-4 w-4 mr-1" /> New Link</Button>
      </div>
      {showNew && (
        <form onSubmit={create} className="flex gap-2 bg-card p-3 rounded-lg border">
          <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} type="url" placeholder="https://example.com" required />
          <Button type="submit">Shorten</Button>
        </form>
      )}
      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" />
      <div className="bg-card rounded-xl border overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3">Short URL</th>
                <th className="text-left p-3 hidden md:table-cell">Original</th>
                <th className="text-right p-3">Views</th>
                <th className="text-right p-3">Earned</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center p-8 text-muted-foreground">No links yet.</td></tr>
              )}
              {filtered.map((l) => {
                const short = `${window.location.origin}/s/${l.short_code}`;
                return (
                  <tr key={l.id} className="border-t">
                    <td className="p-3">
                      <a href={short} target="_blank" rel="noreferrer" className="text-primary font-medium">{short}</a>
                    </td>
                    <td className="p-3 hidden md:table-cell max-w-xs truncate text-muted-foreground">{l.original_url}</td>
                    <td className="p-3 text-right">{l.views}</td>
                    <td className="p-3 text-right">${Number(l.earnings).toFixed(2)}</td>
                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(short); toast.success("Copied"); }}><Copy className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleHide(l.id, l.hidden)}>{l.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(l.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
