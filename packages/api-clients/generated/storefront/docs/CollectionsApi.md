# CollectionsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**collectionsControllerGetBySlug**](#collectionscontrollergetbyslug) | **GET** /api/collections/{slug} | Get collection by slug|
|[**collectionsControllerList**](#collectionscontrollerlist) | **GET** /api/collections | List active collections|

# **collectionsControllerGetBySlug**
> CollectionDetailDto collectionsControllerGetBySlug()


### Example

```typescript
import {
    CollectionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CollectionsApi(configuration);

let slug: string; // (default to undefined)
let locale: 'uk' | 'en'; //Response locale for localized fields. Falls back to Accept-Language, then the default locale. (optional) (default to undefined)

const { status, data } = await apiInstance.collectionsControllerGetBySlug(
    slug,
    locale
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **slug** | [**string**] |  | defaults to undefined|
| **locale** | [**&#39;uk&#39; | &#39;en&#39;**]**Array<&#39;uk&#39; &#124; &#39;en&#39;>** | Response locale for localized fields. Falls back to Accept-Language, then the default locale. | (optional) defaults to undefined|


### Return type

**CollectionDetailDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |
|**404** | Collection not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **collectionsControllerList**
> Array<CollectionSummaryDto> collectionsControllerList()


### Example

```typescript
import {
    CollectionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CollectionsApi(configuration);

let locale: 'uk' | 'en'; //Response locale for localized fields. Falls back to Accept-Language, then the default locale. (optional) (default to undefined)

const { status, data } = await apiInstance.collectionsControllerList(
    locale
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **locale** | [**&#39;uk&#39; | &#39;en&#39;**]**Array<&#39;uk&#39; &#124; &#39;en&#39;>** | Response locale for localized fields. Falls back to Accept-Language, then the default locale. | (optional) defaults to undefined|


### Return type

**Array<CollectionSummaryDto>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

