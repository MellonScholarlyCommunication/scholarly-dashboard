export async function getUserWebId(authClient: any): Promise<string | null> {
  const session = await authClient.currentSession();
  return session ? session.webId : null;
}
