import React, { useRef } from "react";
import { CardContainer, InputField, Toggle, DEFAULT_LOFI_STATIONS } from "./SettingsPrims.jsx";

/* ─── TAB 3: Song Player Settings ─── */
export const SongPlayerTab = ({
  _showSongPlayer, _onShowSongPlayerChange,
  _songPlaylistUrl, _onSongPlaylistUrlChange,
  songAutoPlay, onSongAutoPlayChange,
  songCustomVideo, onSongCustomVideoChange,
  lofiStations, onLofiStationsChange,
}) => {
  const videoInputRef = useRef(null);

  const handleUpdateStation = (id, field, value) => {
    if (!onLofiStationsChange) return;
    const updated = (lofiStations || []).map((st) =>
      st.id === id ? { ...st, [field]: value } : st
    );
    onLofiStationsChange(updated);
  };

  const handleAddStation = () => {
    if (!onLofiStationsChange) return;
    const newStation = {
      id: `custom-station-${Date.now()}`,
      name: "My Custom Lofi Station",
      provider: "Custom Live Stream",
      streamUrl: "https://stream.example.com/lofi",
      badge: "Custom Lofi",
      gradient: "from-purple-900/60 via-indigo-900/50 to-slate-900/70",
    };
    onLofiStationsChange([...(lofiStations || []), newStation]);
  };

  const handleRemoveStation = (id) => {
    if (!onLofiStationsChange) return;
    if ((lofiStations || []).length <= 1) {
      alert("At least one station must remain in the player.");
      return;
    }
    const filtered = (lofiStations || []).filter((st) => st.id !== id);
    onLofiStationsChange(filtered);
  };

  const handleResetStations = () => {
    if (!onLofiStationsChange) return;
    onLofiStationsChange(DEFAULT_LOFI_STATIONS);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert("Please choose a video/GIF under 15MB for optimal browser performance.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onSongCustomVideoChange({
        dataUrl: String(reader.result),
        name: file.name,
        type: file.type.startsWith("video/") ? "video" : "image",
      });
    };
    reader.readAsDataURL(file);
  };

  const videoSrc = typeof songCustomVideo === "string" ? songCustomVideo : songCustomVideo?.dataUrl;

  return (
    <div className="flex flex-col gap-6">
      {/* Song Player */}
      <CardContainer
        title="Song Player Settings"
        description="24/7 Lofi live streaming radio from dedicated servers. Use Next/Prev controls to switch streaming services, or upload a custom video for the player container."
      >
        <div className="flex flex-col gap-5 pt-3 border-t border-white/10">
          {/* Custom Player Video Background */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="ri-vidicon-line text-sm text-[color:var(--theme)]" />
                <span className="text-white/90 text-xs font-gilroy-bold">Custom Video / GIF Background</span>
              </div>
              {songCustomVideo && (
                <button
                  type="button"
                  onClick={() => onSongCustomVideoChange(null)}
                  className="text-[11px] text-white/60 hover:text-white underline cursor-pointer transition-colors"
                >
                  Remove Background
                </button>
              )}
            </div>
            <p className="text-white/50 text-[11px] font-gilroy-medium leading-relaxed">
              Upload a video/GIF file (.mp4, .webm, .gif) or paste an online video / GIF link URL to display inside the Song Player container.
            </p>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*,image/gif,image/webp"
              onChange={handleVideoUpload}
              className="hidden"
            />

            <div className="flex flex-col gap-2.5 mt-1">
              <InputField
                value={videoSrc && !videoSrc.startsWith("data:") ? videoSrc : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val.trim()) {
                    onSongCustomVideoChange(null);
                  } else {
                    const isVid = Boolean(val.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i));
                    onSongCustomVideoChange({
                      dataUrl: val.trim(),
                      name: "Online Link",
                      type: isVid ? "video" : "image",
                    });
                  }
                }}
                placeholder="Paste direct video URL or .gif link (e.g. https://.../lofi.mp4)"
                className="w-full"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-gilroy-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
                  title="Upload local file"
                >
                  <i className="ri-folder-open-line text-sm" />
                  <span>Upload Local Video / GIF File</span>
                </button>
              </div>

              {videoSrc && (
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 mt-1">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-12 w-20 rounded-xl overflow-hidden border border-white/20 bg-black/60 relative shrink-0 shadow-md">
                      {songCustomVideo?.type?.startsWith("video/") || videoSrc.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || videoSrc.startsWith("data:video/") ? (
                        <video src={videoSrc} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                      ) : (
                        <img src={videoSrc} alt="Preview" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-xs font-gilroy-bold truncate">
                          {songCustomVideo?.name || "Active Background"}
                        </p>
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-gilroy-bold text-white/70 uppercase">
                          {videoSrc.startsWith("data:") ? "Local File" : "Web Link"}
                        </span>
                      </div>
                      <p className="text-white/40 text-[10.5px] font-gilroy-medium truncate mt-0.5">
                        {videoSrc.startsWith("data:") ? "Local File Upload" : videoSrc}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSongCustomVideoChange(null)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400 border border-white/10 transition-colors shrink-0"
                    title="Remove Video Background"
                  >
                    <i className="ri-delete-bin-6-line text-sm" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 24/7 Lofi Stream Stations Manager */}
          <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <i className="ri-radio-2-line text-sm text-[color:var(--theme)]" />
                  <span className="text-white/90 text-xs font-gilroy-bold">Manage 24/7 Lofi Live Stream Stations</span>
                </div>
                <p className="text-white/50 text-[11px] font-gilroy-medium mt-0.5">
                  Edit station names, badge labels, or audio stream URLs. Click Next/Prev in the player to cycle through them.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetStations}
                className="text-[11px] text-white/60 hover:text-white underline cursor-pointer transition-colors shrink-0 ml-2"
              >
                Reset Default Stations
              </button>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto scrollbar-hide pr-1 mt-1">
              {(lofiStations || []).map((station, idx) => (
                <div
                  key={station.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-black/25 border border-white/10 hover:border-white/20 transition-all shadow-sm group"
                >
                  <div className="h-9 w-9 rounded-xl bg-[color:var(--theme)]/20 border border-white/15 flex items-center justify-center shrink-0 shadow-inner">
                    <span className="text-[11px] font-gilroy-bold text-white/90">#{idx + 1}</span>
                  </div>

                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <InputField
                      value={station.name || ""}
                      onChange={(e) => handleUpdateStation(station.id, "name", e.target.value)}
                      placeholder="Station Name"
                      className="w-full"
                    />
                    <InputField
                      value={station.streamUrl || ""}
                      onChange={(e) => handleUpdateStation(station.id, "streamUrl", e.target.value)}
                      placeholder="Stream URL (https://...)"
                      className="w-full"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveStation(station.id)}
                    className="h-9 w-9 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 border border-white/10 cursor-pointer transition-all flex items-center justify-center shrink-0 active:scale-95"
                    title="Remove Station"
                  >
                    <i className="ri-delete-bin-6-line text-sm" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddStation}
                className="w-full py-3 rounded-2xl bg-[color:var(--theme)]/30 hover:bg-[color:var(--theme)]/50 border border-white/20 text-xs text-white font-gilroy-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] shadow-md mt-1"
              >
                <i className="ri-add-line text-base" />
                <span>Add Custom Lofi Station</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div>
              <span className="text-white/90 text-xs font-gilroy-medium">Auto-Play Lofi Stream</span>
              <p className="text-white/50 text-[11px] font-gilroy-medium">Automatically start streaming music when dashboard opens</p>
            </div>
            <Toggle checked={songAutoPlay} onChange={onSongAutoPlayChange} />
          </div>
        </div>
      </CardContainer>
    </div>
  );
};
