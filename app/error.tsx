"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Page error", error); }, [error]);
  return <main id="main" className="page-shell"><section className="empty-state container"><p className="eyebrow">Service interruption</p><h1>We couldn’t set the table.</h1><p>The restaurant service is temporarily unavailable. Your cart is still saved.</p><button className="button button-gold" type="button" onClick={reset}>Try again</button></section></main>;
}
