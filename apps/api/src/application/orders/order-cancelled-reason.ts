/** Post-submit manager cancel only — never set on draft orders. */
export enum OrderCancelledReason {
  CustomerRequest = 'customer_request',
  OutOfStock = 'out_of_stock',
}
