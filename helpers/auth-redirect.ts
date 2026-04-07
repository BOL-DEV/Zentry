export function isAuthIssue(error: unknown) {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("unauthorized") ||
    message.includes("logged out") ||
    message.includes("session") ||
    message.includes("permission") ||
    message.includes("token") ||
    message.includes("user not found")
  );
}
