"use client";

export function Filters({ activeCategory, onCategoryChange, categories }) {
  return (
    <section className="mb-7">
      <div className="flex flex-wrap gap-2.5" aria-label="Flair categories">
        {categories.map((category) => {
          const isActive = activeCategory === category.key;
          return (
            <button
              key={category.key}
              type="button"
              onClick={() => onCategoryChange(category.key)}
              className="inline-flex items-center justify-center min-h-[42px] px-4 border border-transparent rounded-full text-[0.84rem] font-extrabold transition-all hover:-translate-y-[1px]"
              style={{
                backgroundColor: isActive ? category.color : `color-mix(in srgb, ${category.color} 12%, white)`,
                borderColor: `color-mix(in srgb, ${category.color} 35%, #cbd5e1)`,
                color: isActive ? "#ffffff" : `color-mix(in srgb, ${category.color} 74%, #0f172a)`
              }}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
