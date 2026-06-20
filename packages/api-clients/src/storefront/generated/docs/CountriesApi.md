# CountriesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**countriesControllerList**](#countriescontrollerlist) | **GET** /api/countries | List countries|

# **countriesControllerList**
> Array<CountryDto> countriesControllerList()


### Example

```typescript
import {
    CountriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CountriesApi(configuration);

let locale: 'uk' | 'en'; //Response locale for localized fields. Falls back to Accept-Language, then the default locale. (optional) (default to undefined)

const { status, data } = await apiInstance.countriesControllerList(
    locale
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **locale** | [**&#39;uk&#39; | &#39;en&#39;**]**Array<&#39;uk&#39; &#124; &#39;en&#39;>** | Response locale for localized fields. Falls back to Accept-Language, then the default locale. | (optional) defaults to undefined|


### Return type

**Array<CountryDto>**

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

