"use client";
import { useFormStatus } from "react-dom";
export function StaffSubmit({ children, className="staff-button" }: { children: React.ReactNode; className?: string }) { const { pending }=useFormStatus(); return <button className={className} type="submit" disabled={pending}>{pending?"Saving…":children}</button>; }
