---
title: koa
tags: js
date: 2018/10/15
---

## `koa`是一个轻健的 web 开发框架。

### 一个基于`koa`写的`post`请求：

```js
const Koa = require('koa')
const app = new Koa()
const bodyParser = require('koa-bodyparser')
app.use(bodyParser())
app.use(async ctx => {
    if (ctx.url === '/' && ctx.method === 'POST') {
        // 当POST请求的时候，中间件koa-bodyparser解析POST表单里的数据，并显示出来
        let postData = ctx.request.body
        ctx.body = postData
    } else {
        ctx.body = `<h1>404</h1>`
    }
})
app.listen(3000, () => {
    console.log('[demo] request post is starting at port 3000')
})
```

`koa-bodyparser`是一个**middleware**，`Koa`应用程序是一个包含一组中间件函数的对象，它是按照类似堆栈的方式组织和执行的。

### `koa`的构成

`koa`的源码由四部分组成：

-   `application.js`

-   `context.js`

-   `request.js`

-   `response.js`

`application.js`为入口文件，`context.js`是上下文对象，`request.js`是请求相关，`response.js`是返回相关。

`koa`的执行分为两步：

1. 初始化，这一阶段为初始化使用到的中间件并在指定端口侦听

    - `app.use`拿到一个回调函数，它将中间件推入一个叫 middleware 的 list 中。

        ```js
         use(fn) {
            if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
             // 中间件必须是一个函数
              fn = convert(fn);
            }
            debug('use %s', fn._name || fn.name || '-');
            this.middleware.push(fn);// 将fn push
            return this;
          }
        ```

    - `listen`的时候执行函数。

        ```js
        listen(...args) {
            const server = http.createServer(this.callback());
            // createServer语法糖，请求事件的监听函数为      			this.callback()
            return server.listen(...args);
        }
        callback() {
            const fn = compose(this.middleware);
            // 将中间件函数合成一个函数fn
            // ...
            const handleRequest = (req, res) => {
              const ctx = this.createContext(req, res);
                // 使用req和res创建一个上下文环境ctx
              return this.handleRequest(ctx, fn);
            };
        
            return handleRequest;
          }
        ```

        中间件的依次执行是如何实现的？`conpose`函数的实现=>`koa-compose`是基于**洋葱模型**来实现。

        简单来说就是，它从第一个中间件开始，遇到`next`就中止本中间件的代码转而执行下一个中间件的代码...一直到最后一个中间件，然后从最后一个中间件开始倒退执行`next`,类似于堆栈的先进后出。

2. 请求处理阶段,请求到来，进行请求的处理

    请求处理是在`request.js`当中的`handleRequest`函数：

    ```js
    handleRequest(ctx, fnMiddleware) {
        const res = ctx.res;
        res.statusCode = 404;
        // koa默认的错误处理函数，它处理的是错误导致的异常结束
        const onerror = err => ctx.onerror(err);
        // respond函数里面主要是一些收尾工作，例如判断http code为空如何输出，http method是head如何输出，body返回是流或json时如何输出
        const handleResponse = () => respond(ctx);
        // 第三方函数，用于监听 http response 的结束事件，执行回调
        // 如果response有错误，会执行ctx.onerror中的逻辑，设置response类型，状态码和错误信息等
        onFinished(res, onerror);
    
        return fnMiddleware(ctx).then(handleResponse).catch(onerror);
      }
    ```

    其中`ctx`是一个上下文对象，`request`和`response`两个文件来扩展属性，并将其转为`ctx`对象。`listen`回调中通过`createContext函数`来创建`ctx`：

    ```js
    createContext(req, res) {
        const context = Object.create(this.context);
        //使用Object.create方法是为了继承this.context但在增加属性时不影响原对象
        const request = context.request = Object.create(this.request);
        const response = context.response = Object.create(this.response);
        context.app = request.app = response.app = this;
        context.req = request.req = response.req = req;
        context.res = request.res = response.res = res;
        request.ctx = response.ctx = context;
        request.response = response;
        response.request = request;
        context.originalUrl = request.originalUrl = req.url;
        context.state = {};
        return context;
      }
    ```
    请求到来时，首先执行第一个阶段封装的`compose`函数，然后进入`handleResponse`中进行一些收尾工作。至此，完成整个请求处理阶段。