
function toDecimal2(x) {  
    var f = parseFloat(x);  
    if (isNaN(f)) {  
        return false;  
    }  
    var f = Math.round(x*100)/100;  
    var s = f.toString();  
    var rs = s.indexOf('.');  
    if (rs < 0) {  
        rs = s.length;  
        s += '.';  
    }  
    while (s.length <= rs + 2) {  
        s += '0';  
    }  
    return s;  
}  

function reloadPage() {
	var options = {
	    ignoreCache: true,
	    userAgent: undefined
	};
	chrome.devtools.inspectedWindow.reload(options);
}

function get_name(str) {						//获取url中的对象名

    var temp_list = str.split('/')
    var objname = temp_list[temp_list.length - 1]
    if (objname == '') {
        console.log("This is html file!")
    }
    return objname
}

function unique(arr){
    var hash=[];
    for (var i = 0; i < arr.length; i++) {
        if(hash.indexOf(arr[i])==-1){
            hash.push(arr[i]);
        }
    }
    return hash;
}

function f(dict) {
    var parent_list=[]
    for (var item in dict)
    {
        if (item==="callFrames"&&dict["callFrames"].length===0)
        {
                continue
        }

        else if(item==="callFrames"&&dict["callFrames"].length!==0)
        {
            for (j=0;j<dict["callFrames"].length;j++)
            {
                if(get_name(dict["callFrames"][j]['url'])==='')
                {parent_list.push("index.html")}
                else
                {parent_list.push(get_name(dict["callFrames"][j]['url']))}
            }
            return parent_list
        }

        else if (item==="parent")
        {
            return f(dict[item])
        }
    }
}


function listen() {
	var actionButton = document.querySelector('#actionButton');
	var clearButton = document.querySelector('#clearButton');
	var clearButton1 = document.querySelector('#clearButton1');
	var reloadButton = document.querySelector('#reloadButton');
	var bodyDom = document.querySelector('#detailBody');
	   	
	clearButton.addEventListener("click", function() {
		bodyDom.innerHTML = "";
	});

    clearButton1.addEventListener("click", function() {
        document.getElementById("logarea").innerHTML = "";
    });

	reloadButton.addEventListener("click", function() {
	   	bodyDom.innerHTML = "";
		reloadPage();
	});



	actionButton.addEventListener("click", function(){
		chrome.devtools.network.getHAR(function (log) {
			//var str1="";
			//var flag=0
			var i=0,j=0;
			var relation={};//  当前对象与父节点依赖关系的字典
            for(j = 0; j < log.entries.length; j++) {
                var initialEntry1 = log.entries[j];//   所有对象数据都保存在log.entries的数组里
                var test1=initialEntry1['request']['url'];
				var curSize = toDecimal2(initialEntry1['response']._transferSize / 1000);
                var obj_n=get_name(test1) //get_name()是获取url中对象的名字，例如http://192.168.1.250/1.js,对象就是1.js
				if(obj_n=='')
				{obj_n='index.html'}//  用/截取文件名，当是index.html时候需要处理，因为index.html的url是http://192.168.1.250/
				var parent=[];//    当前对象的父节点列表
                //str1=str1+obj_n+"="
				if(initialEntry1['_initiator']["type"]==="parser"||initialEntry1['_initiator']["type"]==="other")
				{
				    //当是other或parser的时候认为是解析html生成的
					//str1='-'+str1+"index_parser"+'\r\n'
					parent.push("index.html")
					parent.push(curSize);
                    relation[obj_n]=parent
					continue
				}
				else
				{
                    var obj_dict=initialEntry1['_initiator']['stack']

                        parent=f(obj_dict)
                    	parent=unique(parent)  //unique()是去除父节点列表中重复的元素
                    var parent = parent.filter(function (s) {
                        return s && s.trim(); // 数组去空,注：IE9(不包含IE9)以下的版本没有trim()方法
                    });
						parent.push(curSize);
						relation[obj_n]=parent //将得到的父节点列表添加进依赖关系的字典中去
                }
            }

            // temp_obj=log.entries[3]
            // temp_dict=temp_obj['_initiator']['stack']
            // parent=f(obj_dict)

			var logDom = document.querySelector('#logarea');
            var relation_data=JSON.stringify(relation) //将依赖关系数据转成json数据格式
            // var relation_data=parent //将依赖关系数据转成json数据格式
	        logDom.innerHTML += relation_data ;


		});
	});


	chrome.devtools.network.onRequestFinished.addListener(function(request) {
        if (request.response.bodySize > 40*1024) {
            chrome.devtools.inspectedWindow.eval(
                'console.log("Large image: " + unescape("' +
                escape(request.request.url) + '"))');
        }


	   	var objURL = request['request'].url;
	   	var bodyDom = document.querySelector('#detailBody');
	   	bodyDom.innerHTML += '\
<tr>\r\n\
<td style="white-space: nowrap;text-overflow: ellipsis;">' + objURL +'</td>\r\n\
<td style="white-space: nowrap;text-overflow: ellipsis;">' + transferSizeUnit(request['response']._transferSize) +'</td>\r\n\
</tr>';
	});

  	console.log('listen');
}



function transferSizeUnit(size) {
	if (size < 1000 * 1000)
		return toDecimal2(size/1000) + ' KB';
	else 
		return toDecimal2(size/1000000) + ' MB';
}

window.addEventListener('load', listen);

