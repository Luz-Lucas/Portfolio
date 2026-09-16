"use client";

import { memo } from "react";
import { FlipWords } from "../../_util/herotxt";

const WORDS = ["intuitive", "responsive", "performant"] as const;

function HeroComponent() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden bg-black">

      <div className="mx-auto w-full max-w-4xl space-y-10 text-center animate-slide-in-top">
        <div className="space-y-8">
          {/* Location badge */}
          <div className="inline-block">
            <p className="text-xs uppercase tracking-[0.35em] text-white border border-white/30 text-white/70 rounded-2xl px-6 py-3 backdrop-blur-sm hover:border-white/50 hover:text-white transition duration-300 font-semibold">
              M I N A S &nbsp; G E R A I S &nbsp; • &nbsp; B R A Z I L
            </p>
          </div>

          {/* Main heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight text-white">
              Junior <span className="text-red-600">Frontend</span> Developer
            </h1>
            <p className="text-2xl md:text-3xl font-light text-white/60">
              Crafting <span className="text-red-700 font-semibold"><FlipWords words={WORDS} /></span> experiences
            </p>
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Software Engineering student building user-centric web experiences. Balancing studies with real-world development at CP2 Junior Company to become a full-stack contributor.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href="#projects"
              className="group relative px-8 py-4 rounded-2xl bg-red-700 text-white font-bold text-center overflow-hidden transition duration-300 hover:bg-red-800 text-sm uppercase tracking-widest"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                View Projects
              </span>
              <div className="absolute inset-0 bg-red-800 -z-10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </a>
            <a
              href="#contact"
              className="px-8 py-4 rounded-2xl border border-white/40 text-white font-semibold text-center hover:border-white hover:bg-white/10 transition duration-300 text-sm uppercase tracking-widest"
            >
              Get in Touch
            </a>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            {["Software Engineering Student", "Agile Enthusiast", "Portuguese • English"].map((tag) => (
              <span key={tag} className="text-xs text-white/60 px-4 py-2 border border-white/20 rounded-2xl hover:border-white/40 hover:text-white transition text-center">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border border-white/30 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-red-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 15a.75.75 0 01-.75-.75v-9.69l-1.72 1.72a.75.75 0 11-1.06-1.06l3-3a.75.75 0 011.06 0l3 3a.75.75 0 11-1.06 1.06l-1.72-1.72v9.69A.75.75 0 0110 15z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

export const Hero = memo(HeroComponent);
