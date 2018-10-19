

```js
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
```

可以在相应的页面的`<head>`里加上这句代码，意思是自动将`http`的不安全请求升级为`https`

**在`vue-cli`项目中，`dev`时会引发静态资源无法引入的`bug`**
