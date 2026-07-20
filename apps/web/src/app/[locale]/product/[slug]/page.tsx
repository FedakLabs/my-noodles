import { dehydrate } from '@tanstack/react-query';

import { productsQueries } from '@/api/products';
import { withPageLocale, withPageLocaleMetadata, type WithPageLocaleProps } from '@/i18n/app-locale/server';
import { ProductScreen } from '@/screens/product';
import type { LocalePageProps } from '@/shared/page-props';
import { getQueryClient, QueryHydrate, runPrefetchSafe } from '@/shared/query-client';
import { buildPageMetadata, buildProductJsonLd, JsonLdScript } from '@/shared/seo';

type ProductPageProps = LocalePageProps<{ slug: string }>;

export const generateMetadata = withPageLocaleMetadata<ProductPageProps>(async ({ params, locale }) => {
  const { slug } = params;
  const product = await getQueryClient().fetchQuery(productsQueries.detail(slug));

  return buildPageMetadata({
    locale,
    pathname: `/product/${slug}`,
    title: product.name ?? product.slug,
    description: product.description ?? product.story,
  });
});

async function ProductPage({ params, locale }: WithPageLocaleProps<ProductPageProps>) {
  const { slug } = params;
  const queryClient = getQueryClient();

  const product = await runPrefetchSafe(() => queryClient.fetchQuery(productsQueries.detail(slug)));

  return (
    <>
      {product ? <JsonLdScript data={buildProductJsonLd(product, locale)} /> : null}
      <QueryHydrate state={dehydrate(queryClient)}>
        <ProductScreen slug={slug} />
      </QueryHydrate>
    </>
  );
}

export default withPageLocale(ProductPage);
