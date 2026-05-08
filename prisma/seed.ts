import bcrypt from "bcryptjs";

import { UserRole, UserStatus } from "../src/generated/prisma/client";
import { disconnectPrisma, prisma } from "../src/lib/prisma";

async function main(): Promise<void> {  const adminEmail = "admin@pranidoctor.local";
  const adminPasswordPlain = "ChangeMe!Admin123";

  const passwordHash = bcrypt.hashSync(adminPasswordPlain, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
    update: {
      passwordHash,
      status: UserStatus.ACTIVE,
      role: UserRole.ADMIN,
    },
  });

  await prisma.adminProfile.upsert({
    where: { userId: adminUser.id },
    create: {
      userId: adminUser.id,
      displayName: "Prani Doctor Admin",
    },
    update: {
      displayName: "Prani Doctor Admin",
    },
  });

  const categories = [
    {
      name: "General consultation",
      slug: "general-consultation",
      description: "Routine veterinary consultation",
    },
    {
      name: "Emergency visit",
      slug: "emergency-visit",
      description: "Urgent on-site or clinic visit",
    },
    {
      name: "Vaccination",
      slug: "vaccination",
      description: "Preventive vaccination services",
    },
    {
      name: "Livestock health check",
      slug: "livestock-health-check",
      description: "Field visit for cattle, goats, and other livestock",
    },
  ];

  for (const c of categories) {
    await prisma.serviceCategory.upsert({
      where: { slug: c.slug },
      create: c,
      update: { name: c.name, description: c.description },
    });
  }

  const rootArea = await prisma.area.upsert({
    where: { slug: "bangladesh" },
    create: {
      name: "Bangladesh (placeholder)",
      slug: "bangladesh",
      metadataJson: { note: "Root coverage placeholder for MVP seed" },
    },
    update: {
      name: "Bangladesh (placeholder)",
    },
  });

  await prisma.area.upsert({
    where: { slug: "dhaka-division" },
    create: {
      name: "Dhaka Division (placeholder)",
      slug: "dhaka-division",
      parentId: rootArea.id,
      metadataJson: { division: "Dhaka" },
    },
    update: {
      name: "Dhaka Division (placeholder)",
      parentId: rootArea.id,
    },
  });

  await prisma.setting.upsert({
    where: { key: "app.name" },
    create: {
      key: "app.name",
      valueJson: { value: "Prani Doctor" },
    },
    update: {
      valueJson: { value: "Prani Doctor" },
    },
  });

  console.info(
    "Seed complete. Admin:",
    adminEmail,
    "| Dev password:",
    adminPasswordPlain,
  );
}

main()
  .then(async () => {
    await disconnectPrisma();
  })
  .catch(async (e: unknown) => {
    console.error(e);
    await disconnectPrisma();
    process.exit(1);
  });