import { prisma } from "../lib/prisma.js";
import { VIDEO_TEMPLATE_SEEDS } from "../lib/videoTemplateCatalog.js";

export async function ensureVideoTemplates(): Promise<void> {
  for (const t of VIDEO_TEMPLATE_SEEDS) {
    await prisma.videoTemplate.upsert({
      where: { slug: t.slug },
      create: {
        id: t.id,
        slug: t.slug,
        name: t.name,
        description: t.description,
        config: t.config,
        isActive: true,
      },
      update: {
        name: t.name,
        description: t.description,
        config: t.config,
        isActive: true,
      },
    });
  }
}

export async function listActiveTemplates() {
  await ensureVideoTemplates();
  return prisma.videoTemplate.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}
