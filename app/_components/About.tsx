"use client";

import { memo } from "react";
import Image from "next/image";

function AboutComponent() {
  return (
    <section id="about" className="relative px-6 py-20 bg-black">
      <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative w-full max-w-md mx-auto aspect-[4/5]">
          <Image
            src="/aboutimg.png"
            alt="Lucas working"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain opacity-90"
            quality={100}
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
        </div>
        
        <div className="space-y-8 text-center lg:text-left">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-red-700 font-semibold">About</p>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 text-white">Student & Developer</h2>
          </div>
          
          <div className="space-y-4 text-white/70 leading-relaxed">
            <p>
              Software Engineering student from Minas Gerais, working as a Junior Developer at CP2. I build client-facing apps using React and TypeScript, focusing on responsive, performant interfaces.
            </p>
            <p>
              Skilled in modern front-end tools and expanding into full-stack. I thrive in Agile teams, valuing code reviews and pair programming to deliver high-quality code.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export const About = memo(AboutComponent);
