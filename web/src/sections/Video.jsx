import React, { useEffect, useRef } from "react";
import { useLiquidGlass } from "../utils/useLiquidGlass";

const Video = () => {
  const videoRef = useRef(null);

  // Real liquid glass physics on the macOS window frame
  const windowGlassRef = useLiquidGlass({
    scale: -112,
    chroma: 6,
    blur: 6,
    saturate: 1.8,
  });

  // Ensure robust autoplay and loop playback across all modern browsers
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.loop = true;

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay fallback: re-attempt on first user interaction or scroll
          const handleFirstInteraction = () => {
            if (videoRef.current) {
              videoRef.current.play();
            }
            window.removeEventListener("click", handleFirstInteraction);
            window.removeEventListener("scroll", handleFirstInteraction);
          };
          window.addEventListener("click", handleFirstInteraction);
          window.addEventListener("scroll", handleFirstInteraction);
        });
      }
    }
  }, []);

  const VIDEO_URL = "https://github.com/user-attachments/assets/ee133631-92e3-42fd-bb24-6e94da42a7a8";

  return (
    <section className="relative w-full bg-black flex flex-col items-center justify-start pb-8 md:pb-12 z-20 select-none">
      {/* macOS Window Card bleeding upwards into Hero and extending into Video */}
      <div
        ref={windowGlassRef}
        className="relative -mt-32 sm:-mt-44 md:-mt-26 w-[94%] max-w-5xl lg:max-w-5xl liquid-glass !rounded-[20px] p-3 sm:p-6 z-20 transition-all duration-300"
      >
        {/* macOS Window Titlebar */}
        <div className="flex items-center justify-between pb-5">
          {/* Traffic Light Buttons: Close, Minimize, Expand */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 shadow-sm cursor-pointer hover:opacity-80 transition-opacity" />
            <div className="w-4 h-4 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 shadow-sm cursor-pointer hover:opacity-80 transition-opacity" />
            <div className="w-4 h-4 rounded-full bg-[#27c93f] border border-[#1aab29]/50 shadow-sm cursor-pointer hover:opacity-80 transition-opacity" />
          </div>
        </div>

        {/* Inner Window Display Container */}
        <div className="relative w-full aspect-video rounded-[10px] overflow-hidden bg-zinc-950 border border-white/10 shadow-inner group">
          {/* App Preview Video */}
          <video
            ref={videoRef}
            src={VIDEO_URL}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-center"
          >
            <source src={VIDEO_URL} type="video/mp4" />
          </video>

          {/* Subtle Ambient Vignette / Inner Shadow */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]" />
        </div>
      </div>

      {/* Available For These Browsers Bar with Full-Width Horizontal Grid Lines and Corner Circles */}
      <div className="w-full mt-10 sm:mt-14 md:mt-16 flex flex-col items-center">
        {/* Section Tagline */}
        <p className="text-[10px] sm:text-[11px] font-syne font-bold text-zinc-500 uppercase mb-4 text-center">
          AVAILABLE FOR THESE BROWSERS
        </p>

        {/* Full-width strip with horizontal lines stretching edge to edge */}
        <div className="relative w-full border-y border-white/10">
          {/* Inner bounded container with vertical borders and corner node circles */}
          <div className="relative max-w-4xl lg:max-w-5xl mx-auto border-x border-white/10 py-7 px-8 sm:px-16 flex items-center justify-around md:justify-between">
            {/* 4 Corner Intersection Circle Nodes */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-400/50 shadow-sm pointer-events-none" />
            <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-400/50 shadow-sm pointer-events-none" />
            <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-400/50 shadow-sm pointer-events-none" />
            <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-400/50 shadow-sm pointer-events-none" />

            {/* Firefox */}
            <a
              href="https://www.mozilla.org/firefox/new/"
              target="_blank"
              rel="noopener noreferrer"
              title="Download Mozilla Firefox"
              className="text-zinc-500 hover:text-zinc-200 transition-all duration-300 hover:scale-110 flex items-center justify-center"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10"
              >
                <path d="M21.2827 8.26012C20.8473 7.213 19.9656 6.08244 19.2733 5.72516C19.7521 6.6637 20.1656 7.72752 20.2895 8.78174C19.1569 5.95869 17.2363 4.82021 15.6678 2.34173C15.4719 2.03155 15.2431 1.61425 15.1225 1.32928C12.8952 2.63386 11.972 4.91762 11.7347 6.37128C11.0465 6.41037 10.3724 6.58239 9.7497 6.87781C9.63641 6.93386 9.57928 7.07722 9.62296 7.19583C9.67063 7.33373 9.83148 7.40294 9.9644 7.34275C10.599 7.0433 11.2978 6.8858 11.9991 6.87856C13.8038 6.86599 15.517 7.86963 16.4149 9.43745C15.88 9.06171 14.9224 8.69063 13.9997 8.8511C17.6025 10.6522 16.6353 16.8547 11.6429 16.6205C9.62869 16.5384 7.69791 14.9706 7.51696 12.8904C7.51696 12.8904 7.97932 11.1676 10.8277 11.1676C11.1356 11.1676 12.0159 10.3084 12.0323 10.0592C12.0285 9.97778 10.2852 9.28436 9.60553 8.61473C9.30353 8.3172 9.01156 7.99714 8.65778 7.75909C8.42944 6.96033 8.41973 6.11491 8.62964 5.31111C7.6007 5.77968 6.7957 6.52028 6.21389 7.1742C5.81676 6.67125 5.84482 5.01215 5.86745 4.66575C4.9941 5.13081 4.22465 5.9396 3.6187 6.80337C2.59006 8.26122 1.99707 10.1738 1.99707 11.9845C1.99707 17.5158 6.46835 21.9997 12.0002 21.9997C16.9545 21.9997 21.0815 18.4032 21.8869 13.6792C22.128 11.8573 21.9935 9.97004 21.2827 8.26012Z" />
              </svg>
            </a>

            {/* Brave (Official Lion Mark) */}
            <a
              href="https://brave.com/download/"
              target="_blank"
              rel="noopener noreferrer"
              title="Download Brave Browser"
              className="text-zinc-500 hover:text-zinc-200 transition-all duration-300 hover:scale-110 flex items-center justify-center"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10"
              >
                <path d="M15.68 0l2.096 2.38s1.84-.512 2.709.358c.868.87 1.584 1.638 1.584 1.638l-.562 1.381.715 2.047s-2.104 7.98-2.35 8.955c-.486 1.919-.818 2.66-2.198 3.633-1.38.972-3.884 2.66-4.293 2.916-.409.256-.92.692-1.38.692-.46 0-.97-.436-1.38-.692a185.796 185.796 0 01-4.293-2.916c-1.38-.973-1.712-1.714-2.197-3.633-.247-.975-2.351-8.955-2.351-8.955l.715-2.047-.562-1.381s.716-.768 1.585-1.638c.868-.87 2.708-.358 2.708-.358L8.321 0h7.36zm-3.679 14.936c-.14 0-1.038.317-1.758.69-.72.373-1.242.637-1.409.742-.167.104-.065.301.087.409.152.107 2.194 1.69 2.393 1.866.198.175.489.464.687.464.198 0 .49-.29.688-.464.198-.175 2.24-1.759 2.392-1.866.152-.108.254-.305.087-.41-.167-.104-.689-.368-1.41-.741-.72-.373-1.617-.69-1.757-.69zm0-11.278s-.409.001-1.022.206-1.278.46-1.584.46c-.307 0-2.581-.434-2.581-.434S4.119 7.152 4.119 7.849c0 .697.339.881.68 1.243l2.02 2.149c.192.203.59.511.356 1.066-.235.555-.58 1.26-.196 1.977.384.716 1.042 1.194 1.464 1.115.421-.08 1.412-.598 1.776-.834.364-.237 1.518-1.19 1.518-1.554 0-.365-1.193-1.02-1.413-1.168-.22-.15-1.226-.725-1.247-.95-.02-.227-.012-.293.284-.851.297-.559.831-1.304.742-1.8-.089-.495-.95-.753-1.565-.986-.615-.232-1.799-.671-1.947-.74-.148-.068-.11-.133.339-.175.448-.043 1.719-.212 2.292-.052.573.16 1.552.403 1.632.532.079.13.149.134.067.579-.081.445-.5 2.581-.541 2.96-.04.38-.12.63.288.724.409.094 1.097.256 1.333.256s.924-.162 1.333-.256c.408-.093.329-.344.288-.723-.04-.38-.46-2.516-.541-2.961-.082-.445-.012-.45.067-.579.08-.129 1.059-.372 1.632-.532.573-.16 1.845.009 2.292.052.449.042.487.107.339.175-.148.069-1.332.508-1.947.74-.615.233-1.476.49-1.565.986-.09.496.445 1.241.742 1.8.297.558.304.624.284.85-.02.226-1.026.802-1.247.95-.22.15-1.413.804-1.413 1.169 0 .364 1.154 1.317 1.518 1.554.364.236 1.355.755 1.776.834.422.079 1.08-.4 1.464-1.115.384-.716.039-1.422-.195-1.977-.235-.555.163-.863.355-1.066l2.02-2.149c.341-.362.68-.546.68-1.243 0-.697-2.695-3.96-2.695-3.96s-2.274.436-2.58.436c-.307 0-.972-.256-1.585-.461-.613-.205-1.022-.206-1.022-.206z" />
              </svg>
            </a>

            {/* Chrome */}
            <a
              href="https://www.google.com/chrome/"
              target="_blank"
              rel="noopener noreferrer"
              title="Download Google Chrome"
              className="text-zinc-500 hover:text-zinc-200 transition-all duration-300 hover:scale-110 flex items-center justify-center"
            >
              <i className="ri-chrome-fill text-3xl sm:text-4xl md:text-[2.6rem]" />
            </a>

            {/* Edge */}
            <a
              href="https://www.microsoft.com/edge/download"
              target="_blank"
              rel="noopener noreferrer"
              title="Download Microsoft Edge"
              className="text-zinc-500 hover:text-zinc-200 transition-all duration-300 hover:scale-110 flex items-center justify-center"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10"
              >
                <path d="M13.817 21.8353C13.7106 21.8384 13.6049 21.84 13.5 21.84 12.4265 21.84 11.1264 21.2191 10.0806 20.0816 9.04473 18.9549 8.30005 17.363 8.30005 15.5 8.30005 14.0815 8.81836 12.9347 9.50108 12.0942 9.55796 14.5796 11.8588 17.7 16.5 17.7 18.1779 17.7 19.2172 17.2476 19.7794 17.0029 19.9878 16.9122 20.1306 16.85 20.2161 16.85 20.4 16.85 20.5 16.95 20.5 17.15 20.5 17.3366 20.3987 17.4712 20.0742 17.9023L20.0007 18C18.5223 19.9682 16.3345 21.3732 13.817 21.8353ZM10.7016 21.9165C5.79216 21.2799 2 17.0828 2 12 2 10.7202 2.74053 9.67125 3.89749 8.91922 5.05841 8.16463 6.58675 7.75 8 7.75 10.2764 7.75 11.6347 8.51511 12.4284 9.39698 12.4785 9.45269 12.5265 9.50903 12.5725 9.56586 12.3887 9.52278 12.197 9.5 12 9.5L11.996 9.5C11.5608 9.50069 11.1518 9.61255 10.7956 9.80869 10.7171 9.84506 10.6385 9.88421 10.5603 9.92588 10.0565 10.1942 9.52919 10.587 9.04942 11.0938 8.08779 12.1096 7.30005 13.6034 7.30005 15.5 7.30005 17.637 8.15534 19.4651 9.34445 20.7584 9.75828 21.2085 10.2178 21.5991 10.7016 21.9165ZM13.8515 13.5956C14.1178 13.3151 14.5 12.9123 14.5 12 14.5 11.1394 14.1625 9.82898 13.1716 8.72802 12.1653 7.60989 10.5236 6.75 8 6.75 6.41325 6.75 4.69159 7.21037 3.35251 8.08078 3.07269 8.26266 2.80734 8.46421 2.5626 8.68489 3.93023 4.7914 7.63913 2 12 2 17.5228 2 22 6 22 10.5 22 13.3 19.8 15.35 17 15.35 15 15.35 13.6 14.7 13.6 14 13.6 13.8607 13.7092 13.7456 13.8515 13.5956Z" />
              </svg>
            </a>

            {/* Opera */}
            <a
              href="https://www.opera.com/download"
              target="_blank"
              rel="noopener noreferrer"
              title="Download Opera Browser"
              className="text-zinc-500 hover:text-zinc-200 transition-all duration-300 hover:scale-110 flex items-center justify-center"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10"
              >
                <path d="M8.71014 6.365C7.60348 7.67 6.88848 9.60083 6.83848 11.765V12.235C6.88931 14.4 7.60348 16.3283 8.71014 17.6342C10.1443 19.4975 12.276 20.6792 14.6593 20.6792C16.1226 20.6792 17.4926 20.2317 18.6651 19.4533C16.9001 21.0383 14.5626 22 12.001 22C11.841 22 11.6818 21.9967 11.526 21.9883C6.22098 21.7408 2.00098 17.3633 2.00098 12C2.00098 6.47583 6.47848 2 12.001 2H12.0385C14.5843 2.01 16.9051 2.97167 18.666 4.54583C17.4926 3.77083 16.1235 3.32 14.6576 3.32C12.276 3.32 10.1435 4.50333 8.70764 6.365H8.71014ZM22.001 12C22.001 14.9633 20.7135 17.6233 18.666 19.4542C16.101 20.7042 13.711 19.83 12.9193 19.2833C15.4385 18.73 17.3418 15.6833 17.3418 12C17.3418 8.315 15.4393 5.27083 12.9193 4.71667C13.7101 4.17167 16.101 3.2975 18.666 4.54583C20.7135 6.375 22.001 9.0375 22.001 12Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Video;
