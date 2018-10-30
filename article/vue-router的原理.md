---
Title: vue-router原理
tags: js
date: 2018/10/29
---

今天来了解一下[vue-router](https://github.com/vuejs/vue-router)。

`vue-router`包括三个部分：

- `VueRouter`：路由器类，根据路由请求在路由视图中动态渲染选中的组件。
- `router-link`:路由链接组件，生命用以提交路由请求的用户接口。
- `vue-view`:路由视图组件，负责动态渲染路由选中的组件。

大致是首先通过`hashChange`事件来监听`hash`模式下的路由改变，执行`history.transitionTo(...)`继而通过路由表`nameMap、pathMap`来匹配具体的路由组件，`vue-view`将之渲染出来。

###hash

`hash`即`URL`中“#”字符后面的部分。

`hash`值的改变不会导致页面重新加载，只会触发`hashchange`事件。`hash`值本身也不会随请求发送到服务端。

#### 如何监听

```js
 // history 模式
if (history instanceof HTML5History) {
      history.transitionTo(history.getCurrentLocation())
    } else if (history instanceof HashHistory) {
      const setupHashListener = () => {
        history.setupListeners()
         // hash模式下，监听路由
      }
      // transitionTo 方法执行
      history.transitionTo(
        history.getCurrentLocation(),
        setupHashListener,
        setupHashListener
      )
    }
```

`vue-router`本身作为一个插件安装在了`vue`上，通过`Vue.init()`注册了`beforeCreate()`钩子函数。从而在`vue`项目的整个生命周期中都能够监听`hashchange`事件。
$$
hashchange->match route->set vm.route-><reouter-view> render() -> render matched component
$$


