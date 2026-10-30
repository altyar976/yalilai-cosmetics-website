import { products, type Product } from "./catalog-data";
import { categories, categoryIds, collections, type CategoryId, type CollectionId } from "./taxonomy";

/**
 * Reference catalogue.
 *
 * Every model was audited against the source catalogue page by page: models with a brand mark or
 * printed text on the product itself are excluded, photographs are isolated on pure white without
 * altering the product, and model codes / dimensions / capacities are kept exactly as listed.
 * See docs/catalog/ for the manifest, exclusions and image QA notes.
 */
export { products, type Product };

export const productBySlug = new Map(products.map((x) => [x.slug, x]));
export const productByModel = new Map(products.map((x) => [x.model, x]));

export const productPath = (p: Product) => `/products/${p.category}/${p.slug}`;

export function productImages(prod: Product) {
  return { hero: prod.image };
}

export const productsInCategory = (c: CategoryId) => products.filter((p) => p.category === c);
export const productsInCollection = (c: CollectionId) => products.filter((p) => collections[c].categories.includes(p.category));

export const coverOf = (model: string) => productByModel.get(model);
export const categoryCover = (c: CategoryId) => coverOf(categories[c].cover);
export const collectionCover = (c: CollectionId) => coverOf(collections[c].cover);

const shared = (a: Product, b: Product) =>
  a.tips.filter((t) => b.tips.includes(t)).length + a.features.filter((f) => b.features.includes(f)).length + Number(a.type === b.type);

/** Same category first (closest tips / features / format), then featured models from neighbouring categories. */
export function relatedProducts(prod: Product, n = 4): Product[] {
  const same = products
    .filter((x) => x.category === prod.category && x.slug !== prod.slug)
    .sort((a, b) => shared(prod, b) - shared(prod, a) || a.model.localeCompare(b.model));
  const others = products.filter((x) => x.category !== prod.category && x.featured);
  return [...same, ...others].slice(0, n);
}

/** Model-code aware ordering: YD-001 < YD-001-1 < YD-001B < YD-002 … */
export const byModel = (a: Product, b: Product) => a.model.localeCompare(b.model, "en", { numeric: true });

export const categoryOrder = (c: CategoryId) => categoryIds.indexOf(c);
