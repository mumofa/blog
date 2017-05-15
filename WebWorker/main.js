console.log('WORKER TASK: ', 'running');
// 监听事件
onmessage = function (e) {
    console.log('worker: ', '我接收到了', e.data);
    // 发送数据事件
    postMessage('Hello, I am Worker');
};