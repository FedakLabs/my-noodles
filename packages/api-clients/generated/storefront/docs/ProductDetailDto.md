# ProductDetailDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**slug** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**priceMinor** | **number** |  | [default to undefined]
**currency** | **string** |  | [default to undefined]
**images** | **Array&lt;string&gt;** |  | [default to undefined]
**inStock** | **boolean** |  | [default to undefined]
**isTriedByUs** | **boolean** |  | [default to undefined]
**sortWeight** | **number** |  | [default to undefined]
**brand** | [**BrandRefDto**](BrandRefDto.md) |  | [optional] [default to undefined]
**country** | [**CountryRefDto**](CountryRefDto.md) |  | [default to undefined]
**category** | [**CategoryRefDto**](CategoryRefDto.md) |  | [default to undefined]
**weight** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [default to undefined]
**story** | **string** |  | [default to undefined]
**forWhom** | **string** |  | [default to undefined]
**flavor** | [**ProductFlavorDto**](ProductFlavorDto.md) |  | [default to undefined]
**allergens** | **Array&lt;string&gt;** |  | [default to undefined]
**alternatives** | [**Array&lt;ProductSummaryDto&gt;**](ProductSummaryDto.md) |  | [default to undefined]

## Example

```typescript
import { ProductDetailDto } from './api';

const instance: ProductDetailDto = {
    slug,
    name,
    priceMinor,
    currency,
    images,
    inStock,
    isTriedByUs,
    sortWeight,
    brand,
    country,
    category,
    weight,
    description,
    story,
    forWhom,
    flavor,
    allergens,
    alternatives,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
