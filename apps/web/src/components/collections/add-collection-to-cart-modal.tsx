'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Product } from '@my-noodles/api-clients/storefront';
import { Modal, type ModalRef, useModal } from '@my-noodles/ui';
import { useTranslations } from 'next-intl';
import { type Ref, useEffect, useState } from 'react';

import { useAddCartItemsBatch } from '@/api/cart';
import { useCurrency } from '@/hooks/currency';

export type AddCollectionToCartModalData = {
  collectionName: string;
  products: Product[];
};

export type AddCollectionToCartModalRef = ModalRef<AddCollectionToCartModalData>;

function initialSelectedIds(products: Product[]): Set<string> {
  return new Set(products.filter((product) => product.inStock).map((product) => product.id));
}

function AddCollectionToCartModalContent() {
  const t = useTranslations('collections');
  const { formatCurrency } = useCurrency();
  const { data, close, setDisableClose } = useModal<AddCollectionToCartModalData>();
  const { addCartItemsBatchAsync, addCartItemsBatchIsPending } = useAddCartItemsBatch();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!data) {
      return;
    }
    setSelectedIds(initialSelectedIds(data.products));
  }, [data]);

  useEffect(() => {
    setDisableClose(addCartItemsBatchIsPending);
    return () => {
      setDisableClose(false);
    };
  }, [addCartItemsBatchIsPending, setDisableClose]);

  if (!data) {
    return null;
  }

  const inStockProducts = data.products.filter((product) => product.inStock);
  const selectedCount = selectedIds.size;
  const allInStockSelected =
    inStockProducts.length > 0 && inStockProducts.every((product) => selectedIds.has(product.id));

  function toggleProduct(productId: string, inStock: boolean) {
    if (!inStock) {
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }

  function selectAllInStock() {
    setSelectedIds(new Set(inStockProducts.map((product) => product.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function handleSubmit() {
    const selectedProducts = data.products.filter(
      (product) => selectedIds.has(product.id) && product.inStock,
    );
    if (selectedProducts.length === 0) {
      return;
    }

    try {
      await addCartItemsBatchAsync({
        lines: selectedProducts.map((product) => ({
          productId: product.id,
          slug: product.slug,
          title: product.name,
          priceMinor: product.priceMinor,
          currency: product.currency,
          imageUrl: product.images[0],
          qty: 1,
        })),
      });
      close();
    } catch {
      // Toast handled in useAddCartItemsBatch onError
    }
  }

  return (
    <>
      <Modal.Header title={t('addToCartModal.title', { name: data.collectionName })} />
      <Modal.Body>
        <Stack spacing={2}>
          {inStockProducts.length === 0 ? (
            <Typography color="text.secondary">{t('addToCartModal.noneInStock')}</Typography>
          ) : (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Button size="small" onClick={selectAllInStock} disabled={allInStockSelected}>
                {t('addToCartModal.selectAll')}
              </Button>
              <Button size="small" onClick={clearSelection} disabled={selectedCount === 0}>
                {t('addToCartModal.clearSelection')}
              </Button>
            </Stack>
          )}

          <Stack spacing={0.5}>
            {data.products.map((product) => {
              const title = product.name;
              const checked = selectedIds.has(product.id);
              const disabled = !product.inStock;

              return (
                <FormControlLabel
                  key={product.id}
                  disabled={disabled}
                  sx={{
                    mx: 0,
                    px: 1,
                    py: 0.75,
                    borderRadius: 1.5,
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: checked && !disabled ? 'action.selected' : 'transparent',
                  }}
                  control={
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleProduct(product.id, product.inStock)}
                    />
                  }
                  label={
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: 'center', minWidth: 0, width: '100%' }}
                    >
                      <Box
                        component="img"
                        src={product.images[0]}
                        alt={title}
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1.5,
                          objectFit: 'cover',
                          flexShrink: 0,
                          opacity: disabled ? 0.5 : 1,
                        }}
                      />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                          {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {disabled
                            ? t('addToCartModal.outOfStock')
                            : formatCurrency(product.priceMinor, product.currency)}
                        </Typography>
                      </Box>
                    </Stack>
                  }
                />
              );
            })}
          </Stack>
        </Stack>
      </Modal.Body>
      <Modal.Footer align="end">
        <Button onClick={close} disabled={addCartItemsBatchIsPending}>
          {t('addToCartModal.cancel')}
        </Button>
        <Button
          variant="contained"
          loading={addCartItemsBatchIsPending}
          disabled={selectedCount === 0 || inStockProducts.length === 0}
          onClick={() => void handleSubmit()}
        >
          {selectedCount > 0
            ? t('addToCartModal.submitCount', { count: selectedCount })
            : t('addToCartModal.submit')}
        </Button>
      </Modal.Footer>
    </>
  );
}

export function AddCollectionToCartModal({ ref }: { ref?: Ref<AddCollectionToCartModalRef> }) {
  return (
    <Modal ref={ref} maxWidth="sm">
      <AddCollectionToCartModalContent />
    </Modal>
  );
}
