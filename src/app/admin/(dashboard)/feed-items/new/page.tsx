import { redirect } from 'next/navigation';

export default function LegacyFeedItemNewRedirect() {
  redirect('/admin/feed-ecosystem/items/new');
}
