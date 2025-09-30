import { type } from 'arktype';

const EnvConfig = type({
  APP_API_URL: 'string',
  APP_DEPLOYMENT_MODE: '"TRAQUE_CLOUD" | "SELF_HOSTED" = "SELF_HOSTED"',
});

const parsedConfig = EnvConfig(import.meta.env);

if (parsedConfig instanceof type.errors) {
  console.error('Configuration validation failed:', parsedConfig.summary);
  throw new Error('Invalid environment configuration', {
    cause: parsedConfig.summary,
  });
}

type Config = {
  deployment: {
    mode: (typeof parsedConfig)['APP_DEPLOYMENT_MODE'];
    isTraqueCloud: boolean;
    isSelfHosted: boolean;
  };
  api: {
    url: string;
  };
};

export const config: Config = {
  deployment: {
    mode: parsedConfig.APP_DEPLOYMENT_MODE,
    isTraqueCloud: parsedConfig.APP_DEPLOYMENT_MODE === 'TRAQUE_CLOUD',
    isSelfHosted: parsedConfig.APP_DEPLOYMENT_MODE === 'SELF_HOSTED',
  },
  api: {
    url: parsedConfig.APP_API_URL,
  },
};
