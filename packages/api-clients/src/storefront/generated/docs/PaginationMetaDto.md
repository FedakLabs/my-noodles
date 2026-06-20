# PaginationMetaDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**total** | **number** | Total items matching the query across all pages | [default to undefined]
**currentTotal** | **number** | Number of items returned on the current page | [default to undefined]
**page** | **number** |  | [default to undefined]
**limit** | **number** |  | [default to undefined]

## Example

```typescript
import { PaginationMetaDto } from './api';

const instance: PaginationMetaDto = {
    total,
    currentTotal,
    page,
    limit,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
