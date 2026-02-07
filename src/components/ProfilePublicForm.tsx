"use client";

import { useState } from "react";

type ProfileFormProfile = {
  apelido: string | null;
  bio: string | null;
  estatisticas_publicas: number | null;
  privacidade: string | null;
};

type ProfileFormAssets = {
  banner_url: string | null;
  avatar_url: string | null;
  ring_url: string | null;
};

type ProfilePublicFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  profile: ProfileFormProfile | null;
  assets: ProfileFormAssets | null;
  socialHandles: {
    discord: string;
    youtube: string;
    tiktok: string;
  };
};

const MAX_BYTES = 5 * 1024 * 1024;

export default function ProfilePublicForm({
  action,
  profile,
  assets,
  socialHandles,
}: ProfilePublicFormProps) {
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setError("");
    const form = event.currentTarget;
    const fileInputs = form.querySelectorAll<HTMLInputElement>('input[type="file"]');
    let totalBytes = 0;

    fileInputs.forEach((input) => {
      const file = input.files?.[0];
      if (file) totalBytes += file.size;
    });

    if (totalBytes > MAX_BYTES) {
      event.preventDefault();
      setError("Limite total de upload: 5MB. Reduza o tamanho dos arquivos e tente novamente.");
    }
  };

  return (
    <form action={action} className="profile-form" onSubmit={handleSubmit}>
      <div className="profile-form-grid">
        <label className="profile-field">
          <span>Apelido</span>
          <input
            type="text"
            name="apelido"
            defaultValue={profile?.apelido ?? ""}
            placeholder="Seu nome no perfil"
          />
        </label>

        <label className="profile-field">
          <span>Visibilidade</span>
          <select name="privacidade" defaultValue={profile?.privacidade ?? "PUBLICA"}>
            <option value="PUBLICA">Publico</option>
            <option value="PRIVADA">Privado</option>
          </select>
        </label>

        <label className="profile-field profile-field-full">
          <span>Bio</span>
          <textarea
            name="bio"
            rows={4}
            defaultValue={profile?.bio ?? ""}
            placeholder="Fale sobre voce, eventos favoritos e conquistas."
          />
        </label>
      </div>

      <div className="profile-toggle">
        <label>
          <input
            type="checkbox"
            name="estatisticas_publicas"
            defaultChecked={profile?.estatisticas_publicas !== 0}
          />
          Exibir estatisticas publicas
        </label>
      </div>

      <div className="profile-form-section">
        <div className="profile-form-title">Midia</div>
        <div className="profile-upload-grid">
          <div className="profile-upload">
            <span>Banner</span>
            {assets?.banner_url && (
              <div className="profile-upload-preview">
                <img src={assets.banner_url} alt="Banner atual" />
                <label className="profile-remove">
                  <input type="checkbox" name="remove_banner" /> Remover
                </label>
              </div>
            )}
            <input type="file" name="banner" accept="image/*" className="profile-file-input" />
          </div>

          <div className="profile-upload">
            <span>Avatar animado</span>
            {assets?.avatar_url && (
              <div className="profile-upload-preview">
                <img src={assets.avatar_url} alt="Avatar atual" />
                <label className="profile-remove">
                  <input type="checkbox" name="remove_avatar" /> Remover
                </label>
              </div>
            )}
            <input type="file" name="avatar" accept="image/*" className="profile-file-input" />
          </div>

          <div className="profile-upload">
            <span>Moldura</span>
            {assets?.ring_url && (
              <div className="profile-upload-preview">
                <img src={assets.ring_url} alt="Moldura atual" />
                <label className="profile-remove">
                  <input type="checkbox" name="remove_ring" /> Remover
                </label>
              </div>
            )}
            <input type="file" name="ring" accept="image/*" className="profile-file-input" />
          </div>
        </div>
        <p className="muted">Limite total de upload: 5MB.</p>
      </div>
      {error ? <p className="form-error">{error}</p> : null}

      <div className="profile-form-section">
        <div className="profile-form-title">Redes sociais</div>
        <div className="profile-socials-editor">
          <div className="profile-socials-header">
            <div>
              <span className="card-eyebrow">Redes</span>
              <h3 className="card-title">Links publicos</h3>
              <p className="muted">Informe apenas o @ das redes disponiveis.</p>
            </div>
          </div>

          <div className="profile-socials-grid">
            <div className="profile-social-row">
              <input type="hidden" name="social_label_discord" value="Discord" />
              <input
                type="text"
                name="social_handle_discord"
                placeholder="@seuDiscord"
                defaultValue={socialHandles.discord}
              />
              <label className="profile-social-public">
                <input type="checkbox" name="social_public_discord" defaultChecked />
                Publico
              </label>
            </div>

            <div className="profile-social-row">
              <input type="hidden" name="social_label_youtube" value="YouTube" />
              <input
                type="text"
                name="social_handle_youtube"
                placeholder="@seuYoutube"
                defaultValue={socialHandles.youtube}
              />
              <label className="profile-social-public">
                <input type="checkbox" name="social_public_youtube" defaultChecked />
                Publico
              </label>
            </div>

            <div className="profile-social-row">
              <input type="hidden" name="social_label_tiktok" value="TikTok" />
              <input
                type="text"
                name="social_handle_tiktok"
                placeholder="@seuTiktok"
                defaultValue={socialHandles.tiktok}
              />
              <label className="profile-social-public">
                <input type="checkbox" name="social_public_tiktok" defaultChecked />
                Publico
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-actions">
        <button type="submit" className="btn primary">
          Salvar perfil
        </button>
      </div>
    </form>
  );
}
