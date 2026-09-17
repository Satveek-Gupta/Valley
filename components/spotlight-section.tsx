"use client";

import { useState, useRef } from "react";
import { Sparkles, Volume2, VolumeX, Play, Pause, RotateCcw } from "lucide-react";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";

export default function SpotlightSection() {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleSound = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      // Ensure video is playing when unmuted
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <section className="relative w-full bg-brand-violet text-white py-20 sm:py-28 overflow-hidden">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.12}
        duration={4}
        repeatDelay={1}
        className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)] inset-0 text-white"
      />

      {/* Background Ghosted Typography */}
      <div className="absolute inset-0 select-none pointer-events-none flex flex-col justify-center items-center opacity-15 overflow-hidden">
        <span className="font-display text-8xl sm:text-[160px] lg:text-[220px] font-black uppercase tracking-wide leading-none text-white whitespace-nowrap">
          STUDENT CABINET
        </span>
        <span className="font-display text-8xl sm:text-[160px] lg:text-[220px] font-black uppercase tracking-wide leading-none text-white whitespace-nowrap">
          THE ARCHITECTS
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Headline */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/30 border border-white/20 text-brand-lime text-xs font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OFFICIAL INTRO</span>
          </div>
          <h2 className="font-display text-4xl sm:text-7xl font-black uppercase tracking-wide leading-none text-white">
            STUDENT CABINET
          </h2>
          <p className="mt-3 text-sm sm:text-base font-semibold text-white/80 max-w-xl mx-auto uppercase tracking-wide">
            The minds and relentless execution behind Cabinet Valley. Get an inside look at the Student Cabinet driving India's most ambitious student festival.
          </p>
        </div>

        {/* Video Player Card */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-3xl sm:max-w-4xl rounded-3xl overflow-hidden bg-black border-4 border-white/30 shadow-2xl shadow-black/50">
            
            {/* Inline Video */}
            <video
              ref={videoRef}
              src="/videos/Student_Cabinet_THE_GOAT.mp4"
              muted={isMuted}
              loop
              autoPlay
              playsInline
              preload="auto"
              className="w-full aspect-[16/9] object-cover bg-black block"
            />

            {/* Video Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              
              {/* Left: Info */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-lime block mb-1">
                  OFFICIAL FESTIVAL INTRO
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-white leading-tight">
                  STUDENT CABINET · CABINET VALLEY
                </h3>
              </div>

              {/* Right: Controls & Sound Button */}
              <div className="flex items-center gap-2.5">
                
                {/* Play / Pause Toggle */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                {/* Restart Video */}
                <button
                  type="button"
                  onClick={handleRestart}
                  className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
                  aria-label="Restart video"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Primary Sound Toggle Button */}
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer ${
                    isMuted
                      ? "bg-brand-lime hover:bg-white text-black font-bold"
                      : "bg-white/20 hover:bg-white text-white hover:text-black border border-white/30 backdrop-blur-md"
                  }`}
                  aria-label={isMuted ? "Unmute video sound" : "Mute video sound"}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-4 h-4 text-black" />
                      <span>TAP FOR SOUND</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-brand-lime" />
                      <span>SOUND ON (MUTE)</span>
                    </>
                  )}
                </button>

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
