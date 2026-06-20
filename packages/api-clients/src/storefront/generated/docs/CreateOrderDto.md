# CreateOrderDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**customerName** | **string** |  | [default to undefined]
**phone** | **string** |  | [default to undefined]
**delivery** | [**CreateOrderDeliveryDto**](CreateOrderDeliveryDto.md) |  | [default to undefined]
**items** | [**Array&lt;CreateOrderItemDto&gt;**](CreateOrderItemDto.md) |  | [default to undefined]
**company** | **string** | Honeypot field — must stay empty | [optional] [default to undefined]

## Example

```typescript
import { CreateOrderDto } from './api';

const instance: CreateOrderDto = {
    customerName,
    phone,
    delivery,
    items,
    company,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
