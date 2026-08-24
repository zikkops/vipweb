"use client";

export default function Newsletter() {
  return (
    <section className="bg-ink text-paper py-20 md:py-28">
      <div className="container-page">
        <h2 className="text-[44px] sm:text-[56px] lg:text-[70px] leading-none mb-8">
          Newsletter<span className="animate-[color-blink_6s_steps(1)_infinite]">_</span>
        </h2>

        <form className="max-w-md" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            required
            placeholder="Email"
            className="w-full bg-white/10 text-paper placeholder-muted-light text-[16px] px-4 py-4 outline-none focus:bg-white/15 transition-colors"
          />
          <button
            type="submit"
            className="inline-flex items-center bg-paper text-ink px-6 py-3 font-heading text-[16px] uppercase tracking-widest hover:bg-white/80 transition-colors"
          >
            Subscribe
            <span className="animate-[color-blink_3s_steps(1)_infinite]">_</span>
          </button>
        </form>
      </div>
    </section>
  );
}
