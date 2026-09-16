"use client";

import { memo, useState, FormEvent } from "react";

function ContactComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("https://formsubmit.co/ajax/lucaspmluz@hotmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
          _captcha: "false",
          _template: "table",
        }),
      });

      const result = await res.json();
      if (result.success === "true" || result.success === true) {
        setSent(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full bg-black border border-white/20 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none transition-all duration-200 focus:border-red-600 focus:border-2 rounded-2xl";

  return (
    <section id="contact" className="relative bg-black px-6 py-24">
      {/* Section header */}
      <div className="mx-auto w-full max-w-6xl mb-16">
        <div className="flex items-center gap-4">
          <span className="block w-1 h-12 bg-red-700" />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-red-700 font-semibold">Contact</p>
            <h2 className="mt-2 text-4xl md:text-5xl font-bold text-white leading-tight">
              Let&apos;s work together
            </h2>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 border-t border-white/10 pt-12">

        {/* Left — info */}
        <div className="space-y-8">
          <p className="text-white/70 text-sm leading-relaxed">
            Have a project or opportunity? Reach out and I&apos;ll get back to you soon.
          </p>

          <div className="space-y-6">
            {/* Email */}
            <div className="border-l-2 border-red-700 pl-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-red-700 font-semibold mb-1">Email</p>
              <a
                href="mailto:lucaspmluz@hotmail.com"
                className="text-sm text-white hover:text-red-600 transition-colors duration-300"
              >
                lucaspmluz@hotmail.com
              </a>
            </div>

            {/* LinkedIn */}
            <div className="border-l-2 border-red-700 pl-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-red-700 font-semibold mb-1">LinkedIn</p>
              <a
                href="https://www.linkedin.com/in/lucas-luz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white hover:text-red-700 transition-colors duration-300"
              >
                linkedin.com/in/lucas-luz
              </a>
            </div>

            {/* GitHub */}
            <div className="border-l-2 border-red-700 pl-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-red-700 font-semibold mb-1">GitHub</p>
              <a
                href="https://github.com/Luz-lucas"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white hover:text-red-700 transition-colors duration-300"
              >
                github.com/Luz-lucas
              </a>
            </div>
          </div>
        </div>

        {/* Right — form or success */}
        {sent ? (
          <div className="flex flex-col justify-center gap-6 border-2 border-red-600 bg-red-600/10 backdrop-blur-sm p-10 rounded-2xl shadow-lg shadow-red-600/20">
            <div className="text-6xl font-black text-red-600">✓</div>
            <div>
              <p className="text-white text-3xl font-black">Message sent</p>
              <p className="text-white/70 text-base mt-2 font-semibold">I&apos;ll get back to you soon.</p>
            </div>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-xs uppercase tracking-widest text-red-700 hover:text-red-600 transition-colors w-fit font-semibold"
            >
              Send another →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name + Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.3em] text-white font-black">Name</label>
                <input type="text" name="name" placeholder="Your name" required className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.3em] text-white font-black">Email</label>
                <input type="email" name="email" placeholder="your@email.com" required className={inputClass} />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.3em] text-white font-black">Subject</label>
              <input type="text" name="subject" placeholder="What's this about?" required className={inputClass} />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.3em] text-white font-black">Message</label>
              <textarea
                name="message"
                rows={5}
                placeholder="Tell me about your project..."
                required
                className={`${inputClass} resize-y min-h-[140px]`}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-600 font-black bg-red-600/20 px-4 py-3 rounded-2xl border-2 border-red-600">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 px-8 py-4 text-sm font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl shadow-lg shadow-red-600/40 hover:shadow-red-600/60 border-2 border-red-600 hover:border-red-700"
            >
              {isLoading ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}

      </div>
    </section>
  );
}

export const Contact = memo(ContactComponent);
