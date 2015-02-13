(function(e,t){function f(e,t){function r(e){var t=[],r=e.clipboardData||{},i=r.items||[];for(var s=0;s<i.length;s++){var o=i[s].getAsFile();if(o){var u=(new RegExp("/(.*)")).exec(o.type);if(!o.name&&u){var a=u[1];o.name="clipboard"+s+"."+a}t.push(o)}}t.length&&(d(e,t,n),e.preventDefault(),e.stopPropagation())}if(!u.enabled)return;var n=g(g({},u.opts),t);e.addEventListener("paste",r,!1)}function l(e,t){function r(t){d(t,e.files,n)}function i(e){e.stopPropagation(),e.preventDefault(),d(e,e.dataTransfer.files,n)}if(!u.enabled)return;var n=g(g({},u.opts),t);e.addEventListener("change",r,!1),e.addEventListener("drop",i,!1)}function c(e,n){function o(e){s=!1}function a(e){s=!0}function f(e){e.dataTransfer.files&&e.dataTransfer.files.length&&(e.stopPropagation(),e.preventDefault())}function l(e){return function(){s||e.apply(this,arguments)}}function c(t){t.stopPropagation(),t.preventDefault(),i&&w(e,i),d(t,t.dataTransfer.files,r)}function h(t){t.stopPropagation(),t.preventDefault(),i&&b(e,i)}function p(t){i&&w(e,i)}function v(t){t.stopPropagation(),t.preventDefault(),i&&b(e,i)}if(!u.enabled)return;var r=g(g({},u.opts),n),i=r.dragClass,s=!1;e.addEventListener("dragenter",l(h),!1),e.addEventListener("dragleave",l(p),!1),e.addEventListener("dragover",l(v),!1),e.addEventListener("drop",l(c),!1),t.body.addEventListener("dragstart",a,!0),t.body.addEventListener("dragend",o,!0),t.body.addEventListener("drop",f,!1)}function h(e,t){for(var n=0;n<e.length;n++){var r=e[n];r.extra={nameNoExtension:r.name.substring(0,r.name.lastIndexOf(".")),extension:r.name.substring(r.name.lastIndexOf(".")+1),fileID:n,uniqueID:x(),groupID:t,prettySize:E(r.size)}}}function p(e,t,n){for(var r in t)if(e.match(new RegExp(r)))return"readAs"+t[r];return"readAs"+n}function d(e,t,s){function c(){l.ended=new Date,s.on.groupend(l)}function d(){--f===0&&c()}var f=t.length,l={groupID:S(),files:t,started:new Date};u.output.push(l),h(t,l.groupID),s.on.groupstart(l);if(!t.length){c();return}var v=u.sync&&r,m;v&&(m=a.getWorker(i,function(e){var t=e.data.file,n=e.data.result;t.extra||(t.extra=e.data.extra),t.extra.ended=new Date,s.on[n==="error"?"error":"load"]({target:{result:n}},t),d()})),Array.prototype.forEach.call(t,function(t){t.extra.started=new Date;if(s.accept&&!t.type.match(new RegExp(s.accept))){s.on.skip(t),d();return}if(s.on.beforestart(t)===!1){s.on.skip(t),d();return}var r=p(t.type,s.readAsMap,s.readAsDefault);if(v&&m)m.postMessage({file:t,extra:t.extra,readAs:r});else{var i=new n;i.originalEvent=e,o.forEach(function(e){i["on"+e]=function(n){if(e=="load"||e=="error")t.extra.ended=new Date;s.on[e](n,t),e=="loadend"&&d()}}),i[r](t)}})}function v(){var e=a.getWorker(s,function(e){r=e.data});e&&e.postMessage({})}function m(){}function g(e,t){for(var n in t)t[n]&&t[n].constructor&&t[n].constructor===Object?(e[n]=e[n]||{},arguments.callee(e[n],t[n])):e[n]=t[n];return e}function y(e,t){return(new RegExp("(?:^|\\s+)"+t+"(?:\\s+|$)")).test(e.className)}function b(e,t){y(e,t)||(e.className=e.className?[e.className,t].join(" "):t)}function w(e,t){if(y(e,t)){var n=e.className;e.className=n.replace(new RegExp("(?:^|\\s+)"+t+"(?:\\s+|$)","g")," ").replace(/^\s\s*/,"").replace(/\s\s*$/,"")}}function E(e){var t=["bytes","kb","MB","GB","TB","PB"],n=Math.floor(Math.log(e)/Math.log(1024));return(e/Math.pow(1024,Math.floor(n))).toFixed(2)+" "+t[n]}var n=e.FileReader,r=!1,i="self.addEventListener('message', function(e) { var data=e.data; try { var reader = new FileReaderSync; postMessage({ result: reader[data.readAs](data.file), extra: data.extra, file: data.file})} catch(e){ postMessage({ result:'error', extra:data.extra, file:data.file}); } }, false);",s="self.addEventListener('message', function(e) { postMessage(!!FileReaderSync); }, false);",o=["loadstart","progress","load","abort","error","loadend"],u=e.FileReaderJS={enabled:!1,setupInput:l,setupDrop:c,setupClipboard:f,sync:!1,output:[],opts:{dragClass:"drag",accept:!1,readAsDefault:"BinaryString",readAsMap:{"image/*":"DataURL","text/*":"Text"},on:{loadstart:m,progress:m,load:m,abort:m,error:m,loadend:m,skip:m,groupstart:m,groupend:m,beforestart:m}}};typeof jQuery!="undefined"&&(jQuery.fn.fileReaderJS=function(e){return this.each(function(){$(this).is("input")?l(this,e):c(this,e)})},jQuery.fn.fileClipboard=function(e){return this.each(function(){f(this,e)})});if(!n)return;var a=function(){function r(r){if(e.Worker&&n&&t){var i=new n;return i.append(r),t.createObjectURL(i.getBlob())}return null}function i(e,t){var n=r(e);if(n){var i=new Worker(n);return i.onmessage=t,i}return null}var t=e.URL||e.webkitURL,n=e.BlobBuilder||e.WebKitBlobBuilder||e.MozBlobBuilder;return{getURL:r,getWorker:i}}(),S=function(e){return function(){return e++}}(0),x=function(e){return function(){return e++}}(0);u.enabled=!0})(this,document);