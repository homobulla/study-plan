---
Title: generator and async 
date: 2018/10/24
tags: ES6
---

异步中的`generator`和`async`

`generator `内部多种状态。执行`generator`函数会返回一个遍历器。不仅是状态机，还是遍历器生成函数，我们可以遍历每一个状态。于是又称之为**生成器**。

> `async`函数的实现原理，就是将`generator`函数和自动执行器，包装在一个函数里。

如何理解这句话，内部代码如何实现？是这篇文章的重点。

####  遍历器的next

首先，`generator`函数会返回一个指向内部状态的指针对象，我们必须调用遍历器的`next`方法才能走到`generator`函数内部的下一个状态。

于是，我们需要看一下`next`方法：

```js
const Iterator = arr => {
    let nextIndex = 0
    return {
        next: function() {
            return nextIndex < arr.length
                ? { value: arr[nextIndex++] }
                : { done: true }
        }
    }
}
const demo = Iterator([1, 2, 3])
demo.next()
```

#### yield 与 *

回到`generator`本身，前面已经讲`generator`函数的调用并不会执行，而是必须用遍历器对象的`next`方法。即每次调用`next`,内部指针就从接着从上次停下的地方继续执行，直到遇到`yield`语句。

即`generator`本身生成了遍历器，所以它的执行是分阶段用`next`不断触发的。`yield`表达式是暂停执行标记，`next`则是继续执行。

我们可以在`generator`函数内很容易控制语句的执行与暂停，每一次的`yield`表达式都会返回相应的`value`,基于此我们可以将异步执行放在`yield`中，暂停指针，当返回`value`即有结果时，将`value`抛出再用`next`继续下一步。

```js
function* Ge(){
    yield 'homo';
    yield 'bulla';
    return 'very Handsome'
}
let myself = Ge();
myself.next() // homo
myself.next() // bulla
myself.next() // very Handsome

```

上面的`Ge`函数通过调用`next`三次结束。返回一个`{value: "very Handsome", done: true}`，包含`value`和`done`属性的对象。`value`代表当前指针，`done`则表示遍历是否结束。

需要注意的是，`yield`是一个`惰性求值`语句，只有调用`next`时，才会执行其后面的语句。

`yield`表达式本身**没有返回值**`undefined`,`next`方法可以带一个参数，该参数就**被当作上一个`yield`的返回值**。这给我们提供了控制`generator`函数内部执行的一个接口。

也就是说，**`generator`函数从暂停状态到恢复运行。它的上下文状态是不变的**。

#### async

接下来是`async`,首先它和`Generator`是不同的。`async`会返回一个`promise`对象，在一些复杂的异步场景，`promise`的`all`和`race`会得心应手。而`Generator`只是一个生成器。

我们来看一下`Generator`和`async`的使用：

```js
// 使用 generator
var fetch = require('node-fetch');
var co = require('co');
function* gen() {
    var r1 = yield 		                      			fetch('https://api.github.com/users/github');
    var json1 = yield r1.json();
    console.log(json1.bio);
}
co(gen);
// 使用 async
var fetch = require('node-fetch');
var fetchData = async function () {
    var r1 = await 					   		  			fetch('https://api.github.com/users/github');
    var json1 = await r1.json();
    console.log(json1.bio);
};
fetchData();

```

`async`函数就是将 Generator 函数的星号（`*`）替换成`async`，将`yield`替换成`await`,并内置执行器。

进一步说，`async`函数完全可以看作多个异步操作，包装成的一个 Promise 对象，而`await`命令就是内部`then`命令的语法糖。