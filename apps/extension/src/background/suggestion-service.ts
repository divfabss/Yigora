import { createDemoCatalog, DEMO_ORGANIZATION } from "@yigora/demo-data";
import {
  createInMemoryProductSearch,
  createSuggestionEngine,
  type ConversationMessage,
  type SuggestionResult,
} from "@yigora/suggestion-engine";
import type { ReplyLanguage } from "../shared/messages";

/**
 * Servicio de sugerencias. En el modo demostración el motor corre localmente con la farmacia
 * ficticia; en producción se reemplazará por un servicio que llame al API de Yigora.
 */
export interface SuggestionService {
  readonly isDemo: boolean;
  analyze(
    messages: readonly ConversationMessage[],
    replyLanguage: ReplyLanguage | null,
  ): Promise<SuggestionResult>;
}

export function createDemoSuggestionService(now: () => Date = () => new Date()): SuggestionService {
  const engine = createSuggestionEngine({
    productSearch: createInMemoryProductSearch(createDemoCatalog(now())),
    now,
  });
  return {
    isDemo: true,
    analyze: (messages, replyLanguage) =>
      engine.analyze(replyLanguage ? { messages, replyLanguage } : { messages }, DEMO_ORGANIZATION),
  };
}
