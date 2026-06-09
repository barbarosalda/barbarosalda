export interface DevCognitoAccessTokenClaims {
  sub: string;
  token_use: 'access';
  client_id: string;
  username?: string;
  scope?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
}

export const devCognitoAccessTokenClaims: DevCognitoAccessTokenClaims = {
  sub: 'dev-cognito-user-001',
  token_use: 'access',
  client_id: 'dev-cognito-client-id',
  username: 'dev-traderlock-user',
  scope: 'openid email profile',
  email: 'dev@traderlock.local',
  email_verified: true,
  name: 'TraderLock Dev User',
};
