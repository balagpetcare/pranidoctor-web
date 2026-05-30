import { describe, expect, it } from 'vitest';

import { aiProviderFormSchema, aiApiKeyFormSchema } from './schemas';

describe('admin-ai schemas', () => {
  it('accepts valid provider form', () => {
    const result = aiProviderFormSchema.safeParse({
      providerKey: 'openai',
      displayName: 'OpenAI',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short API key secrets', () => {
    const result = aiApiKeyFormSchema.safeParse({
      providerKey: 'openai',
      name: 'prod',
      secret: 'too-short',
    });
    expect(result.success).toBe(false);
  });
});
