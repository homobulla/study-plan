---
title: 随手笔记
tags: all
data: 2018/10/26
---

[高质量JavaScript基本要点](https://github.com/jayli/javascript-patterns/blob/master/chapter2.markdown)

- `var`时的副作用，`delete`无法操作。
- 单`var`模式
- `for`循环的优化（存疑）,`length`的缓存问题。`i++`不推荐写法
- `for-in`循环中属性遍历不固定，用于非数组对象
- 不扩充内置对象的原型
- 避免隐式转换类型（除非对变量类型很自信）
- 

### [vue-router](http://xc.hubwiz.com/class/5983d3aeff52d0da7e3e3d50/#1/4)

- 选中路由激活`router-link-exact-active router-link-active`类
- `name`属性导出的命名路由算法上优于`pathMap`
- `this.$router.push`匹配路由后向历史访问栈压入当前路由。

