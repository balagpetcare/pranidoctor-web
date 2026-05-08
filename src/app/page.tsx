import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-lg flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Prani Doctor</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Configure{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          DATABASE_URL
        </code>{" "}
        and{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          ADMIN_JWT_SECRET
        </code>
        , then run migrations and seed.
      </p>
      <ul className="list-inside list-disc text-sm text-zinc-700 dark:text-zinc-300">
        <li>
          <Link className="underline" href="/admin">
            Admin dashboard
          </Link>
        </li>
        <li>
          <Link className="underline" href="/admin/login">
            Admin login
          </Link>
        </li>
        <li>
          <Link className="underline" href="/api/admin/health">
            GET /api/admin/health
          </Link>
        </li>
        <li>
          <Link className="underline" href="/api/mobile/health">
            GET /api/mobile/health
          </Link>
        </li>
      </ul>
    </main>
  );
}
