import { z } from 'zod';

// Validation removed as per user request - relaxed schema
export const routeInfoSchema = z.object({
  average_flight_time: z.string().optional().or(z.literal("")),
  distance: z.string().optional().or(z.literal("")),
  cheapest_month: z.string().optional().or(z.literal("")),
  daily_flights: z.union([z.number(), z.string(), z.null()]).optional(),
});

export const seoSchema = z.object({
  title: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  canonical_url: z.string().url().optional().or(z.literal("")),
  schema_markup: z.string().optional().or(z.literal("")),
  robots: z.object({
    no_index: z.boolean().optional(),
    no_follow: z.boolean().optional(),
    no_archive: z.boolean().optional(),
    no_image_index: z.boolean().optional(),
    no_snippet: z.boolean().optional(),
  }).optional(),
});

export const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const mediaGallerySchema = z.object({
  id: z.string(),
  url: z.string(),
  type: z.enum(['image', 'video']),
  alt: z.string().optional(),
  thumbnail: z.string().optional(),
});

export const richDescriptionSchema = z.object({
  content: z.string(),
  sections: z.array(z.object({
    heading: z.string(),
    content: z.string(),
    expanded: z.boolean().optional(),
  })).optional(),
});

export const routeSchema = z.object({
  departure_airport: z.string().min(3).max(3),
  arrival_airport: z.string().min(3).max(3),
  route_info: routeInfoSchema.optional(),
  seo_settings: seoSchema.optional(),
  faqs: z.array(faqSchema).optional(),
  media_gallery: z.array(mediaGallerySchema).optional(),
  rich_description: richDescriptionSchema.optional(),
  // Add other fields as needed for complete validation
});

export type RouteInfoInput = z.infer<typeof routeInfoSchema>;
export type RouteInput = z.infer<typeof routeSchema>;
