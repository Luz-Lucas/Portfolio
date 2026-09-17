"use client";

import { memo, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { SectionHeading } from "./meia-tinta/SectionHeading";

type Status = "idle" | "sent" | "error";

function ContactLine({
  label,
  href,
  external,
  children,
}: {
  label: string;
  href: string;
  external?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-line pb-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ember-text">
        {label}
      </p>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="focus-ember mt-1 block text-base text-ink transition-colors hover:text-ember-text"
      >
        {children}
      </a>
    </div>
  );
}

/**
 * Formulário embutido na página — sem card, sem caixa. Continua no
 * formsubmit.co (funciona hoje, sem segredo nem infraestrutura extra) mas
 * corrige o que faltava: rótulos de fato associados aos campos, anel de
 * foco em vez de `outline-none`, uma região `aria-live` para o status em
 * vez de substituir o formulário inteiro, foco movido para a mensagem de
 * sucesso/erro, e um honeypot para reduzir spam de bot.
 */
function ContactComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (status !== "idle") statusRef.current?.focus();
  }, [status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    // Honeypot: campo invisível que só um bot preencheria.
    if (formData.get("_honey")) return;

    setIsLoading(true);
    setStatus("idle");

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
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const fieldClass =
    "focus-ember peer w-full border-0 border-b border-line bg-transparent px-0 py-2.5 text-ink placeholder:text-ink-muted/50 transition-colors focus:border-ember-deep";
  const labelClass = "block font-mono text-[11px] uppercase tracking-[0.25em] text-ink-muted";

  return (
    <section id="contact" className="relative px-6 py-24 md:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          number="06"
          eyebrow="Contato"
          align="left"
          title={
            <>
              Vamos <span className="text-ember-text">conversar</span>?
            </>
          }
        />

        <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-4">
            <p className="text-base leading-relaxed text-ink-muted">
              Tem um projeto ou oportunidade? Escreva e eu retorno em breve.
            </p>
            <div className="space-y-6">
              <ContactLine label="E-mail" href="mailto:lucaspmluz@hotmail.com">
                lucaspmluz@hotmail.com
              </ContactLine>
              <ContactLine
                label="LinkedIn"
                href="https://www.linkedin.com/in/lucas-luz-0b0368432/"
                external
              >
                linkedin.com/in/lucas-luz
              </ContactLine>
              <ContactLine
                label="GitHub"
                href="https://github.com/Luz-Lucas"
                external
              >
                github.com/Luz-Lucas
              </ContactLine>
            </div>
          </div>

          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Honeypot — oculto para pessoas e leitores de tela */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="_honey">Não preencha este campo</label>
                <input
                  type="text"
                  id="_honey"
                  name="_honey"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className={labelClass}>
                    Nome
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    placeholder="Seu nome"
                    required
                    autoComplete="name"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className={labelClass}>
                    E-mail
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    placeholder="voce@email.com"
                    required
                    autoComplete="email"
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className={labelClass}>
                  Assunto
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  placeholder="Sobre o que é?"
                  required
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="contact-message" className={labelClass}>
                  Mensagem
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="Conte-me sobre seu projeto..."
                  required
                  className={`${fieldClass} halftone min-h-[160px] resize-y border-b-0 pt-3`}
                />
              </div>

              <p
                ref={statusRef}
                tabIndex={-1}
                role="status"
                aria-live="polite"
                className="min-h-[1.5em] text-sm text-ember-text focus:outline-none"
              >
                {status === "sent" && "Mensagem enviada — retorno em breve."}
                {status === "error" &&
                  "Algo deu errado. Tente novamente ou escreva direto para o e-mail ao lado."}
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="focus-ember inline-flex items-center justify-center rounded-full bg-ember-deep px-10 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-on-ember transition-colors hover:bg-ember disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Enviando..." : "Enviar mensagem"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export const Contact = memo(ContactComponent);
