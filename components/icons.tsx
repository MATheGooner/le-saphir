type IconProps = { className?: string };

export function BagIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l1 13H5L6 8Z" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M9 9V6a3 3 0 0 1 6 0v3" fill="none" stroke="currentColor" strokeWidth="1.7"/></svg>;
}

export function ArrowIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}

export function PinIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="10" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>;
}
