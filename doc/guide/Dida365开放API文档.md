# Dida365开放API文档

## [**介绍**](https://developer.dida365.com/docs/index.html#/openapi?id=introduction)

欢迎阅读 Dida365 Open API 文档。Dida365 是一款功能强大的任务管理应用程序，可让用户轻松管理和组织日常任务、截止日期和项目。借助 Dida365 Open API，开发人员可以将 Dida365 强大的任务管理功能集成到自己的应用程序中，并创造无缝的用户体验。

## [**入门**](https://developer.dida365.com/docs/index.html#/openapi?id=getting-started)

要开始使用 Dida365 Open API，您需要注册您的应用程序并获取客户端 ID 和客户端密钥。您可以访问[**Dida365 开发者中心**](https://developer.dida365.com/manage)来注册您的应用程序。注册后，您将收到一个客户端 ID 和客户端密钥，您将使用它们来验证您的请求。

## [**授权**](https://developer.dida365.com/docs/index.html#/openapi?id=authorization)

### [**获取访问令牌**](https://developer.dida365.com/docs/index.html#/openapi?id=get-access-token)

为了调用Dida365的Open API，需要获取相应用户的访问令牌。Dida365使用OAuth2协议来获取访问令牌。

### [**第一步**](https://developer.dida365.com/docs/index.html#/openapi?id=first-step)

将用户重定向到 Dida365 授权页面，[**https://dida365.com/oauth/authorize**](https://dida365.com/oauth/authorize)。所需参数如下：

| **姓名** | **描述** |
| --- | --- |
| 客户端 ID | 应用程序唯一 ID |
| 范围 | 以空格分隔的权限范围。当前可用的范围是任务：写入任务：读取 |
| 状态 | 按原样传递给重定向 URL |
| 重定向 uri | 用户配置的重定向 URL |
| 响应类型 | 已修复为代码 |

例如：

[**https://dida365.com/oauth/authorize?scope =scope&client_id=client_id&state=state&redirect_uri=redirect_uri&response_type=code**](https://dida365.com/oauth/authorize?scope=scope&client_id=client_id&state=state&redirect_uri=redirect_uri&response_type=code)

### [**第二步**](https://developer.dida365.com/docs/index.html#/openapi?id=second-step)

**`redirect_uri`**用户授予访问权限后，Dida365 将使用授权码作为查询参数将用户重定向回您的应用程序。

| **姓名** | **描述** |
| --- | --- |
| 代码 | 后续访问令牌的授权码 |
| 状态 | 第一步传递的 state 参数 |

### [**第三步**](https://developer.dida365.com/docs/index.html#/openapi?id=third-step)

要将授权码交换为访问令牌，请**`https://dida365.com/oauth/token`**使用以下参数发出 POST 请求（Content-Type：application/x-www-form-urlencoded）：

| **姓名** | **描述** |
| --- | --- |
| 客户端 ID | 用户名位于**HEADER**中，使用**Basic Auth**认证方式 |
| 客户端机密 | 密码位于使用**Basic Auth**身份验证方法的**HEADER中** |
| 代码 | 第二步得到的代码 |
| 授权类型 | 授予类型，现在只有 authorization_code |
| 范围 | 以空格分隔的权限范围。当前可用的范围是任务：写入、任务：读取 |
| 重定向 uri | 用户配置的重定向 URL |

请求响应中用于openapi请求认证的access_token

```
 {
...
"access_token": "access token value"
...
}
```

### [**请求 OpenAPI**](https://developer.dida365.com/docs/index.html#/openapi?id=request-openapi)

在header中设置**Authorization**，值为**Bearer** **`access token value`**

```
Authorization: Bearer e*****b
```

## [**API 参考**](https://developer.dida365.com/docs/index.html#/openapi?id=api-reference)

Dida365 Open API 提供了 RESTful 接口，用于访问和管理用户任务、列表和其他相关资源。该 API 基于标准 HTTP 协议，支持 JSON 数据格式。

### [**任务**](https://developer.dida365.com/docs/index.html#/openapi?id=task)

### [**通过项目ID和任务ID获取任务**](https://developer.dida365.com/docs/index.html#/openapi?id=get-task-by-project-id-and-task-id)

```
GET /open/v1/project/{projectId}/task/{taskId}
```

### [**参数**](https://developer.dida365.com/docs/index.html#/openapi?id=parameters)

| **类型** | **姓名** | **描述** | **架构** |
| --- | --- | --- | --- |
| **小路** | **projectId** *必填* | 项目标识符 | 细绳 |
| **小路** | **taskId** *必填* | 任务标识符 | 细绳 |

### [**响应**](https://developer.dida365.com/docs/index.html#/openapi?id=responses)

| **HTTP 代码** | **描述** | **架构** |
| --- | --- | --- |
| **200** | 好的 | [**任务**](https://developer.dida365.com/docs/index.html#/openapi?id=task) |
| **401** | 未授权 | 没有内容 |
| **403** | 禁止 | 没有内容 |
| **404** | 未找到 | 没有内容 |

### [**例子**](https://developer.dida365.com/docs/index.html#/openapi?id=example)

### [**要求**](https://developer.dida365.com/docs/index.html#/openapi?id=request)

```
GET /open/v1/project/{{projectId}}/task/{{taskId}} HTTP/1.1
Host: api.dida365.com
Authorization: Bearer {{token}}
```

### [**回复**](https://developer.dida365.com/docs/index.html#/openapi?id=response)

```
{
"id" : "63b7bebb91c0a5474805fcd4",
"isAllDay" : true,
"projectId" : "6226ff9877acee87727f6bca",
"title" : "Task Title",
"content" : "Task Content",
"desc" : "Task Description",
"timeZone" : "America/Los_Angeles",
"repeatFlag" : "RRULE:FREQ=DAILY;INTERVAL=1",
"startDate" : "2019-11-13T03:00:00+0000",
"dueDate" : "2019-11-14T03:00:00+0000",
"reminders" : [ "TRIGGER:P0DT9H0M0S", "TRIGGER:PT0S" ],
"priority" : 1,
"status" : 0,
"completedTime" : "2019-11-13T03:00:00+0000",
"sortOrder" : 12345,
"items" : [ {
    "id" : "6435074647fd2e6387145f20",
    "status" : 0,
    "title" : "Item Title",
    "sortOrder" : 12345,
    "startDate" : "2019-11-13T03:00:00+0000",
    "isAllDay" : false,
    "timeZone" : "America/Los_Angeles",
    "completedTime" : "2019-11-13T03:00:00+0000"
    } ]
}
```

### [**创建任务**](https://developer.dida365.com/docs/index.html#/openapi?id=create-task)

```
POST /open/v1/task
```

### [**参数**](https://developer.dida365.com/docs/index.html#/openapi?id=parameters-1)

| **类型** | **姓名** | **描述** | **架构** |
| --- | --- | --- | --- |
| **身体** | *必填*标题 | 任务标题 | 细绳 |
| **身体** | 内容 | 任务内容 | 细绳 |
| **身体** | 描述 | 清单描述 | 细绳 |
| **身体** | 是全天 | 全天 | 布尔值 |
| **身体** | 开始日期 | 开始日期和时间`"yyyy-MM-dd'T'HH:mm:ssZ"`格式**示例**：`"2019-11-13T03:00:00+0000"` | 日期 |
| **身体** | 到期日 | 截止日期和时间`"yyyy-MM-dd'T'HH:mm:ssZ"`格式**示例**：`"2019-11-13T03:00:00+0000"` | 日期 |
| **身体** | 时区 | 指定时间的时区 | 细绳 |
| **身体** | 提醒 | 特定于任务的提醒列表 | 列表 |
| **身体** | 重复标志 | 任务循环规则 | 细绳 |
| **身体** | 优先事项 | 任务的优先级，默认为“0” | 整数 |
| **身体** | 排序顺序 | 任务顺序 | 整数 |
| **身体** | 项目 | 子任务列表 | 列表 |
| **身体** | 项目.title | 子任务标题 | 细绳 |
| **身体** | items.startDate | 开始日期和时间的`"yyyy-MM-dd'T'HH:mm:ssZ"`格式 | 日期 |
| **身体** | items.isAllDay | 全天 | 布尔值 |
| **身体** | items.sortOrder | 子任务的顺序 | 整数 |
| **身体** | items.timeZone | 指定开始时间的时区 | 细绳 |
| **身体** | items.status | 子任务完成状态 | 整数 |
| **身体** | 项目.完成时间 | 完成时间`"yyyy-MM-dd'T'HH:mm:ssZ"`格式**示例**：`"2019-11-13T03:00:00+0000"` | 日期 |

### [**响应**](https://developer.dida365.com/docs/index.html#/openapi?id=responses-1)

| **HTTP 代码** | **描述** | **架构** |
| --- | --- | --- |
| **200** | 好的 | [**任务**](https://developer.dida365.com/docs/index.html#/Task) |
| **201** | 创建 | 没有内容 |
| **401** | 未授权 | 没有内容 |
| **403** | 禁止 | 没有内容 |
| **404** | 未找到 | 没有内容 |

### [**例子**](https://developer.dida365.com/docs/index.html#/openapi?id=example-1)

### [**要求**](https://developer.dida365.com/docs/index.html#/openapi?id=request-1)

```
POST /open/v1/task HTTP/1.1
Host: api.dida365.com
Content-Type: application/json
Authorization: Bearer {{token}}
{
    ...
    "title":"Task Title",
    "projectId":"6226ff9877acee87727f6bca"
    ...
}
```

### [**回复**](https://developer.dida365.com/docs/index.html#/openapi?id=response-1)

```
{
"id" : "63b7bebb91c0a5474805fcd4",
"projectId" : "6226ff9877acee87727f6bca",
"title" : "Task Title",
"content" : "Task Content",
"desc" : "Task Description",
"isAllDay" : true,
"startDate" : "2019-11-13T03:00:00+0000",
"dueDate" : "2019-11-14T03:00:00+0000",
"timeZone" : "America/Los_Angeles",
"reminders" : [ "TRIGGER:P0DT9H0M0S", "TRIGGER:PT0S" ],
"repeatFlag" : "RRULE:FREQ=DAILY;INTERVAL=1",
"priority" : 1,
"status" : 0,
"completedTime" : "2019-11-13T03:00:00+0000",
"sortOrder" : 12345,
"items" : [ {
    "id" : "6435074647fd2e6387145f20",
    "status" : 1,
    "title" : "Subtask Title",
    "sortOrder" : 12345,
    "startDate" : "2019-11-13T03:00:00+0000",
    "isAllDay" : false,
    "timeZone" : "America/Los_Angeles",
    "completedTime" : "2019-11-13T03:00:00+0000"
    } ]
}
```

### [**更新任务**](https://developer.dida365.com/docs/index.html#/openapi?id=update-task)

```
POST /open/v1/task/{taskId}
```

### [**参数**](https://developer.dida365.com/docs/index.html#/openapi?id=parameters-2)

| **类型** | **姓名** | **描述** | **架构** |
| --- | --- | --- | --- |
| **小路** | **taskId** *必填* | 任务标识符 | 细绳 |
| **身体** | *需要*身份证 | 任务 ID。 | 细绳 |
| **身体** | projectId *必填* | 项目编号。 | 细绳 |
| **身体** | 标题 | 任务标题 | 细绳 |
| **身体** | 内容 | 任务内容 | 细绳 |
| **身体** | 描述 | 清单描述 | 细绳 |
| **身体** | 是全天 | 全天 | 布尔值 |
| **身体** | 开始日期 | 开始日期和时间`"yyyy-MM-dd'T'HH:mm:ssZ"`格式**示例**：`"2019-11-13T03:00:00+0000"` | 日期 |
| **身体** | 到期日 | 截止日期和时间`"yyyy-MM-dd'T'HH:mm:ssZ"`格式**示例**：`"2019-11-13T03:00:00+0000"` | 日期 |
| **身体** | 时区 | 指定时间的时区 | 细绳 |
| **身体** | 提醒 | 特定于任务的提醒列表 | 列表 |
| **身体** | 重复标志 | 任务循环规则 | 细绳 |
| **身体** | 优先事项 | 任务的优先级，默认为“正常” | 整数 |
| **身体** | 排序顺序 | 任务顺序 | 整数 |
| **身体** | 项目 | 子任务列表 | 列表 |
| **身体** | 项目.title | 子任务标题 | 细绳 |
| **身体** | items.startDate | 开始日期和时间的`"yyyy-MM-dd'T'HH:mm:ssZ"`格式 | 日期 |
| **身体** | items.isAllDay | 全天 | 布尔值 |
| **身体** | items.sortOrder | 子任务的顺序 | 整数 |
| **身体** | items.timeZone | 指定开始时间的时区 | 细绳 |
| **身体** | items.status | 子任务完成状态 | 整数 |
| **身体** | 项目.完成时间 | 完成时间`"yyyy-MM-dd'T'HH:mm:ssZ"`格式**示例**：`"2019-11-13T03:00:00+0000"` | 日期 |

### [**响应**](https://developer.dida365.com/docs/index.html#/openapi?id=responses-2)

| **HTTP 代码** | **描述** | **架构** |
| --- | --- | --- |
| **200** | 好的 | [**任务**](https://developer.dida365.com/docs/index.html#/Task) |
| **201** | 创建 | 没有内容 |
| **401** | 未授权 | 没有内容 |
| **403** | 禁止 | 没有内容 |
| **404** | 未找到 | 没有内容 |

### [**例子**](https://developer.dida365.com/docs/index.html#/openapi?id=example-2)

### [**要求**](https://developer.dida365.com/docs/index.html#/openapi?id=request-2)

```
POST /open/v1/task/{{taskId}} HTTP/1.1
Host: api.dida365.com
Content-Type: application/json
Authorization: Bearer {{token}}
{
    "id": "{{taskId}}",
    "projectId": "{{projectId}}",
    "title": "Task Title",
    "priority": 1,
    ...
}
```

### [**回复**](https://developer.dida365.com/docs/index.html#/openapi?id=response-2)

```
{
"id" : "63b7bebb91c0a5474805fcd4",
"projectId" : "6226ff9877acee87727f6bca",
"title" : "Task Title",
"content" : "Task Content",
"desc" : "Task Description",
"isAllDay" : true,
"startDate" : "2019-11-13T03:00:00+0000",
"dueDate" : "2019-11-14T03:00:00+0000",
"timeZone" : "America/Los_Angeles",
"reminders" : [ "TRIGGER:P0DT9H0M0S", "TRIGGER:PT0S" ],
"repeatFlag" : "RRULE:FREQ=DAILY;INTERVAL=1",
"priority" : 1,
"status" : 0,
"completedTime" : "2019-11-13T03:00:00+0000",
"sortOrder" : 12345,
"items" : [ {
    "id" : "6435074647fd2e6387145f20",
    "status" : 1,
    "title" : "Item Title",
    "sortOrder" : 12345,
    "startDate" : "2019-11-13T03:00:00+0000",
    "isAllDay" : false,
    "timeZone" : "America/Los_Angeles",
    "completedTime" : "2019-11-13T03:00:00+0000"
    } ]
}
```

### [**完成任务**](https://developer.dida365.com/docs/index.html#/openapi?id=complete-task)

```
POST /open/v1/project/{projectId}/task/{taskId}/complete
```

### [**参数**](https://developer.dida365.com/docs/index.html#/openapi?id=parameters-3)

| **类型** | **姓名** | **描述** | **架构** |
| --- | --- | --- | --- |
| **小路** | **projectId** *必填* | 项目标识符 | 细绳 |
| **小路** | **taskId** *必填* | 任务标识符 | 细绳 |

### [**响应**](https://developer.dida365.com/docs/index.html#/openapi?id=responses-3)

| **HTTP 代码** | **描述** | **架构** |
| --- | --- | --- |
| **200** | 好的 | 没有内容 |
| **201** | 创建 | 没有内容 |
| **401** | 未授权 | 没有内容 |
| **403** | 禁止 | 没有内容 |
| **404** | 未找到 | 没有内容 |

### [**例子**](https://developer.dida365.com/docs/index.html#/openapi?id=example-3)

### [**要求**](https://developer.dida365.com/docs/index.html#/openapi?id=request-3)

```
POST /open/v1/project/{{projectId}}/task/{{taskId}}/complete HTTP/1.1
Host: api.dida365.com
Authorization: Bearer {{token}}
```

### [**删除任务**](https://developer.dida365.com/docs/index.html#/openapi?id=delete-task)

```
DELETE /open/v1/project/{projectId}/task/{taskId}
```

### [**参数**](https://developer.dida365.com/docs/index.html#/openapi?id=parameters-4)

| **类型** | **姓名** | **描述** | **架构** |
| --- | --- | --- | --- |
| **小路** | **projectId** *必填* | 项目标识符 | 细绳 |
| **小路** | **taskId** *必填* | 任务标识符 | 细绳 |

### [**响应**](https://developer.dida365.com/docs/index.html#/openapi?id=responses-4)

| **HTTP 代码** | **描述** | **架构** |
| --- | --- | --- |
| **200** | 好的 | 没有内容 |
| **201** | 创建 | 没有内容 |
| **401** | 未授权 | 没有内容 |
| **403** | 禁止 | 没有内容 |
| **404** | 未找到 | 没有内容 |

### [**例子**](https://developer.dida365.com/docs/index.html#/openapi?id=example-4)

### [**要求**](https://developer.dida365.com/docs/index.html#/openapi?id=request-4)

```
DELETE /open/v1/project/{{projectId}}/task/{{taskId}} HTTP/1.1
Host: api.dida365.com
Authorization: Bearer {{token}}
```

### [**项目**](https://developer.dida365.com/docs/index.html#/openapi?id=project)

### [**获取用户项目**](https://developer.dida365.com/docs/index.html#/openapi?id=get-user-project)

```
GET /open/v1/project
```

### [**响应**](https://developer.dida365.com/docs/index.html#/openapi?id=responses-5)

| **HTTP 代码** | **描述** | **架构** |
| --- | --- | --- |
| **200** | 好的 | <[**项目**](https://developer.dida365.com/docs/index.html#/Project)> 数组 |
| **401** | 未授权 | 没有内容 |
| **403** | 禁止 | 没有内容 |
| **404** | 未找到 | 没有内容 |

### [**例子**](https://developer.dida365.com/docs/index.html#/openapi?id=example-5)

### [**要求**](https://developer.dida365.com/docs/index.html#/openapi?id=request-5)

```
GET /open/v1/project HTTP/1.1
Host: api.dida365.com
Authorization: Bearer {{token}}
```

### [**回复**](https://developer.dida365.com/docs/index.html#/openapi?id=response-3)

```
[{
"id": "6226ff9877acee87727f6bca",
"name": "project name",
"color": "#F18181",
"closed": false,
"groupId": "6436176a47fd2e05f26ef56e",
"viewMode": "list",
"permission": "write",
"kind": "TASK"
}]
```

### [**根据 ID 获取项目**](https://developer.dida365.com/docs/index.html#/openapi?id=get-project-by-id)

```
GET /open/v1/project/{projectId}
```

### [**参数**](https://developer.dida365.com/docs/index.html#/openapi?id=parameters-5)

| **类型** | **姓名** | **描述** | **架构** |
| --- | --- | --- | --- |
| **小路** | **项目** *所需* | 项目标识符 | 细绳 |

### [**响应**](https://developer.dida365.com/docs/index.html#/openapi?id=responses-6)

| **HTTP 代码** | **描述** | **架构** |
| --- | --- | --- |
| **200** | 好的 | [**项目**](https://developer.dida365.com/docs/index.html#/Project) |
| **401** | 未授权 | 没有内容 |
| **403** | 禁止 | 没有内容 |
| **404** | 未找到 | 没有内容 |

### [**例子**](https://developer.dida365.com/docs/index.html#/openapi?id=example-6)

### [**请求路径**](https://developer.dida365.com/docs/index.html#/openapi?id=request-path)

```
GET /open/v1/project/{{projectId}} HTTP/1.1
Host: api.dida365.com
Authorization: Bearer {{token}}
```

### [**回复**](https://developer.dida365.com/docs/index.html#/openapi?id=response-4)

```
{
    "id": "6226ff9877acee87727f6bca",
    "name": "project name",
    "color": "#F18181",
    "closed": false,
    "groupId": "6436176a47fd2e05f26ef56e",
    "viewMode": "list",
    "kind": "TASK"
}
```

### [**获取包含数据的项目**](https://developer.dida365.com/docs/index.html#/openapi?id=get-project-with-data)

```
GET /open/v1/project/{projectId}/data
```

### [**参数**](https://developer.dida365.com/docs/index.html#/openapi?id=parameters-6)

| **类型** | **姓名** | **描述** | **架构** |
| --- | --- | --- | --- |
| **小路** | **projectId** *必填* | 项目标识符 | 细绳 |

### [**响应**](https://developer.dida365.com/docs/index.html#/openapi?id=responses-7)

| **HTTP 代码** | **描述** | **架构** |
| --- | --- | --- |
| **200** | 好的 | [**项目数据**](https://developer.dida365.com/docs/index.html#/ProjectData) |
| **401** | 未授权 | 没有内容 |
| **403** | 禁止 | 没有内容 |
| **404** | 未找到 | 没有内容 |

### [**例子**](https://developer.dida365.com/docs/index.html#/openapi?id=example-7)

### [**要求**](https://developer.dida365.com/docs/index.html#/openapi?id=request-6)

```
GET /open/v1/project/{{projectId}}/data HTTP/1.1
Host: api.dida365.com
Authorization: Bearer {{token}}
```

### [**回复**](https://developer.dida365.com/docs/index.html#/openapi?id=response-5)

```
{
"project": {
    "id": "6226ff9877acee87727f6bca",
    "name": "project name",
    "color": "#F18181",
    "closed": false,
    "groupId": "6436176a47fd2e05f26ef56e",
    "viewMode": "list",
    "kind": "TASK"
},
"tasks": [{
    "id": "6247ee29630c800f064fd145",
    "isAllDay": true,
    "projectId": "6226ff9877acee87727f6bca",
    "title": "Task Title",
    "content": "Task Content",
    "desc": "Task Description",
    "timeZone": "America/Los_Angeles",
    "repeatFlag": "RRULE:FREQ=DAILY;INTERVAL=1",
    "startDate": "2019-11-13T03:00:00+0000",
    "dueDate": "2019-11-14T03:00:00+0000",
    "reminders": [
        "TRIGGER:P0DT9H0M0S",
        "TRIGGER:PT0S"
    ],
    "priority": 1,
    "status": 0,
    "completedTime": "2019-11-13T03:00:00+0000",
    "sortOrder": 12345,
    "items": [{
        "id": "6435074647fd2e6387145f20",
        "status": 0,
        "title": "Subtask Title",
        "sortOrder": 12345,
        "startDate": "2019-11-13T03:00:00+0000",
        "isAllDay": false,
        "timeZone": "America/Los_Angeles",
        "completedTime": "2019-11-13T03:00:00+0000"
    }]
}],
"columns": [{
    "id": "6226ff9e76e5fc39f2862d1b",
    "projectId": "6226ff9877acee87727f6bca",
    "name": "Column Name",
    "sortOrder": 0
}]
}
```

### [**创建项目**](https://developer.dida365.com/docs/index.html#/openapi?id=create-project)

```
POST /open/v1/project
```

### [**参数**](https://developer.dida365.com/docs/index.html#/openapi?id=parameters-7)

| **类型** | **姓名** | **描述** | **架构** |
| --- | --- | --- | --- |
| **身体** | *必填*项 | 项目名称 | 细绳 |
| **身体** | 颜色 | 项目颜色，例如“#F18181” | 细绳 |
| **身体** | 排序顺序 | 项目的排序顺序值 | 整数（int64） |
| **身体** | 视图模式 | 视图模式，“列表”，“看板”，“时间线” | 细绳 |
| **身体** | 种类 | 项目类型，“任务”，“注释” | 细绳 |

### [**响应**](https://developer.dida365.com/docs/index.html#/openapi?id=responses-8)

| **HTTP 代码** | **描述** | **架构** |
| --- | --- | --- |
| **200** | 好的 | [**项目**](https://developer.dida365.com/docs/index.html#/Project) |
| **201** | 创建 | 没有内容 |
| **401** | 未授权 | 没有内容 |
| **403** | 禁止 | 没有内容 |
| **404** | 未找到 | 没有内容 |

### [**例子**](https://developer.dida365.com/docs/index.html#/openapi?id=example-8)

### [**要求**](https://developer.dida365.com/docs/index.html#/openapi?id=request-7)

```
POST /open/v1/project HTTP/1.1
Host: api.dida365.com
Content-Type: application/json
Authorization: Bearer {{token}}
{
    "name": "project name",
    "color": "#F18181",
    "viewMode": "list",
    "kind": "task"
}
```

### [**回复**](https://developer.dida365.com/docs/index.html#/openapi?id=response-6)

```
{
"id": "6226ff9877acee87727f6bca",
"name": "project name",
"color": "#F18181",
"sortOrder": 0,
"viewMode": "list",
"kind": "TASK"
}
```

### [**更新项目**](https://developer.dida365.com/docs/index.html#/openapi?id=update-project)

```
POST /open/v1/project/{projectId}
```

### [**参数**](https://developer.dida365.com/docs/index.html#/openapi?id=parameters-8)

| **类型** | **范围** | **描述** | **架构** |
| --- | --- | --- | --- |
| **小路** | projectId*必填* | 项目标识符 | 细绳 |
| **身体** | 姓名 | 项目名称 | 细绳 |
| **身体** | 颜色 | 项目的颜色 | 细绳 |
| **身体** | 排序顺序 | 排序顺序值，默认 0 | 整数（int64） |
| **身体** | 视图模式 | 视图模式，“列表”，“看板”，“时间线” | 细绳 |
| **身体** | 种类 | 项目类型，“任务”，“注释” | 细绳 |

### [**响应**](https://developer.dida365.com/docs/index.html#/openapi?id=responses-9)

| **HTTP 代码** | **描述** | **架构** |
| --- | --- | --- |
| **200** | 好的 | [**项目**](https://developer.dida365.com/docs/index.html#/Project) |
| **201** | 创建 | 没有内容 |
| **401** | 未授权 | 没有内容 |
| **403** | 禁止 | 没有内容 |
| **404** | 未找到 | 没有内容 |

### [**例子**](https://developer.dida365.com/docs/index.html#/openapi?id=example-9)

### [**要求**](https://developer.dida365.com/docs/index.html#/openapi?id=request-8)

```
POST /open/v1/project/{{projectId}} HTTP/1.1
Host: api.dida365.com
Content-Type: application/json
Authorization: Bearer {{token}}

{
    "name": "Project Name",
    "color": "#F18181",
    "viewMode": "list",
    "kind": "TASK"
}
```

### [**回复**](https://developer.dida365.com/docs/index.html#/openapi?id=response-7)

```
{
"id": "6226ff9877acee87727f6bca",
"name": "Project Name",
"color": "#F18181",
"sortOrder": 0,
"viewMode": "list",
"kind": "TASK"
}
```

### [**删除项目**](https://developer.dida365.com/docs/index.html#/openapi?id=delete-project)

```
DELETE /open/v1/project/{projectId}
```

### [**参数**](https://developer.dida365.com/docs/index.html#/openapi?id=parameters-9)

| **类型** | **姓名** | **描述** | **架构** |
| --- | --- | --- | --- |
| 小路 | **projectId** *必填* | 项目标识符 | 细绳 |

### [**响应**](https://developer.dida365.com/docs/index.html#/openapi?id=responses-10)

| **HTTP 代码** | **描述** | **架构** |
| --- | --- | --- |
| **200** | 好的 | 没有内容 |
| **401** | 未授权 | 没有内容 |
| **403** | 禁止 | 没有内容 |
| **404** | 未找到 | 没有内容 |

### [**例子**](https://developer.dida365.com/docs/index.html#/openapi?id=example-10)

### [**要求**](https://developer.dida365.com/docs/index.html#/openapi?id=request-9)

```
DELETE /open/v1/project/{{projectId}} HTTP/1.1
Host: api.dida365.com
Authorization: Bearer {{token}}
```

## [**定义**](https://developer.dida365.com/docs/index.html#/openapi?id=definitions)

### [**核对清单项目**](https://developer.dida365.com/docs/index.html#/openapi?id=checklistitem)

| **姓名** | **描述** | **架构** |
| --- | --- | --- |
| **ID** | 子任务标识符 | 细绳 |
| **标题** | 子任务标题 | 细绳 |
| **地位** | 子任务完成状态**值**：正常：`0`、完成：`1` | 整数（int32） |
| **完成时间** | `"yyyy-MM-dd'T'HH:mm:ssZ"`**示例**中的子任务完成时间：`"2019-11-13T03:00:00+0000"` | 字符串（日期时间） |
| **是全天** | 全天 | 布尔值 |
| **排序顺序** | 子任务排序顺序**示例**：`234444` | 整数（int64） |
| **开始日期** | 子任务开始日期时间`"yyyy-MM-dd'T'HH:mm:ssZ"`**示例**：`"2019-11-13T03:00:00+0000"` | 字符串（日期时间） |
| **时区** | 子任务时区**示例**：`"America/Los_Angeles"` | 细绳 |

### [**任务**](https://developer.dida365.com/docs/index.html#/openapi?id=task-1)

| **姓名** | **描述** | **架构** |
| --- | --- | --- |
| **ID** | 任务标识符 | 细绳 |
| **项目编号** | 任务项目 ID | 细绳 |
| **标题** | 任务标题 | 细绳 |
| **是全天** | 全天 | 布尔值 |
| **完成时间** | `"yyyy-MM-dd'T'HH:mm:ssZ"`**示例**中的任务完成时间：`"2019-11-13T03:00:00+0000"` | 字符串（日期时间） |
| **内容** | 任务内容 | 细绳 |
| **描述** | 清单任务描述 | 细绳 |
| **到期日** | 任务截止日期时间`"yyyy-MM-dd'T'HH:mm:ssZ"`**示例**：`"2019-11-13T03:00:00+0000"` | 字符串（日期时间） |
| **项目** | 任务的子任务 | < [**ChecklistItem**](https://developer.dida365.com/docs/index.html#/openapi?id=checklistitem) > 数组 |
| **优先事项** | 任务优先级**值**：无：`0`、低：`1`、中：`3`、高`5` | 整数（int32） |
| **提醒** | 提醒触发器列表**示例**：`[ "TRIGGER:P0DT9H0M0S", "TRIGGER:PT0S" ]` | < 字符串 > 数组 |
| **重复标志** | 任务循环规则**示例**：`"RRULE:FREQ=DAILY;INTERVAL=1"` | 细绳 |
| **排序顺序** | 任务排序顺序**示例**：`12345` | 整数（int64） |
| **开始日期** | `"yyyy-MM-dd'T'HH:mm:ssZ"`**示例**中的开始日期时间：`"2019-11-13T03:00:00+0000"` | 字符串（日期时间） |
| **地位** | 任务完成状态**值**：正常：`0`、完成：`2` | 整数（int32） |
| **时区** | 任务时区**示例**：`"America/Los_Angeles"` | 细绳 |

### [**项目**](https://developer.dida365.com/docs/index.html#/openapi?id=project-1)

| **姓名** | **描述** | **架构** |
| --- | --- | --- |
| **ID** | 项目标识符 | 细绳 |
| **姓名** | 项目名称 | 细绳 |
| **颜色** | 项目颜色 | 细绳 |
| **排序顺序** | 订单价值 | 整数（int64） |
| **关闭** | 项目已结束 | 布尔值 |
| **群组编号** | 项目组标识符 | 细绳 |
| **视图模式** | 视图模式，“列表”，“看板”，“时间线” | 细绳 |
| **允许** | “阅读”、“撰写”或“评论” | 细绳 |
| **种类** | “任务”或“注释” | 细绳 |

### [**柱子**](https://developer.dida365.com/docs/index.html#/openapi?id=column)

| **姓名** | **描述** | **架构** |
| --- | --- | --- |
| ID | 列标识符 | 细绳 |
| 项目编号 | 项目标识符 | 细绳 |
| 姓名 | 列名称 | 细绳 |
| 排序顺序 | 订单价值 | 整数（int64） |

### [**项目数据**](https://developer.dida365.com/docs/index.html#/openapi?id=projectdata)

| **姓名** | **描述** | **架构** |
| --- | --- | --- |
| 项目 | 项目信息 | [**项目**](https://developer.dida365.com/docs/index.html#/Project) |
| 任务 | 项目下未完成的任务 | <[**任务**](https://developer.dida365.com/docs/index.html#/Task)> 数组 |
| 列 | 项目下的列 | <[**列**](https://developer.dida365.com/docs/index.html#/Column)> 数组 |

## [**反馈和支持**](https://developer.dida365.com/docs/index.html#/openapi?id=feedback-and-support)

如果您对 Dida365 Open API 文档有任何疑问或反馈，请通过[**support@dida365.com**](mailto:support@dida365.com)联系我们。我们感谢您的意见，并将尽快解决任何疑虑或问题。感谢您选择 Dida！