# CreateOrderDeliveryDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**provider** | **string** |  | [default to undefined]
**method** | **string** |  | [default to undefined]
**city** | **string** |  | [default to undefined]
**warehouseNumber** | **string** | Required when method is warehouse | [optional] [default to undefined]
**warehouseName** | **string** |  | [optional] [default to undefined]
**warehouseRef** | **string** | Provider API ref for warehouse (future integrations) | [optional] [default to undefined]
**street** | **string** | Required when method is courier | [optional] [default to undefined]
**building** | **string** | Required when method is courier | [optional] [default to undefined]
**apartment** | **string** |  | [optional] [default to undefined]
**notes** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { CreateOrderDeliveryDto } from './api';

const instance: CreateOrderDeliveryDto = {
    provider,
    method,
    city,
    warehouseNumber,
    warehouseName,
    warehouseRef,
    street,
    building,
    apartment,
    notes,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
