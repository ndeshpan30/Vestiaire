import React from "react";
import { Product } from "./ProductGrid";
import { SkeletonCard } from "./SkeletonCard";

export function ProductGridAsync({
  isLoading,
  products,
}: {
  isLoading: boolean;
  products: Product[];
}) {
  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : safeProducts.map((product, idx) => {
              try {
                const id = product?.id || `product-async-fallback-${idx}`;
                const title = product?.title || 'Garment Item';
                const subtitle = product?.subtitle || '';
                const imageUrl = product?.imageUrl || '/placeholder.png';
                const imageAlt = product?.imageAlt || title;
                const category = product?.category || 'Uncategorized';
                const formality = typeof product?.formality === 'number' ? product.formality : null;

                return (
                  <article
                    key={id}
                    className="group flex flex-col rounded-lg border border-neutral-200 bg-white overflow-hidden transition-all duration-200 hover:border-[#5B1422] hover:shadow-md"
                  >
                    <div className="relative w-full aspect-[4/5] bg-neutral-50 overflow-hidden border-b border-neutral-100">
                      <img
                        src={imageUrl}
                        alt={imageAlt}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="flex flex-col gap-1 p-4 flex-1 justify-between">
                      <div>
                        {category && (
                          <span className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase block mb-1">
                            {category}
                          </span>
                        )}
                        <h3 className="text-sm font-semibold text-neutral-900 leading-snug line-clamp-2">
                          {title}
                        </h3>
                        {subtitle && (
                          <p className="text-xs text-neutral-500 leading-snug mt-1">
                            {subtitle}
                          </p>
                        )}
                      </div>

                      {formality !== null && (
                        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
                          <span>Formality Score</span>
                          <span className="font-semibold text-[#5B1422]">
                            {formality}/10
                          </span>
                        </div>
                      )}
                    </div>
                  </article>
                );
              } catch (err) {
                console.error('Error rendering garment:', product, err);
                return null;
              }
            })}
      </div>
    </main>
  );
}
