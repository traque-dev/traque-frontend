import { type } from 'arktype';

const EnvConfig = type({
  VITE_API_URL: 'string',
});

const parsedConfig = EnvConfig(import.meta.env);

if (parsedConfig instanceof type.errors) {
  console.error('Configuration validation failed:', parsedConfig.summary);
  throw new Error('Invalid environment configuration', {
    cause: parsedConfig.summary,
  });
}

type Config = {
  api: {
    url: string;
  };
};

export const config: Config = {
  api: {
    url: parsedConfig.VITE_API_URL,
  },
};
