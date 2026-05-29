import { redirect } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export default async function LegacyFeedItemEditRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/admin/feed-ecosystem/items/${id}/edit`);
}
