export function InsightWidget() {
  return (
    <section className="bg-secondary/5 rounded-[24px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 border border-secondary/10">
      <div className="flex-1">
        <span className="text-secondary font-bold text-xs tracking-widest uppercase block mb-4">
          Curated Insight
        </span>
        <h2 className="font-headline text-4xl text-on-surface leading-tight mb-6 italic">
          Embrace the quiet moments of the first trimester. Your body is building a masterpiece.
        </h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-secondary text-on-secondary px-8 h-12 rounded-full font-bold hover:opacity-90 transition-all active:scale-95 shadow-sm">
            Read Journal
          </button>
          <button className="text-secondary font-bold px-8 h-12 rounded-full hover:bg-secondary/10 transition-all border border-transparent hover:border-secondary/20">
            Daily Affirmation
          </button>
        </div>
      </div>
      <div className="w-full md:w-1/3 flex-shrink-0">
        <img 
          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop" 
          alt="Curated insight"
          className="w-full h-64 object-cover rounded-[24px] shadow-2xl border border-secondary/10 rotate-3 hover:rotate-0 transition-transform duration-500"
        />
      </div>
    </section>
  );
}
