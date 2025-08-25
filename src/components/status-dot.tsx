export function StatusDot({ connected }: { connected: boolean }) {
  return (
    <span
      className={
        connected
          ? 'inline-flex h-2 w-2 rounded-full bg-emerald-500'
          : 'inline-flex h-2 w-2 rounded-full bg-amber-500'
      }
    />
  );
}
