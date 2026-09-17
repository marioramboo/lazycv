export interface ErrorFormatContext {
  provider?: string;
  model?: string;
  baseUrl?: string;
}

/**
 * Translates low-level provider/SDK errors (e.g. "404 status code (no body)")
 * into clear, actionable messages for the user.
 */
export function formatAIError(error: unknown, context?: ErrorFormatContext): string {
  const rawMessage = error instanceof Error ? error.message : String(error ?? 'Unknown error');
  const provider = context?.provider || 'AI Provider';
  const model = context?.model || 'the selected model';

  const lower = rawMessage.toLowerCase();

  // 404 Not Found / Model not found / "404 status code (no body)"
  if (
    lower.includes('404') ||
    lower.includes('not found') ||
    lower.includes('not_found') ||
    lower.includes('model not found') ||
    lower.includes('function not found')
  ) {
    if (provider.toLowerCase() === 'nvidia') {
      return `Model '${model}' was not found or is deprecated on Nvidia NIM. Please switch to an active model (e.g., 'deepseek-ai/deepseek-r1' or 'mistralai/mistral-large-2-instruct') and verify your API key has Public API access.`;
    }
    if (provider.toLowerCase() === 'ollama') {
      return `Model '${model}' not found in local Ollama. Please run \`ollama pull ${model}\` in your terminal.`;
    }
    return `Model '${model}' was not found on ${provider}. Please verify that the model name is supported and active for your account.`;
  }

  // 410 Gone / Deprecated
  if (lower.includes('410') || lower.includes('deprecated') || lower.includes('retired')) {
    return `Model '${model}' has been retired or deprecated by ${provider}. Please select an active model.`;
  }

  // 401 / 403 Authentication / Permission errors
  if (
    lower.includes('401') ||
    lower.includes('403') ||
    lower.includes('unauthorized') ||
    lower.includes('forbidden') ||
    lower.includes('authentication') ||
    lower.includes('invalid api key') ||
    lower.includes('permission denied')
  ) {
    const detail = rawMessage ? ` (${rawMessage})` : '';
    if (provider.toLowerCase() === 'nvidia') {
      return `Authentication failed for Nvidia NIM${detail}. Please make sure your NVIDIA API key begins with 'nvapi-', is saved in Settings, and has 'Public API Endpoints' enabled on build.nvidia.com.`;
    }
    return `Authentication failed for ${provider}${detail}. Please verify that your API key is correct and has the necessary permissions.`;
  }

  // 429 Rate limit / Quota exceeded
  if (
    lower.includes('429') ||
    lower.includes('rate limit') ||
    lower.includes('quota') ||
    lower.includes('resource exhausted')
  ) {
    return `Rate limit or quota exceeded for ${provider}. Please check your account usage/credits or wait a moment before trying again.`;
  }

  // Network / Connection / Timeout errors
  if (
    lower.includes('econnrefused') ||
    lower.includes('enotfound') ||
    lower.includes('fetch failed') ||
    lower.includes('failed to fetch') ||
    lower.includes('network error') ||
    lower.includes('timeout')
  ) {
    if (provider.toLowerCase() === 'ollama') {
      const url = context?.baseUrl || 'http://localhost:11434';
      return `Could not connect to Ollama at ${url}. Please make sure Ollama is installed and running (\`ollama serve\`).`;
    }
    return `Network connection to ${provider} failed or timed out. Please check your connection and try again.`;
  }

  return rawMessage;
}
