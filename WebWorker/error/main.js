console.log('WORKER TASK: ', 'running');
// 监听事件
onmessage = function (e) {
    console.log('worker: ', '我接收到了', e.data);
    // 发送数据事件
    // 注意：这里的 abc 变量在 worker.js 中并未定义，所以这里执行过程中会错处
    postMessage(abc);
};