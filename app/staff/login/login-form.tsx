"use client";
import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";

const initialState: LoginState = {};
export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return <form action={action} className="staff-login-form"><label>Email<input name="email" type="email" autoComplete="username" required autoFocus /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label>{state.error&&<p role="alert" className="staff-alert">{state.error}</p>}<button type="submit" disabled={pending}>{pending?"Signing in…":"Sign in"}</button></form>;
}
