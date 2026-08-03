"use client";

import { useState } from "react";
import { Mail, Minus, Plus } from "lucide-react";
import { FAQ_ITEMS } from "../content/faq";
import { RevealOnScroll } from "../components/animations/RevealOnScroll";
import { cn } from "../lib/utils/cn";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="px-8 py-24">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 md:grid-cols-[0.9fr_1.1fr]">
        <RevealOnScroll>
          <h2 className="font-display text-[clamp(28px,4vw,40px)] font-extrabold leading-[1.15] tracking-[-0.01em] text-ink">
            Frequently Asked
            <br />
            Question
          </h2>
          <div className="mt-10 flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-pink/15 text-pink">
              <Mail size={15} />
            </span>
            <div>
              <div className="text-sm font-semibold text-ink">Still have a question?</div>
              <div className="text-sm text-ink-2">
                Feel free to contact us{" "}
                <a href="mailto:ctc.uonbi@gmail.com" className="text-green underline underline-offset-2">
                  ctc.uonbi@gmail.com
                </a>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = i === openIndex;
            return (
              <div
                key={item.question}
                className={cn(
                  "overflow-hidden rounded-[var(--radius-card-sm)] transition-colors",
                  isOpen ? "bg-green text-white" : "bg-cream-2 text-ink",
                )}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-semibold"
                  aria-expanded={isOpen}
                >
                  {item.question}
                  <span
                    className={cn(
                      "flex h-6 w-6 flex-none items-center justify-center rounded-full",
                      isOpen ? "bg-white/20 text-white" : "bg-white text-ink",
                    )}
                  >
                    {isOpen ? <Minus size={13} /> : <Plus size={13} />}
                  </span>
                </button>
                {isOpen && <p className="px-6 pb-5 text-sm leading-relaxed text-white/90">{item.answer}</p>}
              </div>
            );
          })}
        </RevealOnScroll>
      </div>
    </section>
  );
}
