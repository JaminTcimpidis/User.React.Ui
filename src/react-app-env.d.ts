/// <reference types="react-scripts" />

type OktaConfig = import('./utilities/getConfiguration').OktaConfig

declare interface AppConfig extends OktaConfig {
  userApiUrl: string;
  websiteUrl: string;
}