'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminErrorState } from '@/components/admin-ui/AdminErrorState';
import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { khInputClass, khLabelClass } from '@/components/admin/knowledge-hub/styles';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';
import { cn } from '@/lib/cn';

export function VendorForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await adminFetch('/api/admin/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          nameBn: nameBn.trim() || null,
          phone: phone.trim() || null,
          address: address.trim() || null,
          notes: notes.trim() || null,
          isActive: true,
        }),
      });
      const data = await readAdminJson<{ vendor: { id: string } }>(res);
      router.push(`/admin/feed-ecosystem/vendors/${data.vendor.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'সংরক্ষণ ব্যর্থ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? <AdminErrorState message={error} /> : null}
      <AdminFormSection title="ভেন্ডর তথ্য">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={khLabelClass()}>
            নাম (English)
            <input required value={name} onChange={(e) => setName(e.target.value)} className={khInputClass()} />
          </label>
          <label className={khLabelClass()}>
            নাম (বাংলা)
            <input value={nameBn} onChange={(e) => setNameBn(e.target.value)} className={khInputClass()} />
          </label>
          <label className={khLabelClass()}>
            ফোন
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={khInputClass()} />
          </label>
          <label className={cn('sm:col-span-2', khLabelClass())}>
            ঠিকানা
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={khInputClass()} />
          </label>
          <label className={cn('sm:col-span-2', khLabelClass())}>
            নোট
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={khInputClass()} rows={3} />
          </label>
        </div>
      </AdminFormSection>
      <AdminActionButton type="submit" variant="primary" disabled={saving}>
        {saving ? 'সংরক্ষণ…' : 'তৈরি করুন'}
      </AdminActionButton>
    </form>
  );
}
