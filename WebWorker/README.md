
JavaScript是单线程运行的，但如果执行执行一个耗时很长的方法时，JS就会一直被占用，后面的代码就无法执行。

所以HTML5引入了一个工作线程 **WebWorker** 的概念。它允许开发人员编写能够长时间运行而不被用户所中断的后台程序，去执行事务或者逻辑，并同时保证页面对用户的响应。

简而言之，就是允许JavaScript创建多个线程，但是子线程完全受主线程控制，且不得操作DOM。

从而，可以用 **WebWorker** 来处理一些比较耗时的计算。

# 一、Web Worker 介绍
> Web Worker为Web内容在后台线程中运行脚本提供了一种简单的方法。线程可以执行任务而不干扰用户界面。此外，他们可以使用XMLHttpRequest执行 I/O (尽管responseXML和通道属性总是为空)。一旦创建， 一个worker 可以将消息发送到创建它的JavaScript代码, 通过将消息发布到该代码指定的事件处理程序 。

## 先尝试实例化一下

实例化运行一个 Worker 很简单，我们只需要 `new` 一个 `Worker` 全局对象即可：`new Worker(filepathname)`， 接受一个 filepathname String 参数，用于指定 Worker 脚本文件的路径；

    var worker = new Worker('./main.js');
    
    // main.js
    console.log('WORKER TASK: ', 'running');
    
用浏览器打开，我们可以看到 console 打印出来：

    WORKER TASK:  running          worker.js:1
    
说明我们加载并且执行到了这个 Worker 脚本。


# 二、Web Worker 的 用法

#### 1、 通信数据

##### 发送信息  **postMessage(data)**

子线程与主线程之间互相通信使用方法，传递的data为任意值。

    worker = new Worker('url');
    //worker.postMessage传递给子线程数据，对象
    worker.postMessage({first:1,second:2});
    
    //子线程中也可以使用postMessage，如传递字符串
    postMessage(‘test’);
    
##### 接收信息  **onmessage**

子线程与主线程之间互相通信使用方法，传递的data为任意值。

    worker = new Worker('url');
    // 监听事件
    worker.onmessage = function (e) {
        console.log('index: 我接收到了', e.data);
    };
    
    //子线程中直接使用onmessage
    onmessage = function (e) {
        console.log('worker: 我接收到了', e.data);
    };
    
综合例子

    // index
    var worker = new Worker('main.js');
    // 监听事件
    worker.onmessage = function (e) {
        console.log('index: ', '我接收到了', e.data);
    };
    // 触发事件，传递信息给 Worker
    worker.postMessage('Hello Worker, I am index.html');
    
    // main.js
    onmessage = function (e) {
        console.log('worker: ', '我接收到了', e.data);
        // 发送数据事件
        postMessage('Hello, I am Worker');
    };
    
#### 2、 终止 worker

如果在某个时机不想要 Worker 继续运行了，那么我们需要终止掉这个线程，可以调用 `worker` 的 `terminate` 方法 ：

    var worker = new Worker('./worker.js');
    ...
    worker.terminate();
    
#### 3、 处理错误

    // index
    var worker = new Worker('main.js');
    // 监听事件
    worker.onmessage = function (e) {
        console.log('index: ', '我接收到了', e.data);
    };
    // 监听错误
    worker.onerror = function (e) {
        console.log('ERROR', e);
    };
    // 触发事件，传递信息给 Worker
    worker.postMessage('Hello Worker, I am index.html');
    
    // main.js
    onmessage = function (e) {
        console.log('worker: ', '我接收到了', e.data);
        // 发送数据事件
        postMessage(abc);
    };
    
# 三、Web Worker 的 上下文

在 Worker 线程的运行环境中没有 window 全局对象，也无法访问 DOM 对象，它的全局上下文是一个叫 **WorkerGlobalScope** 的东东。所以一般来说它可以与setTimeout、setInterval等协作执行纯 JavaScript 的计算操作。

**WorkerGlobalScope** 作用域下的常用属性、方法如下：

- `self` ：我们可以使用 WorkerGlobalScope 的 self 属性来或者这个对象本身的引用；
- `location` 对象：可以获取到有关当前 URL 的信息；
- `navigator` 对象：可以获取到 ppName，appVersion，platform，userAgent 等信息；
- `XMLHttpRequest` 对象：意味着我们可以在 Worker 线程中执行 **ajax** 请求；
- `importScripts` ：我们可以通过 **importScripts** 方法通过url在worker中加载库函数关闭当前线程，与terminate作用类似；

> PS ：**importScripts** 是可以加载 跨域文件，但要注意加载的文件中 不能使用 **window全局** 的方法 因为依然在 **WorkerGlobalScope** 中执行，要注意。 

- `close` ：关闭当前线程，与terminate作用类似；
- `setTimeout()， clearTimeout()， setInterval()， clearInterval()`：有了设计个函数，就可以在 Worker 线程中执行定时操作了；

# 四、Web Worker 的 一些暂未广泛支持的特性

### Subworker 

如果需要的话 worker 能够生成更多的 worker。这就是所谓的subworker，它们必须托管在同源的父页面内。而且，subworker 解析 URI 时会相对于父 worker 的地址而不是自身页面的地址。这使得 worker 更容易记录它们之间的依赖关系。

### SharedWorker

对于 Web Worker ，一个 tab 页面只能对应一个 Worker 线程，是相互独立的；而 SharedWorker 提供了能力能够让不同标签中页面共享的同一个 Worker 脚本线程；

当然，有个很重要的限制就是它们需要满足同源策略，也就是需要在同域下；

在页面（可以多个）中实例化 Worker 线程：

    // main.js
    var myWorker = new SharedWorker("worker.js");
    
    myWorker.port.start();
    
    myWorker.port.postMessage("hello, I'm main");
    
    myWorker.port.onmessage = function(e) {
      console.log('Message received from worker');
    }
    
    
    // worker.js
    onconnect = function(e) {
      var port = e.ports[0];
     
      port.addEventListener('message', function(e) {
        var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
        port.postMessage(workerResult);
      });
    
      port.start();
    }
    
在 SharedWorker 的使用中，我们发现对于 SharedWorker 实例对象，我们需要通过 port 属性来访问到主要方法；

同时在 Worker 脚本中，多了个全局的 `connect()` 函数，同时在函数中也需要去获取一个 post 对象来进行启动以及操作；

这是因为，多页页面共享一个 SharedWorker 线程时，在线程中需要去判断和区分来自不同页面的信息，这是最主要的区别和原因。

# 五、Web Worker 的 兼容性

[Can I Use WebWorker](http://caniuse.com/#feat=webworkers)

![image](https://pic3.zhimg.com/v2-1e715bda9951a36fb8ce92b547ffb07a_b.png)

# 六、总结

主要的应用场景：

- 对于图像、视频、音频的解析处理；
- canvas 中的图像计算处理；
- 大量的 ajax 请求或者网络服务轮询；
- 大量数据的计算处理（排序、检索、过滤、分析...）；
