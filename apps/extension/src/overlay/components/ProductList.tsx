import { messages } from "@yigora/i18n";
import type { ProductSuggestion } from "@yigora/suggestion-engine";
import { Badge } from "@yigora/ui";
import { formatSellerPrice } from "../format";
import { Section } from "./Section";

const MAX_VISIBLE = 3;

function StockBadges({ product }: { product: ProductSuggestion }) {
  const t = messages;
  const { availability, isStale } = product.stock;
  return (
    <>
      {availability === "available" && (
        <Badge tone="success">{`${t.stock.available} · ${String(product.stockQuantity)} ${t.overlay.units}`}</Badge>
      )}
      {availability === "out_of_stock" && <Badge tone="danger">{t.stock.outOfStock}</Badge>}
      {availability === "unknown" && <Badge tone="neutral">{t.stock.unknown}</Badge>}
      {isStale && <Badge tone="warning">{t.overlay.stale}</Badge>}
      {product.requiresPrescription === true && (
        <Badge tone="warning">{t.overlay.prescription}</Badge>
      )}
    </>
  );
}

function ProductItem({ product }: { product: ProductSuggestion }) {
  return (
    <li className="flex flex-col gap-1.5 py-2 first:pt-0 last:pb-0" data-testid="product">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold">{product.name}</span>
        <span className="shrink-0 text-sm font-semibold tabular-nums">
          {product.price === null
            ? messages.overlay.noPrice
            : formatSellerPrice(product.price, product.currency)}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        <StockBadges product={product} />
      </div>
    </li>
  );
}

export function ProductList({
  products,
  tips,
}: {
  products: readonly ProductSuggestion[];
  tips: readonly string[];
}) {
  const t = messages.overlay;
  return (
    <Section title={t.products}>
      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.noProducts}</p>
      ) : (
        <ul className="divide-y">
          {products.slice(0, MAX_VISIBLE).map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </ul>
      )}
      {tips.length > 0 && (
        <ul
          className="mt-2 flex flex-col gap-0.5 border-t pt-2 text-xs text-muted-foreground"
          data-testid="tips"
        >
          {tips.map((tip) => (
            <li key={tip}>💡 {tip}</li>
          ))}
        </ul>
      )}
    </Section>
  );
}
