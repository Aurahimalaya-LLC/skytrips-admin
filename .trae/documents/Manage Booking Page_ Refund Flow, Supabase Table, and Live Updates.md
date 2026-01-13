## Database Schema

* Create table `manage_booking`:

```sql
create table if not exists public.manage_booking (
  uid text primary key,
  booking_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
```

* Triggers:

```sql
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;$$ language plpgsql;
create trigger manage_booking_set_updated_at before update on public.manage_booking
for each row execute function public.set_updated_at();

create or replace function public.prevent_uid_change() returns trigger as $$
begin
  if new.uid <> old.uid then
    raise exception 'UID is immutable';
  end if;
  return new;
end;$$ language plpgsql;
create trigger manage_booking_prevent_uid_change before update on public.manage_booking
for each row execute function public.prevent_uid_change();
```

* Enable RLS and policies (authenticated-only, full CRUD):

```sql
alter table public.manage_booking enable row level security;
create policy authenticated_read on public.manage_booking for select using (auth.uid() is not null);
create policy authenticated_insert on public.manage_booking for insert with check (auth.uid() is not null);
create policy authenticated_update on public.manage_booking for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy authenticated_delete on public.manage_booking for delete using (auth.uid() is not null);
```

## Data Model & SDK Wiring

* Add a lightweight TypeScript type:

```ts
export type ManageBooking = { uid: string; booking_id: string; created_at: string; updated_at: string | null };
```

* Supabase helpers:

  * list: `supabase.from('manage_booking').select('*').order('created_at',{descending:true})`

  * insert: `supabase.from('manage_booking').insert([{ uid, booking_id }])`

  * delete/update as needed for tests

## UI: Manage Booking Page Table

* Responsive table rendering all rows from `manage_booking` (booking\_id, masked uid, requested\_at)

* UID masking: show first 4 and last 4 chars with middle masked (e.g., `ABCD••••••WXYZ`)

* Loading and empty states; error banner with retry

* Mobile: stack columns or use horizontal scroll; match existing Tailwind design tokens

## Refund Confirmation Flow

* When user clicks "Confirm Refund":

  * Generate a UID (crypto.randomUUID()) but do not persist yet

  * Show modal titled "Confirm Refund Request" with booking\_id, UID (read-only), amount/date if available

  * Buttons: primary "Confirm Refund" and secondary "Cancel"

  * On confirm: insert `{ uid, booking_id }` into `manage_booking`, show success toast, close modal

  * On cancel/ESC/outside click: close without changes

  * Loading state during insert; disable buttons while pending

  * Log analytics events: `refund_confirmed` and `refund_cancelled`

## Live Updates (Realtime)

* Subscribe to Postgres changes on `manage_booking`:

```ts
supabase.channel('manage-booking')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'manage_booking' }, (payload) => { /* update UI */ })
  .subscribe();
```

* Update local table reactively for insert/update/delete; throttle renders for large streams

## Validation & Error Handling

* Client-side validation: ensure booking\_id is present and well-formed before confirm

* Handle Supabase errors with friendly messages and retry option

* Prevent duplicate insert: check existence `select('uid').eq('booking_id', bookingId)` before creating; if exists, reuse existing UID

## Accessibility & UX

* Modal: role="dialog", aria-modal, aria-labelledby; focus trap; ESC and overlay close; keyboard navigation on actions

* Table rows and controls: aria-labels, proper focus rings; 4.5:1 contrast

* Smooth open/close animations (fade/scale) and backdrop overlay

## Testing

* CRUD verification against Supabase: insert/select/update/delete (in dev/testing environment)

* Refund modal flow: confirm/cancel with various booking IDs, duplicate handling

* Responsiveness under loading and realtime updates; no layout shift

* Error states: simulate network/permission failures; ensure RLS blocks unauthenticated access

## Security

* RLS policies in place (authenticated-only)

* UID immutability via trigger; UI presents UID as read-only

* Ensure client uses user sessions; deny operations when unauthenticated

## Implementation Steps

1. Run SQL for table, triggers, RLS policies in Supabase SQL editor
2. Add types and Supabase helpers
3. Build table UI on /dashboard/manage-booking with masking, loading, error states
4. Implement modal (accessible, animated) and wire to refund action; insert on confirm
5. Add realtime subscription and reactive updates
6. Add client-side validation & analytics logging
7. Test flows and responsiveness; adjust for edge cases

Please confirm this plan. After approval, I will implement the database objects, UI table, modal, realtime updates
