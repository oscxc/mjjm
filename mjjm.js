// region[mjjm.js]
// 作者：七八个星天怪
// LICENSE：MIT
// endregion

// region[代码]
"use strict";
(function (symbol) {
    // region[本库依赖变量]
    var version = "1.0.0";
    var contentTypes = [
        "text/plain;charset=UTF-8",
        "application/x-www-form-urlencoded;charset=utf-8",
        "application/json;charset=utf-8",
        "multipart/form-data;charset=utf-8",
        "text/xml;charset=utf-8",
        "ArrayBuffer"
    ];
    var W = window.innerWidth;
    var H = window.innerHeight;
    // endregion

    // region[本库依赖函数]
    function extend(t,o) {
        for(var n in o){
            t[n]=o[n] ;
        }
    }
    function type(v) {
        return Object.prototype.toString.apply(v).replace("[object ","").replace("]","");
    }
    function extension(path) {
        var temp= path.split(".");
        return temp[temp.length-1];
    }
    function each(v,f) {
        var t = type(v);
        if (t==="Array"||t==="NodeList") {
            for (var i=0;i<v.length;i++) {
                f(i,v[i]);
            }
        }
        else if(t==="Object"){
            for (var key in v) {
                f(key,v[key]);
            }
        }
        else if(t==="Number"){
            for (var i=0;i<v;i++) {
                f(i,v);
            }
        }
        else{
            throw new TypeError("该对象不支持遍历");
        }
    }
    function isEmptyObject(o) {
        for (var k in o)
            return false;
        return true;
    }
    function domLoad(f) {
        var a = function () {
            document.removeEventListener("DOMContentLoaded",a);
            f();
        };
        document.addEventListener("DOMContentLoaded",a);
    }
    function create(tagName,attrs) {
        var el;
        switch (tagName){
            case "text":
                el = document.createTextNode(attrs);
                break;
            case "comment":
                el = document.createComment(attrs);
                break;
            case "fragment":
                el = document.createDocumentFragment();
                break;
            default:
                el = document.createElement(tagName);
                each(attrs,function (k,v) {
                    el.setAttribute(k,v);
                });
                break;
        }
        return el;
    }//创建节点并返回
    function createTree(obj) {
        //demo
        // $.createTree({
        //     el:document.body,
        //     childs:[
        //         {
        //             el:$.create("span",{id:"sp0"}),
        //             childs:[
        //                 {
        //                     el:$.create("text","这是文本节点")
        //                 }
        //             ]
        //         },
        //         {
        //             el:$.create("div",{id:"d1"}),
        //             childs:[
        //                 {
        //                     el:$.create("div",{id:"d3"}),
        //                     childs:[
        //                         {
        //                             el:$.create("div",{id:"d6"}),
        //                             childs:[
        //                                 {
        //                                     el:$.create("div",{id:"d7"})
        //                                 },
        //                                 {
        //                                     el:$.create("div",{id:"d8"})
        //                                 }
        //                             ]
        //                         },
        //                     ]
        //                 }
        //             ]
        //         }
        //     ]
        // });
        var el = obj.el;
        var childs = obj.childs;
        if(childs){
            each(childs,function (k,v) {
                createTree(v);
                el.appendChild(v.el);
            });
        }
    }//创建节点树
    // endregion

    // region[内置方法原型扩展]
    // --------------------------扩展String
    extend(String.prototype,{
        //返回字符串中某字符的个数
        charCount:function (c) {
            var res = this.match(new RegExp(c,'g'));
            return res?res.length:0;
        },
        //判断字符串是否是JSON字符串
        isJSON:function () {
            try{
                JSON.parse(this);
                return true;
            }
            catch (e){
                return false;
            }
        },
        isXML:function () {
            var xmlDoc;
            try{
                xmlDoc = new DOMParser().parseFromString(this,"text/xml");
            }
            catch (e){
                return false;
            }
            var error = xmlDoc.getElementsByTagName("parsererror");
            if (error.length > 0) {
                return false;
            }
            else {
                return true;
            }
        },
        inArray:function (arr) {
            for(var i=0;i<arr.length;i++){
                if(this==arr[i]){
                    return true;
                }
            }
            return false;
        },
        toInt:function () {
            return parseInt(this);
        }
    });
    // --------------------------扩展Array
    extend(Array.prototype,{
        toIntArray:function () {
            var _this = this;
            each(this,function (k,v) {
                _this[k] = v.toInt();
            });
            return this;
        }
    });
    // --------------------------扩展Date
    extend(Date.prototype,{
        year:function () {return this.getFullYear();},
        month:function(){return this.getMonth()+1},
        day:function(){return this.getDate()},
        hour:function(){return this.getHours()},
        minute:function(){return this.getMinutes()},
        second:function(){return this.getSeconds()},
        millisecond:function(){return this.getMilliseconds()},
        timestamp:function(){return Math.floor(this.getTime()/1000)},
        millitimestamp:function(){return this.getTime()},
        addMilliSecond:function (s) {
            this.setTime(this.getTime()+ s);
        },
        addSecond:function (s) {
            this.setTime(this.getTime()+ s*1000);
        },
        addMinute:function (s) {
            this.setTime(this.getTime()+ s*60000);
        },
        addHour:function (s) {
            this.setTime(this.getTime()+ s*3600000);
        },
        addDay:function (s) {
            this.setTime(this.getTime()+ s*86400000);
        }
    });
    // endregion

    // region[Promise]
    try{
        if(Promise){}
    }
    catch (e){
        window.Promise = function(fn) {
            var state = "pending";
            var callbacks = [];
            var result = null;
            function res_rej(a,b,c) {
                if(state!=="pending"){
                    return;
                }
                if(b&&b["then"]&&typeof b["then"] === 'function'){
                    b["then"](resolve, reject);
                    return;
                }
                state = a;
                result = b;
                callbacks.forEach(function (obj) {
                    obj[c](result);
                });
            }
            function resolve(value) {
                res_rej("fulfilled",value,0);
            }
            function reject(reason) {
                res_rej("rejected",reason,1);
            }
            this.then = function (onFulfilled,onRejected) {
                return new Promise(function (resolve, reject) {
                    switch (state){
                        case "pending":
                            callbacks.push([
                                function () {
                                    resolve(onFulfilled(result));
                                },
                                function () {
                                    reject(onRejected(result));
                                }
                            ]);
                            break;
                        case "fulfilled":
                            resolve(onFulfilled(result));
                            break;
                        case "rejected":
                            reject(onRejected(result));
                            break;
                    }
                });
            };
            this.catch = function (onRejected) {
                return this.then(null, onRejected);
            };
            fn(resolve,reject);
        };
        Promise.resolve = function (value) {
            return new Promise(function(resolve) {
                resolve(value);
            });
        };
        Promise.reject = function (reason) {
            return new Promise(function(resolve, reject) {
                reject(reason);
            });
        };
        Promise.all = function (promises) {
            return new Promise(function(resolve, reject) {
                var count = 0;
                var values = [];
                for (var i = 0; i < promises.length; i++) {
                    Promise.resolve(promises[i]).then(function(value) {
                        values.push(value);
                        if (count === promises.length-1) {
                            resolve(values);
                        }
                        else{
                            count++;
                        }
                    }, function(reason) {
                        reject(reason);
                    });
                }
            });
        };
        Promise.race = function (promises) {
            return new Promise(function(resolve, reject) {
                for (var i = 0; i < promises.length; i++) {
                    Promise.resolve(promises[i]).then(function(value) {
                        resolve(value);
                    }, function(reason) {
                        reject(reason);
                    })
                }
            });
        };
    }
    // endregion

    // region[mjjm 函数开始]
    function mjjm(selector) {
        if(type(selector)==="String"){
            this.els = document.querySelectorAll(selector);
            if(this.els.length===0){
                throw new Error("选择器未选到元素");
            }
        }
        else if(type(selector)==="Array"){
            this.els = selector;
        }
        else {
            this.els = [selector];
        }
        this.el = this.els[0];
        return this;
    }
    // endregion

    // region[扩展 mjjm.prototype]
    // --------------------------事件
    extend(mjjm.prototype,{
        addEvent:function (name,handle,b) {
            each(this.els,function (k,v) {
                v.addEventListener(name,handle,b?b:false);
            });
            return this;
        },
        delEvent:function (name,handle) {
            each(this.els,function (k,v) {
                v.removeEventListener(name,handle);
            });
            return this;
        },
        click:function (callback,b) {
            each(this.els,function (k,v) {
                v.addEventListener("click",callback,b?b:false);
            });
            return this;
        }
    });
    // --------------------------设置和获取值
    function vth(o,t,val) {
        if(val||val==""){
            each(o.els,function (k,v) {
                v[t] = val;
            });
            return o;
        }
        else{
            if(o.els.length===1){
                return o.els[0][t];
            }
            else{
                var tmp = [];
                each(o.els,function (k,v) {
                    tmp.push(v[t]);
                });
                return tmp;
            }
        }
    }
    extend(mjjm.prototype,{
        val:function(v){
            return vth(this,"value",v);
        },
        text:function (v) {
            return vth(this,"innerText",v);
        },
        html:function (v) {
            return vth(this,"innerHTML",v);
        }
    });
    // --------------------------设置和获取属性
    mjjm.prototype.attr = function () {
        var arg = arguments;
        if(arg.length===1){
            if(type(arg[0])==="String"){
                if(this.els.length===1){
                    return this.el.getAttribute(arg[0]);
                }
                else{
                    var tmp=[];
                    each(this.els,function (k,v) {
                        tmp.push(v.getAttribute(arg[0]));
                    });
                    return tmp;
                }
            }
            else if(type(arg[0])==="Object"){
                each(this.els,function (k,v) {
                    each(arg[0],function (k1,v1) {
                        v.setAttribute(k1,v1);
                    });
                });
                return this;
            }
            else{
                throw new TypeError("参数类型不正确");
            }
        }
        else if(arg.length===2){
            each(this.els,function (k,v) {
                v.setAttribute(arg[0],arg[1]);
            });
            return this;
        }
        else{
            throw new ReferenceError("参数个数不正确");
        }
    };
    // --------------------------设置和获取css
    mjjm.prototype.css = function () {
        var arg = arguments;
        if(arg.length===1){
            if(type(arg[0])==="String"){
                if(this.els.length===1){
                    return window.getComputedStyle(this.el).getPropertyValue(arg[0]);
                }
                else{
                    var tmp = [];
                    each(this.els,function (k,v) {
                        tmp.push(window.getComputedStyle(v).getPropertyValue(arg[0]));
                    });
                    return tmp;
                }
            }
            else if(type(arg[0])==="Object"){
                each(this.els,function (k,v) {
                    each(arg[0],function (k1,v1) {
                        v.style[k1] = v1;
                    });
                });
                return this;
            }
            else{
                throw new TypeError("参数类型不正确");
            }
        }
        else if(arg.length===2){
            each(this.els,function (k,v) {
                v.style[arg[0]] = arg[1];
            });
            return this;
        }
        else{
            throw new ReferenceError("参数个数不正确");
        }
    };
    // --------------------------最常用的css 整数值设置和获取
    function css2int(o,t,v) {
        if(v){
            return o.css(t,v+"px");
        }
        else{
            var tmp = o.css(t);
            return type(tmp)==="String"?tmp.toInt():tmp.toIntArray();
        }
    }
    // W、H、L、T、R、B、fontSize
    extend(mjjm.prototype,{
        W:function (v) {
            return css2int(this,"width",v);
        },
        H:function (v) {
            return css2int(this,"height",v);
        },
        L:function (v) {
            return css2int(this,"left",v);
        },
        T:function (v) {
            return css2int(this,"top",v);
        },
        R:function (v) {
            return css2int(this,"right",v);
        },
        B:function (v) {
            return css2int(this,"bottom",v);
        },
        fontSize:function (v) {
            return css2int(this,"font-size",v);
        }
    });
    // --------------------------CSS3 与 requestAnimationFrame 动画
    // --------------------------2D 动画核心方法（属性值的改变）
    function animate(xs,ys,time,callback,self) {
        var changeArrs = [];
        for(var k1 in xs){
            var obj = {};
            for(var k2 in ys){
                if(k1==k2){
                    obj.p = k1;
                    obj.current = obj.x = xs[k1];
                    obj.y = ys[k2];
                    break;
                }
            }
            changeArrs.push(obj);
        }
        var exec = function (v,current,p) {
            if(p.inArray(["width","height","left","top","right","bottom","fontSize","marginLeft","marginTop","marginRight","marginBottom",
                    "paddingLeft","paddingTop","paddingRight","paddingBottom"])){
                v.style[p] = current + "px";
            }
            else if(p.inArray(["opacity"])){
                v.style[p] = current;
            }
            else{
                var tmp;
                if(p.inArray(["scaleX","scaleY"])){
                    tmp = p+"("+ current + ")";
                }
                else if(p.inArray(["translateX","translateY"])){
                    tmp = p+"("+ current + "px)";
                }
                else if(p.inArray(["rotate","skewX","skewY"])){
                    tmp = p+"("+ current + "deg)";
                }
                if(new RegExp(p).test(v.style.transform)){
                    v.style.transform = v.style.transform.replace(new RegExp(p+"[\\w\\W]+\\)"),tmp);
                }
                else{
                    v.style.transform += tmp;
                }
            }
        };
        function temp(resolve) {
            each(changeArrs,function (k,v) {
                var n = Math.ceil(time * 60 / 1000);
                var step = (v.y-v.x)/n;
                function change() {
                    n--;
                    v.current+=step;
                    if(n>0){
                        if(n===1){
                            v.current = v.y;
                        }
                        each(self.els,function (k3,v3) {
                            exec(v3,v.current,v.p);
                        });
                        requestAnimationFrame(change);
                    }
                    else{
                        if(k==changeArrs.length-1){
                            callback&&callback();
                            resolve();
                        }
                    }
                }
                requestAnimationFrame(change);
            });
        }
        if(self.Promise){
            self.Promise = self.Promise.then(function () {
                return new Promise(temp);
            });
        }
        else{
            self.Promise = new Promise(temp);
        }
        return self;
    }
    extend(mjjm.prototype,{
        W:function (x,y,time,callback) {
            return animate({width:x},{width:y},time,callback,this);
        },
        H:function (x,y,time,callback) {
            return animate({height:x},{height:y},time,callback,this);
        },
        L:function (x,y,time,callback) {
            return animate({left:x},{left:y},time,callback,this);
        },
        T:function (x,y,time,callback) {
            return animate({top:x},{top:y},time,callback,this);
        },
        R:function (x,y,time,callback) {
            return animate({right:x},{right:y},time,callback,this);
        },
        B:function (x,y,time,callback) {
            return animate({bottom:x},{bottom:y},time,callback,this);
        },
        marginTop:function (x,y,time,callback) {
            return animate({marginTop:x},{marginTop:y},time,callback,this);
        },
        marginRight:function (x,y,time,callback) {
            return animate({marginRight:x},{marginRight:y},time,callback,this);
        },
        marginBottom:function (x,y,time,callback) {
            return animate({marginBottom:x},{marginBottom:y},time,callback,this);
        },
        marginLeft:function (x,y,time,callback) {
            return animate({marginLeft:x},{marginLeft:y},time,callback,this);
        },
        margin:function (m1,m2,time,callback) {
            return animate({
                marginTop:m1[0],
                marginRight:m1[1],
                marginBottom:m1[2],
                marginLeft:m1[3]
            },{
                marginTop:m2[0],
                marginRight:m2[1],
                marginBottom:m2[2],
                marginLeft:m2[3]
            },time,callback,this);
        },
        paddingTop:function (x,y,time,callback) {
            return animate({paddingTop:x},{paddingTop:y},time,callback,this);
        },
        paddingRight:function (x,y,time,callback) {
            return animate({paddingRight:x},{paddingRight:y},time,callback,this);
        },
        paddingBottom:function (x,y,time,callback) {
            return animate({paddingBottom:x},{paddingBottom:y},time,callback,this);
        },
        paddingLeft:function (x,y,time,callback) {
            return animate({paddingLeft:x},{paddingLeft:y},time,callback,this);
        },
        padding:function (p1,p2,time,callback) {
            return animate({
                paddingTop:p1[0],
                paddingRight:p1[1],
                paddingBottom:p1[2],
                paddingLeft:p1[3]
            },{
                paddingTop:p2[0],
                paddingRight:p2[1],
                paddingBottom:p2[2],
                paddingLeft:p2[3]
            },time,callback,this);
        },
        fontSize:function (x,y,time,callback) {
            return animate({fontSize:x},{fontSize:y},time,callback,this);
        },
        opacity:function (x,y,time,callback) {
            return animate({opacity:x},{opacity:y},time,callback,this);
        },
        scaleX:function (x,y,time,callback) {
            return animate({scaleX:x},{scaleX:y},time,callback,this);
        },
        scaleY:function (x,y,time,callback) {
            return animate({scaleY:x},{scaleY:y},time,callback,this);
        },
        translateX:function (x,y,time,callback) {
            return animate({translateX:x},{translateX:y},time,callback,this);
        },
        translateY:function (x,y,time,callback) {
            return animate({translateX:x},{translateX:y},time,callback,this);
        },
        rotate:function (x,y,time,callback) {
            return animate({rotate:x},{rotate:y},time,callback,this);
        },
        skewX:function (x,y,time,callback) {
            return animate({skewX:x},{skewX:y},time,callback,this);
        },
        skewY:function (x,y,time,callback) {
            return animate({skewY:x},{skewY:y},time,callback,this);
        },
        animate:function (xs,ys,time,callback) {
            return animate(xs,ys,time,callback,this);
        },
        translate:function (p1,p2,time,callback) {
            return animate({translateX:p1[0],translateY:p1[1]},{translateX:p2[0],translateY:p2[1]},time,callback,this);
        },
        scale:function (v1,v2,time,callback) {
            return animate({scaleX:v1[0],scaleY:v1[1]},{scaleX:v2[0],scaleY:v2[1]},time,callback,this);
        },
        skew:function (d1,d2,time,callback) {
            return animate({skewX:d1[0],skewY:d1[1]},{skewX:d2[0],skewY:d2[1]},time,callback,this);
        },
        //rgba属于特殊方法，应特殊封装
        rgba:function (arr1,arr2,time,callback) {
            var self = this;
            function temp(resolve) {
                var n = Math.ceil(time * 60 / 1000);
                var step = [];
                each(4,function (i,v) {
                    step.push((arr2[i]-arr1[i])/n);
                });
                var current = arr1;
                function change() {
                    n--;
                    each(4,function (i,v) {
                        current[i]+=step[i];
                    });
                    if(n>0){
                        if(n===1){
                            current = arr2;
                        }
                        each(self.els,function (k,v) {
                            v.style.backgroundColor = "rgba("+current[0]+","+current[1]+","+current[2]+","+current[3]+")";
                        });
                        requestAnimationFrame(change);
                    }
                    else{
                        callback&&callback();
                        resolve();
                    }
                }
                requestAnimationFrame(change);
            }
            if(this.Promise){
                this.Promise = this.Promise.then(function () {
                    return new Promise(temp);
                });
            }
            else{
                this.Promise = new Promise(temp);
            }
            return this;
        }
    });
    // --------------------------dom树
    function insert(self,data,_mode) {
        var mode = _mode?_mode:"beforeEnd";
        var arr = type(data)=="Array"?data:[data];
        each(self.els,function (k,v) {
           each(arr,function (k2,v2) {
               if(type(v2)=="String"){
                   v.insertAdjacentHTML(mode, v2);
               }
               else{
                   v.insertAdjacentElement(mode, v2);
               }
           });
        });
        return self;
    }
    extend(mjjm.prototype,{
        append:function (data) {
            return insert(this,data);
        },
        insert:function (data,m) {
            return insert(this,data,m);
        }
    });

    // --------------------------文件上传
    mjjm.prototype.UFile = function(callback){
        function getFile() {
            var self = this;
            var fs = this.files;
            var datas = [];
            var n = 0;
            for(var i = 0;i<fs.length;i++){
                var reader = new FileReader();
                reader.onload = function () {
                    datas.push(this.result);
                    n++;
                    if(n==fs.length){
                        callback(datas,self.parentNode);
                    }
                    delete this;
                };
                reader.readAsArrayBuffer(fs[i]);
            }
        }
        each(this.els,function (k,el) {
            var compute = window.getComputedStyle(el);
            if(compute.getPropertyValue("position")=="static"){
                el.style.position = "relative";
            }
            var input = create("input",{
                type:"file",
                multiple:"multiple",
                style:"display:block;position:absolute;top:0;left:0;z-index:1008601;opacity:0;cursor:default;"
            });
            input.style.width = compute.getPropertyValue("width");
            input.style.height = compute.getPropertyValue("height");
            input.onchange = getFile;
            el.appendChild(input);
        });
    };

    // endregion

    // region[入口]
    window[symbol] = function (selector) {
        if(type(selector)==="Function"){
            domLoad(selector);
        }
        else{
            return new mjjm(selector);
        }
    };

    // endregion

    // region[扩展 window[symbol]]
    // --------------------------常用变量扩展
    extend(window[symbol],{
        //版本号
        version:version,
        //post提交的数据格式类型
        contentTypes:contentTypes,
        //可视页面的宽度
        W:W,
        //可视页面的高度
        H:H
    });
    // --------------------------queryString
    window[symbol]["queryString"] = {};
    extend(window[symbol]["queryString"],{
        //  a=1&b=c    =>    {a:1,b:"c"}
        parse: function(s){
            var o = {};
            each(s.split('&'),function (i,v) {
                var arr = v.split("=");
                o[arr[0]] = arr[1];
            });
            return o;
        },
        // {a:1,b:"c"}   =>    a=1&b=c
        stringify: function (o) {
            var arr = [];
            each(o,function (k,v) {
                arr.push(k+"="+v);
            });
            return arr.join("&");
        }
    });
    // --------------------------ajax
    window[symbol].ajax = function (_obj) {
        var obj = {
            url:null,//这个不解释
            method:null,//get|post
            callback:null,
            reqType:null,//针对post，可以自设置post数据类型
            resJSON:false,//针对get和post的返回，传入回调字符串或json对象
            data:{}//针对get和post
        };
        extend(obj,_obj);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4){
                if(xhr.status === 200){
                    if(obj.resJSON){
                        obj.callback(JSON.parse(xhr.responseText),xhr.status,xhr);
                    }
                    else{
                        obj.callback(xhr.responseText,xhr.status,xhr);
                    }
                }
                else{
                    throw new Error("ajax 错误状态号：" + xhr.status);
                }
            }
        };
        if(obj.method==="get"){
            if(!isEmptyObject(obj.data)){
                obj.url+="?"+window[symbol].queryString.stringify(obj.data);
            }
            xhr.open("get", obj.url, true);
            xhr.send();
        }
        else if(obj.method==="post"){
            xhr.open("post", obj.url, true);
            if(type(obj.data)==="FormData"){
                xhr.setRequestHeader("Content-Type", contentTypes[3]);
                xhr.send(obj.data);
            }
            else if(type(obj.data)==="Object"){
                xhr.setRequestHeader("Content-Type", contentTypes[1]);
                xhr.send(window[symbol].queryString.stringify(obj.data));
            }
            else if(type(obj.data)==="ArrayBuffer"){
                xhr.setRequestHeader("Content-Type", contentTypes[5]);
                xhr.send(obj.data);
            }
            else{
                if(obj.data.isJSON()){
                    xhr.setRequestHeader("Content-Type", contentTypes[2]);
                }
                else{
                    if(obj.reqType){//如果是xml或者formdata 需要自己设置类型，否则当做text处理
                        xhr.setRequestHeader("Content-Type", obj.reqType);
                    }
                    else{
                        xhr.setRequestHeader("Content-Type", contentTypes[0]);
                    }
                }
                xhr.send(obj.data);
            }
        }
    };
    function _get(arg,b) {
        var data;
        var callback;
        if(arg.length ===2){
            data = {};
            callback = arg[1];
        }
        else if(arg.length ===3){
            data = arg[1];
            callback = arg[2];
        }
        else {
            throw new Error("参数错误！");
        }
        window[symbol].ajax({
            url:arg[0],
            method:"get",
            callback:callback,
            resJSON:b,
            data:data
        });
    }
    extend(window[symbol],{
        get:function () {
            _get(arguments,false);
        },
        getJSON:function () {
            _get(arguments,true);
        },
        post:function (url,data,callback,reqType) {
            window[symbol].ajax({
                url:url,
                method:"post",
                callback:callback,
                resJSON:false,
                reqType:reqType,
                data:data
            });
        },
        postJSON:function (url,data,callback,reqType) {
            window[symbol].ajax({
                url:url,
                method:"post",
                callback:callback,
                resJSON:true,
                reqType:reqType,
                data:data
            });
        }
    });
    // --------------------------document和dom事件
    extend(window[symbol],{
        //该方法内的方法在dom树加载完成后执行------------------------$.domLoad(f)-----------------参数1：一个方法
        domLoad:domLoad,
        //该方法内的方法在页面所有内容加载完成后执行------------------$.allLoad(f)-----------------参数1：一个方法
        allLoad:function (f) {
            var a = function () {
                window.removeEventListener("load",a);
                f();
            };
            window.addEventListener("load",a);
        },
        //三种文档变化事件,分别为节点插入、节点删除、节点属性改变，第一个参数：回调，第二个参数：是否一次性调用
        domInsert:function (f,remove) {
            var a;
            if (remove) {
                a = function () {document.removeEventListener("DOMNodeInserted", a);f();}
            }
            else {
                a = function () {f();}
            }
            document.addEventListener("DOMNodeInserted", a);
        },
        domRemove:function (f,remove) {
            var a;
            if (remove) {
                a = function () {document.removeEventListener("DOMNodeRemoved", a);f();}
            }
            else {
                a = function () {f();}
            }
            document.addEventListener("DOMNodeRemoved", a);
        },
        attrModify:function (f,remove) {
            var a;
            if (remove) {
                a = function () {document.removeEventListener("DOMAttrModified", a);f();}
            }
            else {
                a = function () {f();}
            }
            document.addEventListener("DOMAttrModified", a);
        },
        //增加一个全屏白色div用于加载
        addMask:function () {
            var div = document.createElement("div");
            div.id = "DIVMask";
            div.style.position = "fixed";
            div.style.top = div.style.left = div.style.margin = div.style.padding = "0px";
            div.style.width = window.innerWidth+"px";
            div.style.height = window.innerHeight+"px";
            div.style.backgroundColor = "white";
            div.style.zIndex = 10000;
            document.body.appendChild(div);
        },
        removeMask:function () {
            var div = document.getElementById("DIVMask");
            document.body.removeChild(div);
        }
    });
    //节点创建与节点树构造
    extend(window[symbol],{
        create:create,
        createTree:createTree
    });
    // --------------------------using
    // using方法用于引入模块（css或js文件）   如果指定入口 用data-main属性 与 requireJS 相同
    window[symbol].using = function(url,callback,t) {
        var head = document.getElementsByTagName('head')[0];
        if(t==="css"||$.extension(url)==="css"){
            var link = document.createElement("link");
            if(type(callback)==="Function"){
                link.onload = function () {
                    callback();
                };
            }
            link.rel = "stylesheet";
            link.href = url;
            head.appendChild(link);
        }
        else if(t==="js"||$.extension(url)==="js"){
            var script= document.createElement("script");
            if(type(callback)==="Function"){
                script.onload = function () {
                    callback();
                };
            }
            script.src=url;
            head.appendChild(script);
        }
        else {
            window[symbol].get(url,function (text) {
                if(type(callback)==="Function"){
                    callback(text);
                }
            });
        }
    };
    // --------------------------全屏遮罩
    extend(window[symbol],{
        //增加一个全屏白色div遮罩用于加载
        addMask:function () {
            var div = document.createElement("div");
            div.id = "DIVMask";
            div.style.position = "fixed";
            div.style.top = div.style.left = div.style.margin = div.style.padding = "0px";
            div.style.width = window.innerWidth+"px";
            div.style.height = window.innerHeight+"px";
            div.style.backgroundColor = "white";
            div.style.zIndex = 10000;
            document.body.appendChild(div);
        },
        //删除已经创建的遮罩
        removeMask:function () {
            var div = document.getElementById("DIVMask");
            document.body.removeChild(div);
        }
    });
    // --------------------------工具方法
    extend(window[symbol],{
        //对象扩展------------------------$.extend(t,o)----------------参数1：被扩展对象   参数2：一个对象
        extend:extend,
        //返回[a,b]随机数-----------------$.rand(a,b)
        rand:function (a,b) {
            return Math.floor(Math.random()*(b - a + 1) + a);
        },
        //each遍历数组或对象执行方法-------$.each(v,f)-----------------意义是抽象for循环，减少代码量，函数式编程的优点
        each: each,
        //返回变量类型--------------------$.type(a)-------------------返回值(字符串)
        // Undefined|Null|Boolean|Number|String|Function|Array|NodeList|Object|RegExp|Date|Error|Symbol|FormData|HTMLImageElement|
        type:type,
        //返回指定路径文件的扩展名---------$.extension(path)-----------返回值(字符串)
        extension:extension,
        //判断一个对象是否为空对象（没有任何属性）
        isEmptyObject:isEmptyObject,
        //设置一段文本到剪贴板
        copy:function(value,callback) {
            var el = document.createElement("input");
            el.value = value;
            document.body.appendChild(el);
            el.select();
            document.execCommand("Copy");
            document.body.removeChild(el);
            callback&&callback(value);
        },
        //简写console.log 为 $.log
        log:function (text) {
            console.log(text);
        }
    });

    // endregion

    // region[本库最终执行代码]
    // 模块化如果指定入口，加载之
    (function () {
        var scriptList =document.getElementsByTagName('script');
        var script = scriptList[scriptList.length - 1];
        var val = script.getAttribute("data-main");
        if(val){
            window[symbol].using(val,"js");
        }
    }());

    // endregion

    // region[附加 $ 符号指向 window[symbol]]
    window.$ = window[symbol];
    window[symbol].addSymbol = function (sym) {
        window[sym] = window[symbol];
    };
    window[symbol].delSymbol = function (sym) {
        delete window[sym];
    };

    // endregion
}("mjjm"));
// endregion

// region[常用函数]
// 1、parseInt(str)    字符串转数字
//
//
//
//
// endregion

// region[还需添加的功能]
// 1、可添加另外的魔性符号 指向当前的符号
// 2、常用正则整理
// 3、添加数据双向绑定
// 4、img对象类型
//
//
// endregion
