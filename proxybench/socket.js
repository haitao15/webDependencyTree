

function sleep(d){
    for(var t = Date.now();Date.now() - t <= d;);
}

var ws = new WebSocket("ws://47.94.4.129:8008/");// 设置服务器地址 //
ws.onopen=function(){  // onopen 连接触发 //
    console.log("websocket open");
    document.getElementById("recv").innerHTML="Connected";
    //  innerHTML 可以 获取 也可以 插入  //

}
ws.onclose=function(){ // onclose 断开触发 //
    console.log("websocket close");
}
ws.onmessage =function(e){ // onmessage 接收到信息触发  //
    console.log(e.data);

    sleep(2000);
    document.getElementById("recv").innerHTML = "<img class='pig' src='"+e.data+"'>"

}
document.getElementById("sendb").onclick=function(){ // 监测 id=“sendb”的 按钮 触发 onclick 就会发送数据 send //
        var txt = document.getElementById("logarea").value;
        ws.send(txt);

    }
