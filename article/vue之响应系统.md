---
关于vue观察者与依赖收集系统
---

##  `vue`之响应系统

在`vue`中，我们使用`$watch`来观察某个对象，当被观察者发生变化时执行指定的**观察者**。比如最基本的当被观察者是一个简单字段：

```js
const ins = new Vue({
  data: {
    a: 1
  }
})

ins.$watch('a', () => {
  console.log('修改了 a')
})
```

当字段`a`修改之后，会触发`$watch`的回调函数。在`vue`中，会考虑更多的内容，比如如何深度观测，如何处理数组以及其他的边界条件，比如我们也会写成下面这种形式：

```js
watch: {
		ruleForm: {
			handler() {
				conole.log('修改了ruleForm！')
			},
			deep: true
            // 深度监听，被观察者是一个对象。
		}
	},
```

摆在我们面前的第一个问题是，如何得知被观察者发生变化了？答案是`Object.defineProperty`（在接下来`vue3`版本，会通过`proxy`来实现），通过该函数为对象的每个属性设置一对`getter/setter`从而得到被改变的属性：

```js
Object.defineProperty(data,'a',{
    set(){
        console.log('设置了a')
    },
    get(){
        console.log('读取了a')
    }
})
```

此时就实现了第一步，对属性`a`的设置和获取操作的拦截。

第二步，在获取属性`a`的时候收集依赖，然后在设置属性`a`的时候触发依赖集合。考虑几个问题：

- 只能访问某个具体定义属性： `for`循环包裹
- `get`函数需返回值
- `data`为一个嵌套对象时： 递归定义

如下：

```js
const data = {
  a: 1,
  b: 1
}
// for循环将访问器属性包裹
for (let key in data) {
  const dep = []
  let val = data[key] // 缓存字段原有的值
  Object.defineProperty(data, key, {
    set (newVal) {
      // 如果值没有变什么都不做
      if (newVal === val) return
      // 使用新值替换旧值
      val = newVal
      dep.forEach(fn => fn())
    },
    get () {
        // target 此时已保存了依赖函数
      dep.push(Target)
      return val  // 将该值返回
    }
  })
}
// Target 是全局变量
let Target = null
function $watch (exp, fn) {
  // 将 Target 的值设置为 fn
  Target = fn
  // 读取字段值，触发 get 函数
  data[exp]
}
data.a = 2
data.b = 3
$watch('a', () => {
  console.log('第一个依赖')
})
$watch('b', () => {
  console.log('第二个依赖')
})
```

首先定义了全局变量`Target`，然后在`$watch`中将`Target`的值设置成`fn，`也就是依赖。接着读取字段的值`data[exp]`从而触发被设置的属性的`get`函数，而在`get`函数中，此时的`Target`变量就是我们要收集的依赖，将其`push`进`dep`数组。

还有第三个问题，当对象为一个嵌套复杂类型时，需要递归将其变成响应式属性：

```js
function walk (data) {
    for(let key in data) {
         const dep = []
        let val = data[key]
        // 如果 val 是对象，递归调用 walk 函数将其转为访问器属性
        const nativeString = Object.prototype.toString.call(val)
        if (nativeString === '[object Object]') {
          walk(val)
        }
        Object.defineProperty(data, key, {
          set (newVal) {
            if (newVal === val) return
            val = newVal
            dep.forEach(fn => fn())
          },
          get () {
            dep.push(Target)
            return val
          }
        })
	}
}
walk(data)
```

同样需要修改`$watch`函数：

```js
const $watch = (exp,fn)=>{
    Target = fn
    let pathArr,
        obj = data
    // 是否嵌套
    if (/\./.test(exp)){
        pathArr = exp.split('.')
        // 依次循环探底动态修正obj
        pathArr.forEach(p =>{
            obj = obj[p]
		})
        return
    }
    data[exp]
}
```

`$watch`函数实质上就是为了访问到要观察的字段，触发该字段的`get`函数，进而收集依赖。

归纳来看，我们通过`Object.defineProperty`来劫持对象的`set`和`get`方法，用`$watch`来触发`get`方法以此来收集依赖。然后在设置属性时触发所有依赖。
