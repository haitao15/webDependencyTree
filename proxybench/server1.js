var ws = require('nodejs-websocket');
var port=8008

var server = ws.createServer(function(conn){
    //受到连接触发//
//在服务端cmd安装npm install nodejs-websocket//
    console.log('new connection');
    conn.on("text",function(str){
        // 收到信息触发     接收 //

        var fs = require("fs");
fs.writeFile("/usr/local/graphdata/data.txt",str,{flag:'w',encoding:'utf-8',mode:'777'},function(err){
     if(err){
         console.log("文件写入失败"+err.message)
     }else{
         console.log("文件写入成功");
     }
    }) 

    fs.unlink('/usr/share/nginx/html/gra/graph.png',function(error){
    if(error){
        console.log(error);
        return false;
    }
    console.log('删除文件成功');
})

function sleep(d){
  for(var t = Date.now();Date.now() - t <= d;);
}


var exec = require('child_process').exec;
var cmdStr = 'python /usr/local/graphdata/test.py';
exec(cmdStr, function (err, stdout, srderr) {
    if (err) {
        console.log(srderr);
    } else {
        console.log(stdout);
    }

});
//sleep(5000)


        var path="http://47.94.4.129/gra/graph.png"
        console.log("received"+str)
        
        conn.sendText(path) // 发送 数据 //
    })
    conn.on("close",function(code,reason){
        // 断开连接触发 //
        console.log("connection closed")
    })
    conn.on("error",function(err){
        // 出错触发 //
        console.log("header err")
        console.log(err)
    })

}).listen(port)
console.log("websocket server listen port is" + port)
