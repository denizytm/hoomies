"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

export function AvatarUploader({
  userId,
  initialUrl,
  fallback,
}: {
  userId: string;
  initialUrl: string | null;
  fallback: string;
}) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir görsel seç.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Görsel en fazla 5MB olabilir.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (error) {
      toast.error("Yükleme başarısız: " + error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setUrl(data.publicUrl);
    setUploading(false);
    toast.success("Profil fotoğrafı güncellendi.");
  }

  return (
    <div className="flex items-center gap-4">
      <input type="hidden" name="avatarUrl" value={url ?? ""} />
      <Avatar size="lg" className="size-20">
        {url ? <AvatarImage src={url} alt="Profil fotoğrafı" /> : null}
        <AvatarFallback className="text-lg">{fallback}</AvatarFallback>
      </Avatar>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
          Fotoğraf yükle
        </button>
        <p className="mt-1 text-xs text-muted-foreground">JPG/PNG, en fazla 5MB.</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onSelect}
        />
      </div>
    </div>
  );
}
