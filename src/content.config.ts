// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const collections = {
  recipes: defineCollection({
    loader: glob({ 
      pattern: '**/*.md', 
      base: './src/content/recipes',
      ignore: ['**/_template.md'] // ← исключаем шаблон
    }),
    schema: z.object({
      title: z.string(),
      stage: z.array(
        z.union([
          z.enum(['1','2','3a','3b','4','5','5-pd','5-hd']),
          z.number()
        ])
      ).transform(vals => vals.map(v => String(v))).optional(),
      servings: z.number().optional(),
      prep_time: z.string().optional(),
      nutrients_per_serving: z.object({
        kcal: z.number().optional(),
        protein_g: z.number().optional(),
        fat_g: z.number().optional(),
        carbs_g: z.number().optional(),
        potassium_mg: z.union([z.number(), z.string()]).transform(v => Number(v)).optional(),
        phosphorus_mg: z.union([z.number(), z.string()]).transform(v => Number(v)).optional(),
        sodium_mg: z.union([z.number(), z.string()]).transform(v => Number(v)).optional(),
      }).optional(),
      tags: z.array(z.string()).optional(),
      author: z.string().optional(),
      date_added: z.string().or(z.date()).optional(),
      notes: z.string().optional(),
    }),
  }),
};
