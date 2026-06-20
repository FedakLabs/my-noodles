# ProductsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**productsControllerGetBySlug**](#productscontrollergetbyslug) | **GET** /api/products/{slug} | Get product by slug|
|[**productsControllerGetFacets**](#productscontrollergetfacets) | **GET** /api/products/facets | Product facet counts for catalog filters|
|[**productsControllerList**](#productscontrollerlist) | **GET** /api/products | List products with filters and pagination|

# **productsControllerGetBySlug**
> ProductDetailDto productsControllerGetBySlug()


### Example

```typescript
import {
    ProductsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProductsApi(configuration);

let slug: string; // (default to undefined)
let locale: 'uk' | 'en'; //Response locale for localized fields. Falls back to Accept-Language, then the default locale. (optional) (default to undefined)

const { status, data } = await apiInstance.productsControllerGetBySlug(
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

**ProductDetailDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |
|**404** | Product not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **productsControllerGetFacets**
> ProductFacetsResponseDto productsControllerGetFacets()


### Example

```typescript
import {
    ProductsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProductsApi(configuration);

let locale: 'uk' | 'en'; //Response locale for localized fields. Falls back to Accept-Language, then the default locale. (optional) (default to undefined)
let collection: string; // (optional) (default to undefined)
let category: Array<string>; // (optional) (default to undefined)
let country: Array<string>; // (optional) (default to undefined)
let brand: string; // (optional) (default to undefined)
let priceMin: number; // (optional) (default to undefined)
let priceMax: number; // (optional) (default to undefined)
let isTriedByUs: boolean; // (optional) (default to undefined)
let inStock: boolean; // (optional) (default to undefined)
let sort: 'popular' | 'new' | 'price-asc' | 'price-desc'; // (optional) (default to undefined)

const { status, data } = await apiInstance.productsControllerGetFacets(
    locale,
    collection,
    category,
    country,
    brand,
    priceMin,
    priceMax,
    isTriedByUs,
    inStock,
    sort
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **locale** | [**&#39;uk&#39; | &#39;en&#39;**]**Array<&#39;uk&#39; &#124; &#39;en&#39;>** | Response locale for localized fields. Falls back to Accept-Language, then the default locale. | (optional) defaults to undefined|
| **collection** | [**string**] |  | (optional) defaults to undefined|
| **category** | **Array&lt;string&gt;** |  | (optional) defaults to undefined|
| **country** | **Array&lt;string&gt;** |  | (optional) defaults to undefined|
| **brand** | [**string**] |  | (optional) defaults to undefined|
| **priceMin** | [**number**] |  | (optional) defaults to undefined|
| **priceMax** | [**number**] |  | (optional) defaults to undefined|
| **isTriedByUs** | [**boolean**] |  | (optional) defaults to undefined|
| **inStock** | [**boolean**] |  | (optional) defaults to undefined|
| **sort** | [**&#39;popular&#39; | &#39;new&#39; | &#39;price-asc&#39; | &#39;price-desc&#39;**]**Array<&#39;popular&#39; &#124; &#39;new&#39; &#124; &#39;price-asc&#39; &#124; &#39;price-desc&#39;>** |  | (optional) defaults to undefined|


### Return type

**ProductFacetsResponseDto**

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

# **productsControllerList**
> PaginatedProductsDto productsControllerList()


### Example

```typescript
import {
    ProductsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProductsApi(configuration);

let page: number; // (default to undefined)
let limit: number; // (default to undefined)
let locale: 'uk' | 'en'; //Response locale for localized fields. Falls back to Accept-Language, then the default locale. (optional) (default to undefined)
let collection: string; // (optional) (default to undefined)
let category: Array<string>; // (optional) (default to undefined)
let country: Array<string>; // (optional) (default to undefined)
let brand: string; // (optional) (default to undefined)
let priceMin: number; // (optional) (default to undefined)
let priceMax: number; // (optional) (default to undefined)
let isTriedByUs: boolean; // (optional) (default to undefined)
let inStock: boolean; // (optional) (default to undefined)
let sort: 'popular' | 'new' | 'price-asc' | 'price-desc'; // (optional) (default to undefined)

const { status, data } = await apiInstance.productsControllerList(
    page,
    limit,
    locale,
    collection,
    category,
    country,
    brand,
    priceMin,
    priceMax,
    isTriedByUs,
    inStock,
    sort
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | defaults to undefined|
| **limit** | [**number**] |  | defaults to undefined|
| **locale** | [**&#39;uk&#39; | &#39;en&#39;**]**Array<&#39;uk&#39; &#124; &#39;en&#39;>** | Response locale for localized fields. Falls back to Accept-Language, then the default locale. | (optional) defaults to undefined|
| **collection** | [**string**] |  | (optional) defaults to undefined|
| **category** | **Array&lt;string&gt;** |  | (optional) defaults to undefined|
| **country** | **Array&lt;string&gt;** |  | (optional) defaults to undefined|
| **brand** | [**string**] |  | (optional) defaults to undefined|
| **priceMin** | [**number**] |  | (optional) defaults to undefined|
| **priceMax** | [**number**] |  | (optional) defaults to undefined|
| **isTriedByUs** | [**boolean**] |  | (optional) defaults to undefined|
| **inStock** | [**boolean**] |  | (optional) defaults to undefined|
| **sort** | [**&#39;popular&#39; | &#39;new&#39; | &#39;price-asc&#39; | &#39;price-desc&#39;**]**Array<&#39;popular&#39; &#124; &#39;new&#39; &#124; &#39;price-asc&#39; &#124; &#39;price-desc&#39;>** |  | (optional) defaults to undefined|


### Return type

**PaginatedProductsDto**

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

