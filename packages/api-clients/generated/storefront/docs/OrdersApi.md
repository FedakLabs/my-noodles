# OrdersApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**ordersControllerCreate**](#orderscontrollercreate) | **POST** /api/orders | Create a new order|

# **ordersControllerCreate**
> OrderResponseDto ordersControllerCreate(createOrderDto)


### Example

```typescript
import {
    OrdersApi,
    Configuration,
    CreateOrderDto
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersApi(configuration);

let createOrderDto: CreateOrderDto; //

const { status, data } = await apiInstance.ordersControllerCreate(
    createOrderDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createOrderDto** | **CreateOrderDto**|  | |


### Return type

**OrderResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |
|**400** | Validation error or honeypot triggered |  -  |
|**404** | One or more products not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

