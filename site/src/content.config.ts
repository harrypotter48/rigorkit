import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
export const collections = {
  docs: defineCollection({
    loader: docsLoader({ generateId: ({ entry }) => entry.replace(/\.(md|mdx|mdoc)$/, '') }),
    schema: docsSchema({ extend: z.object({ sourcePath: z.string().optional(), sourceUrl: z.string().optional(), sourceHasH1: z.boolean().optional(), landing: z.boolean().optional() }) }),
  }),
};
