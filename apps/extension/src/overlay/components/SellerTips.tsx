import { messages } from "@yigora/i18n";
import { Section } from "./Section";

export function SellerTips({ tips }: { tips: readonly string[] }) {
  if (tips.length === 0) {
    return null;
  }
  return (
    <Section title={messages.overlay.tips}>
      <ul className="flex list-disc flex-col gap-1 pl-4 text-sm">
        {tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </Section>
  );
}
