Заранити апку від початку до кінця і прогнати собі флоу

Переглянути свагер на беці (і помилки які тепер мають бути типізовані щоб код викистовували зі згеенрованого )

export type ApiErrorCode =
  | 'cart_product_out_of_stock'
  | 'cart_max_quantity_reached'
  | 'cart_inventory_changed'
  | 'cart_empty'
  | 'checkout_expired'
  | 'checkout_not_in_progress'
  | 'order_inventory_changed';


  is currently hardcoded, but fcheck if generated client will have those api codes and we may simply use them from there

  ====

  переглянути всі декоратори чи вони не якось занадто в тупу, чи є якісь ще утіліті декоратитори і тд що можуть бути винесені як в загальні libs api так і в libs api nest

  ===

  переглянути по фронту щось загальне що можна винести

=====
after nest v12

vitest will be used + ESM

migrate completely to vitest for web and api
migrate completely to esm for web and api

remove completely jest from project
remove completely cjs commonjs etc from a project
