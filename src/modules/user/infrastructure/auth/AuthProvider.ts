import type { ModuleSetupContext } from '@shared/application/ports/module/IModulePort';
import type { IAuthProviderPort } from '@modules/user/application/ports/IAuthProviderPort';

import { CognitoAuthProviderAdapter } from './cognito/CognitoAuthProviderAdapter.ts';
import { DevelopmentAuthProviderAdapter } from './dev/DevelopmentAuthProviderAdapter.ts';

export class AuthProvider implements IAuthProviderPort {
  private readonly provider: IAuthProviderPort;

  constructor(config: ModuleSetupContext['config']) {
    if (config.AUTH_PROVIDER === 'dev') {
      this.provider = new DevelopmentAuthProviderAdapter();
      return;
    }

    this.provider = new CognitoAuthProviderAdapter({
      userPoolId: config.COGNITO_USER_POOL_ID!,
      clientId: config.COGNITO_CLIENT_ID!,
      tokenUse: config.COGNITO_TOKEN_USE,
    });
  }

  verifyToken(token: string) {
    return this.provider.verifyToken(token);
  }
}
