# react-redux-async
这是自己学习使用React+React-redux搭建的一个小demo，实现了一个简单的todo列表和基本的删除还原操作，以及做了一个简单的路由跳转实验，主要是让自己了解react-redux怎么跟react结合在一起，将整体的状态放在state中。

### 项目安装
    npm install
    npm start
打开[http://localhost:3000](http://localhost:3000) 查看项目.

### 知识点
- `connect`
将`container`容器中的数据|方法通过`props`传递到`ui`容器
- `Provider`
将全局的`store`传递给各层次组件中，利用`React`的`context`
- `combineReducers(reducers)`
合并项目中的`reducers`，生成一个集合`reducer`。
`combineReducers`本身是一个`higher-order reducer`
- `createStore(rootReducer, initiateState, enhance)`
生成全局唯一的一个`store`
- `middleWare`
扩展`store`功能的中间件，比如让`action`返回一个函数(可以异步请求数据)，进行`dispatch`的监控等
- `injectReducers`
也是一个`higher-order reducer `,可主要是在项目中可以动态注入`reducer`
-  `compose`
用于多个函数从左到右的组合，最后合成一个函数，用于`createStore`中的`enhance`中。
可以将`applyMiddleware`和`redux-extension`合并起来

### 学习来源
[React-redux中文文档](https://cn.redux.js.org/)
[React文档](https://react.docschina.org/docs/getting-started.html)
[React-router](https://react-guide.github.io/react-router-cn/)(react-router已经是4.0了)
[React-router4.0教程](https://reacttraining.com/react-router/core/guides/philosophy)
