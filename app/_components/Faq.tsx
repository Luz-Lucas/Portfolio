"use client";

import { memo } from "react";

const FAQS = [
  {
    question: "How do you balance college with work at CP2?",
    answer: "Using Agile methodologies, strict time management, and sprint planning helps me efficiently handle coursework and real-world projects.",
  },
  {
    question: "What's your React experience?",
    answer: "Proficient in React hooks, Context API, and Redux, demonstrated through complex projects like e-commerce dashboards and task managers.",
  },
  {
    question: "What is your full-stack approach?",
    answer: "My focus is front-end, but I integrate React with Node.js/Express and databases (MongoDB/PostgreSQL) to build complete applications.",
  },
  {
    question: "How did you achieve a 100/100 Lighthouse score?",
    answer: "By prioritizing code splitting, lazy loading, optimized images, efficient CSS, and smooth animations while meeting accessibility standards.",
  },
];

function FaqComponent() {
  return (
    <section id="faq" className="relative px-6 py-20 bg-black">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        <div className="space-y-4 text-center lg:text-left">
          <p className="text-xs uppercase tracking-[0.35em] text-red-700 font-semibold">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">Questions & Answers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FAQS.map((faq) => (
            <article
              key={faq.question}
              className="rounded-2xl border border-white/10 bg-transparent p-6 space-y-3 hover:border-white/20 transition duration-300"
            >
              <h3 className="text-base font-semibold text-white hover:text-red-700 transition duration-300">{faq.question}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export const Faq = memo(FaqComponent);
