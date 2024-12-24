import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { OktaAuthModule } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import { routes } from './app.routes';
import { authInterceptor } from './auth.interceptor';

const oktaConfig = {
  issuer: 'https://localhost:8443',
  clientId: '',
  redirectUri: '/callback',
  scopes: ['openid', 'profile']
};

const config = {
  issuer: oktaConfig.issuer,
  clientId: oktaConfig.clientId,
  redirectUri: oktaConfig.redirectUri,
  scopes: oktaConfig.scopes,
};
const oktaAuth = new OktaAuth(oktaConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      OktaAuthModule.forRoot({oktaAuth})
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes)
  ]
};
