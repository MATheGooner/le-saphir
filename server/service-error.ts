export class ServiceError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message); }
}

export function publicError(error: unknown) {
  if (error instanceof ServiceError) return { status: error.status, body: { error: { code: error.code, message: error.message } } };
  console.error("Unexpected server error", error);
  return { status: 500, body: { error: { code: "SERVER_ERROR", message: "Something went wrong. Please try again." } } };
}
