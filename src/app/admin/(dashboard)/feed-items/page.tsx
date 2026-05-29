import { redirect } from 'next/navigation';

export default function LegacyFeedItemsRedirect() {
  redirect('/admin/feed-ecosystem/items');
}
