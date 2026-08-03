import React from 'react';

export interface ContentSectionProps {
  badgeText?: string;
  title?: string;
  description?: string;
  tags?: string[];
}

export function ContentSection({
  badgeText = "Editorial Collection",
  title = "Curated Wardrobe Architecture",
  description = "A minimalist approach to personal style—high-contrast typography, strict 4px geometry, and automated AI outfit pairing.",
  tags = ["Minimalist", "WCAG AAA Compliant", "Editorial Style", "Gemini AI"]
}: ContentSectionProps) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      {/* Pill Badge (Passes AAA 8.4:1) */}
      <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 border border-neutral-200">
        {badgeText}
      </span>

      {/* Main Title with Tight Leading */}
      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 leading-tight">
        {title}
      </h1>

      {/* Relaxed Body Copy (Passes AA 4.6:1) */}
      <p className="mt-3 text-base text-neutral-600 leading-relaxed">
        {description}
      </p>

      {/* Tag Badges */}
      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-neutral-100 border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700"
          >
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}
