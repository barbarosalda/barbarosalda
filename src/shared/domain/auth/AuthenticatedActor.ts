export type AuthenticatedActor = {
  /** TraderLock user id. This is the Cognito `sub` claim from a verified JWT. */
  userId: string;
  provider: 'cognito' | 'dev';
  tokenUse: 'access' | 'id';
  username?: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  groups: string[];
  scopes: string[];
};
