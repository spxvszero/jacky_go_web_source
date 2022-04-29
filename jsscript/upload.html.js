let uploadUrl = location.origin + "/upload/interface";
let config_uploadMaxSizeUrl = "/info/size";
let uploadMaxSizeUrl = location.origin + config_uploadMaxSizeUrl;
// let uploadUrl = "http://localhost:8900" + "/upload/interface";
// let uploadMaxSizeUrl = "http://localhost:8900" + config_uploadMaxSizeUrl;

var dropZone = document.getElementById('drop-zone');

//首先对页面事件做一个判断处理，如果页面中存在并满足下列if条件就触发事件方法。
if ((('draggable' in dropZone) && ('ondragenter' in dropZone) &&
        ('ondragleave' in dropZone) && ('ondragover' in dropZone) &&
        window.File && window.FileList && window.FileReader)) {

    //文件进入事件
    function handleFileDragEnter(e) {
        jkconsole("file in ", e)

        //不再派发事件
        e.stopPropagation();
        //取消事件的默认动作
        e.preventDefault();
        //为当前元素添加CSS样式
        this.classList.add('hovering');
        $(".interactive_btn_class").css("z-index", "0");
    }

    //文件离开事件
    function handleFileDragLeave(e) {
        jkconsole("file out ", e)

        e.stopPropagation();
        e.preventDefault();
        //为当前元素移除CSS样式
        this.classList.remove('hovering');
        $(".interactive_btn_class").css("z-index", "5");
    }

    //文件拖拽完成效果
    function handleFileDragOver(e) {

        e.stopPropagation();
        e.preventDefault();
        //把拖动的元素复制到放置目标（注1会给出dropEffect详细属性）。
        e.dataTransfer.dropEffect = 'copy';

    }

    //文件拖拽到页面后处理方式
    function handleFileDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        //为当前元素移除CSS样式
        this.classList.remove('hovering');
        $(".interactive_btn_class").css("z-index", "5");

        jkconsole("drag finish -- ", e, e.target.files, e.dataTransfer.files, e.dataTransfer.items)

        var supportedDir = true
            //判断是否支持文件夹读取
        try {
            e.dataTransfer.items[0].webkitGetAsEntry()
        } catch (e) {
            jkconsole("不支持读取文件夹")
            supportedDir = false
        }
        if (supportedDir) {
            addFilesFromDragEvt(e.dataTransfer.items)
            jkconsole("dididididid --- ", e.dataTransfer.items, " files --- ", e.dataTransfer.files)
        } else {
            addFiles(e.dataTransfer.files)
        }


        // // Chrome only
        // if (e.dataTransfer.items && e.dataTransfer.items.length) {
        //     [].forEach.call(e.dataTransfer.items, function (item) {
        //         var entry = item.webkitGetAsEntry();
        //         if (entry && entry.isFile) {
        //             var file = item.getAsFile(); // same as object in e.dataTransfer.files[]
        //             jkconsole("get dataTransfer item : ", file)
        //             // do something with the file
        //         }
        //         jkconsole("entry -- ", entry)
        //
        //         // entry.getFile(function (fileEntry) {
        //         //     jkconsole("get file entry ",fileEntry)
        //         //     fileEntry.file(function (dictFile) {
        //         //         let reader = new FileReader();
        //         //         jkconsole("file -- ", dictFile, "\n reader -- ", reader)
        //         //         reader.addEventListener("loadend", function () {
        //         //             dictionary = JSON.parse(reader.result);
        //         //         });
        //         //
        //         //         reader.readAsText(dictFile);
        //         //     });
        //         // });
        //     });
        //
        //
        // }

    }

    //为四种方法生成addEventListener事件监听器，addEventListener有三个参数：第一个参数表示事件名称；第二个参数表示要接收事件处理的函数；第三个参数为 useCapture（一般来说为false，true会更改响应顺序），
    dropZone.addEventListener('dragenter', handleFileDragEnter, false);
    dropZone.addEventListener('dragleave', handleFileDragLeave, false);
    dropZone.addEventListener('dragover', handleFileDragOver, false);
    dropZone.addEventListener('drop', handleFileDrop, false);
}


// Drop handler function to get all files
async function getAllFileEntries(dataTransferItemList) {
    let fileEntries = [];
    // Use BFS to traverse entire directory/file structure
    let queue = [];
    // Unfortunately dataTransferItemList is not iterable i.e. no forEach
    for (let i = 0; i < dataTransferItemList.length; i++) {
        queue.push(dataTransferItemList[i].webkitGetAsEntry());
    }
    while (queue.length > 0) {
        let entry = queue.shift();
        if (entry.isFile) {
            fileEntries.push(entry);
        } else if (entry.isDirectory) {
            queue.push(...await readAllDirectoryEntries(entry.createReader()));
        }
    }
    return fileEntries;
}

// Get all the entries (files or sub-directories) in a directory
// by calling readEntries until it returns empty array
async function readAllDirectoryEntries(directoryReader) {
    let entries = [];
    let readEntries = await readEntriesPromise(directoryReader);
    while (readEntries.length > 0) {
        entries.push(...readEntries);
        readEntries = await readEntriesPromise(directoryReader);
    }
    return entries;
}

// Wrap readEntries in a promise to make working with readEntries easier
// readEntries will return only some of the entries in a directory
// e.g. Chrome returns at most 100 entries at a time
async function readEntriesPromise(directoryReader) {
    try {
        return await new Promise((resolve, reject) => {
            directoryReader.readEntries(resolve, reject);
        });
    } catch (err) {
        jkconsole(err);
    }
}

// function getFile(fileEntry) {
//     try {
//         return new Promise((resolve, reject) => fileEntry.file(resolve, reject));
//     } catch (err) {
//         jkconsole(err);
//     }
// }




var tasksObj = new Object();
var groupObj = new Object();
var progressName = "upload-progress-";
var percentageName = "upload-percentage-";
var timeName = "upload-time-";
var listItemName = "list-item-";
var cancelBtnName = "cancel-btn-";
let taskId = 0;

function startUploadAll() {

    Object.keys(tasksObj).forEach(function(key) {
        jkconsole("start upload ", key)

        var task = tasksObj[key];
        if (task && task.xhr == null || (task.xhr.status != 200 && task.xhr.readyState == 4)) {
            sendUploadRequest(task)
        }
    })
}

function openFile() {
    $("#open-file").click();
}

function addFiles(files) {
    jkconsole("files - ", files);

    for (i = 0; i < files.length; i++) {
        addTask(files[i])
    }
}

function addFilesFromDragEvt(dataTransferItems) {
    //loading
    getAllFileEntries(dataTransferItems).then((v) => {
        // jkconsole("value ",v ," length -- ",v.length);
        var time = v.length;
        //make group
        v.map((item, k) => {
            var fileEntry = item
            var p = fileEntry.fullPath
            var isFile = fileEntry.isFile
                // jkconsole("entry -- ",fileEntry,"  path -- ",p);

            fileEntry.file((f) => {
                // jkconsole("file -- ",f," filepath -- ",p);
                buildTaskWithGroup(f, p);
                time--;
                if (time == 0) {
                    jkconsole("finish map -- ", groupObj)
                }
            });

        });
    }).finally(() => {
        jkconsole("groupObject ", groupObj)
    })
}

function literateGroup(fileTaskId, groupPath, isAdd) {

    var pathArr = groupPath.split("/")

    pathArr.pop()

    if (pathArr.length <= 1) {
        return false
    }

    var groupContent = groupObj;
    var remove = false;
    for (var i = 0; i < pathArr.length; i++) {
        var name = pathArr[i];
        if (name.length <= 0) {
            continue;
        }
        var obj = groupContent[name];
        if (isAdd) {
            if (!obj) {
                obj = new Object();
                obj["allTasks"] = new Array();
                groupContent[name] = obj;
            }
            obj["allTasks"].push(fileTaskId)
        } else {
            for (var j = 0; j < obj["allTasks"].length; j++) {
                if (obj["allTasks"][j] == fileTaskId) {
                    obj["allTasks"].splice(j, 1); // 将使后面的元素依次前移，数组长度减1
                    remove = true;
                    if (obj["allTasks"].length <= 0) {
                        break;
                    }
                    j--; // 如果不减，将漏掉一个元素
                }
            }
        }
        groupContent = obj
    }

    if (isAdd) {
        return pathArr[1]
    } else {
        return remove
    }
}

function buildTaskWithGroup(file, groupPath) {
    taskId++;
    var fileName = file.name;

    tasksObj[taskId] = {
        "taskId": taskId,
        "groupPath": groupPath,
        "fileName": fileName,
        "xhr": null,
        "fileObject": file
    };

    // autoUpload(tasksObj[taskId])

    var res = literateGroup(taskId, groupPath, true)
    if (res) {
        //build group
        addGroupListItem(res)
    } else {
        //build file
        addListItem(fileName, taskId)
    }

    autoUpload(tasksObj[taskId])

    return taskId
}



function buildTask(file) {
    taskId++;
    var fileName = file.name;

    tasksObj[taskId] = {
        "taskId": taskId,
        "fileName": fileName,
        "xhr": null,
        "fileObject": file
    };

    addListItem(fileName, taskId)

    autoUpload(tasksObj[taskId])

    return taskId
}

function addTask(file) {

    jkconsole("add task - ", file);
    var reader = new FileReader();
    reader.onload = function(e) {
        // it's a file
        buildTask(file)
    };
    reader.onerror = function(e) {
        // it's a directory

        jkconsole("read file error : ", e)

    };
    reader.readAsText(file);
}

function removeTask(taskId) {

    var task = tasksObj[taskId]
    if (!task) {
        return
    }

    removeListItem(taskId);

    if (task.groupPath) {
        var name = getGroupName(task.groupPath, 0);
        // var g = groupObj[name];
        var remove = literateGroup(taskId, task.groupPath, false);
        if (remove) {
            //update UI
            if (!groupObj[name]["allTasks"] || groupObj[name]["allTasks"].length <= 0) {
                removeGroupListItem(name)
                delete groupObj[name]
            } else {
                let spanId = "title-" + name;
                var groupDiv = document.getElementById(spanId);
                groupDiv.innerText = name + "(" + groupObj[name]["allTasks"].length + ")"
                updataGroupProgress(name)
            }
        }
    }

    delete tasksObj[taskId]
}

function addGroupListItem(groupName) {
    var listgroup = document.getElementById("list-group");

    var groupItem = document.getElementById("group-" + groupName);

    if (groupItem) {
        let spanId = "title-" + groupName;
        var groupDiv = document.getElementById(spanId);
        groupDiv.innerText = groupName + "(" + groupObj[groupName]["allTasks"].length + ")"
        return
    }


    var item = "<div id=\"group-" + groupName + "\" class=\"container list-group-item\">\n" +
        "            <div class=\"row justify-content-between align-items-center\">\n" +
        "                <div class=\"interactive_btn_class col-10\">\n" +
        "<button type='button' class='btn' onclick=\"spreadGroup('" + groupName + "')\">" +
        "<svg id=\"" + "icon-" + groupName + "\" width=\"15px\" height=\"15px\" viewBox=\"0 0 15 15\">\n" +
        "    <g stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n" +
        "        <polygon id=\"Path\" fill=\"#000000\" points=\"0 0 0 15 15 7.5\"></polygon>\n" +
        "    </g>\n" +
        "</svg>" +
        "                    <span id=\"" + "title-" + groupName + "\" class='align-middle'>" + groupName + "</span>\n </button>" +
        "<div id=\"inner-" + groupName + "\"></div> " +
        "                    <div id=\"" + progressName + "group-" + groupName + "\" class=\"progress\">\n" +
        "                        <div class=\"progress-bar progress-bar-striped progress-bar-animated\" role=\"progressbar\" aria-valuenow=\"75\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 0%\"></div>\n" +
        "                    </div>\n" +
        "                    <span  id=\"" + percentageName + "percent-" + groupName + "\">0%</span><span></span>\n" +
        "                </div>\n" +
        "                <div class=\"interactive_btn_class col-2 text-center\">\n" +
        "                    <button  class=\"btn btn-primary\" type=\"button\" onclick=\"cancelGroupUploadFile('" + groupName + "')\">cancel</button>\n" +
        "                </div>\n" +
        "            </div>\n" +
        "        </div>";

    listgroup.insertAdjacentHTML("afterbegin", item)

}

function removeGroupListItem(gName) {
    var groupDiv = document.getElementById("group-" + gName);
    groupDiv.remove()
}

function addListItem(fileName, taskId) {
    var listgroup = document.getElementById("list-group");

    var item = "<div id=\"" + listItemName + taskId + "\" class=\"container list-group-item\">\n" +
        "            <div class=\"row justify-content-between align-items-center\">\n" +
        "                <div class=\"col-10\">\n" +
        "                    <span>" + fileName + "</span>\n" +
        "                    <div id=\"" + progressName + taskId + "\" class=\"progress\">\n" +
        "                        <div class=\"progress-bar progress-bar-striped progress-bar-animated\" role=\"progressbar\" aria-valuenow=\"75\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 0%\"></div>\n" +
        "                    </div>\n" +
        "                    <span id=\"" + percentageName + taskId + "\">0%</span><span id=\"" + timeName + taskId + "\"></span>\n" +
        "                </div>\n" +
        "                <div class=\"interactive_btn_class col-2 text-center\">\n" +
        "                    <button id=\"" + cancelBtnName + taskId + "\"  class=\"btn btn-primary\" type=\"button\" onclick=\"cancelUploadFile(" + taskId + ")\">cancel</button>\n" +
        "                </div>\n" +
        "            </div>\n" +
        "        </div>";

    listgroup.insertAdjacentHTML("afterbegin", item)

}


function removeListItem(taskId) {
    $("#" + listItemName + taskId).remove()
}

function spreadGroup(gName) {
    var groupIconDiv = document.getElementById("icon-" + gName);
    if (groupIconDiv.classList.contains("more_btn_anim")) {
        groupIconDiv.classList.remove("more_btn_anim")
        clearGroupInnerListItem(gName)
    } else {
        groupIconDiv.classList.add("more_btn_anim")
        addGroupInnerListItem(gName)
    }

}

function addGroupInnerListItem(gName) {
    var listgroup = document.getElementById("inner-" + gName);

    if (!listgroup) {
        return
    }

    var tasks = groupObj[gName]["allTasks"];

    for (var i = 0; i < tasks.length; i++) {

        var taskId = tasks[i];
        var task = tasksObj[taskId]

        var percent = "0%";
        var actionBtnName = "cancel";
        var styleclass = ""
        if (task.xhr && task.xhr.status == 200) {
            percent = "100%";
            actionBtnName = "success";
            styleclass = "success_btn"
        }


        var item = "<div id=\"" + listItemName + taskId + "\" class=\"container\" style='width: 80%'>\n" +
            "            <div class=\"row justify-content-between align-items-center\">\n" +
            "                <div class=\"col-10\">\n" +
            "                    <span>" + task.fileName + "</span>\n" +
            "                    <span style='font-style: italic;color: lightgray;' id=\"" + percentageName + taskId + "\">" + percent + "</span>\n" +
            "                    <span style='font-size: 10px;color: lightgray;'>" + task.groupPath + "</span>\n" +
            "                </div>\n" +
            "                <div class=\"col-2 interactive_btn_class text-center\">\n" +
            "                    <button id=\"" + cancelBtnName + taskId + "\"  class=\"btn btn-link " + styleclass + "\" type=\"button\" onclick=\"cancelUploadFile(" + taskId + ")\">" + actionBtnName + "</button>\n" +
            "                </div>\n" +
            "            </div>\n" +
            "        </div>";

        listgroup.insertAdjacentHTML("afterbegin", item)
    }

}

function updataGroupProgress(gName) {

    var groupProgressBar = progressName + "group-" + gName;
    var percentageId = percentageName + "percent-" + gName;

    var progressBar = document.getElementById(groupProgressBar)
    var percentSpan = document.getElementById(percentageId)

    var allTasks = groupObj[gName].allTasks

    if (!allTasks || allTasks.length <= 0)
        return

    var completeNum = 0;
    for (var i = 0; i < allTasks.length; i++) {
        var taskId = allTasks[i];
        if (tasksObj[taskId].xhr && tasksObj[taskId].xhr.status == 200) completeNum++;
    }

    var percentValue = completeNum / allTasks.length * 100 + "%";
    if (progressBar) $(progressBar).children().css("width", percentValue);
    if (percentSpan) percentSpan.innerText = percentValue;
}

function clearGroupInnerListItem(gName) {
    var listgroup = document.getElementById("inner-" + gName);
    if (!listgroup) {
        return
    }
    listgroup.innerText = "";
}

function getGroupName(gName, number) {

    if (gName == undefined) return

    var pathArr = gName.split("/")

    pathArr.pop()

    if (number + 1 >= pathArr.length) {
        return null
    }

    return pathArr[number + 1]
}


function autoUpload(task) {
    if ($("#auto-upload-checkbox")[0].checked) {
        sendUploadRequest(task)
    }
}

function clearAll() {
    Object.keys(tasksObj).forEach(function(key) {
        jkconsole("start upload ", key)

        var task = tasksObj[key];

        if (task) {
            if (task.xhr) {
                //有任务判断是否正在运行
                if (task.xhr.readyState == 4) {} else {
                    //中断之后再移除
                    task.xhr.abort();
                }
                removeTask(key)

            } else {
                //没有任务直接移除
                removeTask(key)
            }

        }
    })
}

function clearUpTask() {
    Object.keys(tasksObj).forEach(function(key) {
        jkconsole("clear up task", key)

        var task = tasksObj[key];
        //清除成功的任务
        if (task && task.xhr) {
            if (task.xhr.readyState == 4) {
                //清除请求过的任务
                removeTask(key)
            }
        }
    })
}

function retryTask(task) {
    delete task.xhr

    //reset style
    var btnDiv = document.getElementById(cancelBtnName + task.taskId)
    $(btnDiv)[0].innerText = "cancel"
    if ($(btnDiv)[0].classList.contains("btn-primary")) {
        $(btnDiv)[0].classList.remove("btn-secondary")
    } else {
        $(btnDiv)[0].classList.remove("failed_btn")
    }

    var progressBar = document.getElementById(progressName + task.taskId);
    if (progressBar) $(progressBar).children().removeClass("bg-secondary");

    sendUploadRequest(task)
}

function sendUploadRequest(task) {

    let url = uploadUrl;
    var xhr;

    let form = new FormData(); // FormData 对象
    form.append("file", task.fileObject); // 文件对象
    if (task.groupPath) {
        form.append("relativePath", task.groupPath);
    }

    xhr = new XMLHttpRequest(); // XMLHttpRequest 对象
    xhr.open("post", url, true); //post方式，url为服务器请求地址，true 该参数规定请求是否异步处理。
    xhr.addEventListener("load", function(e) {
        uploadComplete(e, task.taskId)
    }, false);
    xhr.addEventListener("error", function(e) {
        uploadFailed(e, task.taskId)
    });

    xhr.upload.addEventListener("progress", function(e) {
        progressFunction(e, task.taskId)
    });
    xhr.upload.onloadstart = function() { //上传开始执行方法
        task["beginTime"] = new Date().getTime();
        task["ot"] = new Date().getTime(); //设置上传开始时间
        task["oloaded"] = 0; //设置上传开始时，以上传的文件大小为0
        task["maxspeed"] = 0;
        task["maxspeedStr"] = "b/s";
        // ot = new Date().getTime();   //设置上传开始时间
        // oloaded = 0;//设置上传开始时，以上传的文件大小为0
    };

    xhr.upload.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                jkconsole("upload complete");
                jkconsole("response: " + xhr.responseText);
            } else {
                showFailed(xhr.responseText)
            }
        }
    };

    task.xhr = xhr;
    xhr.send(form);
}

//上传成功响应
function uploadComplete(evt, taskId) {
    //服务断接收完文件返回的结果
    jkconsole("上传---结果 ", evt, taskId, tasksObj[taskId]);

    var btnName = cancelBtnName + taskId
    var btnDiv = document.getElementById(btnName)

    if (evt.target.status == 200) {
        if (btnDiv) {
            $(btnDiv)[0].innerText = "success"
            if ($(btnDiv)[0].classList.contains("btn-primary")) {
                $(btnDiv)[0].classList.add("btn-success")
            } else {
                $(btnDiv)[0].classList.add("success_btn")
            }
        }


        var progressBar = document.getElementById(progressName + taskId);
        if (progressBar) $(progressBar).children().addClass("bg-success");

        //展示结果
        var task = tasksObj[taskId]
        var time = document.getElementById(timeName + taskId);
        if (time) {
            var nt = new Date().getTime(); //获取当前时间
            var pertime = (nt - task["beginTime"]) / 1000; //时间差，单位为s

            //计算平均速度
            var speed = pertime <= 0 ? task.fileObject.size : task.fileObject.size / pertime; //单位b/s
            var bspeed = speed;
            var units = 'b/s'; //单位名称
            if (speed / 1024 > 1) {
                speed = speed / 1024;
                units = 'k/s';
            }
            if (speed / 1024 > 1) {
                speed = speed / 1024;
                units = 'M/s';
            }
            speed = speed.toFixed(1);
            time.innerHTML = '，平均速度：' + speed + units + '，最大速度：' + task["maxspeedStr"] + '，所花时间：' + pertime + 's';
        }

        //更新group
        var gName = getGroupName(task.groupPath, 0);
        if (gName) {
            updataGroupProgress(gName)
        }

        //更新文件大小信息
        checkUploadSize()

    } else {
        uploadFailed(evt, taskId)
    }

}
//上传失败
function uploadFailed(evt, taskId) {

    var btnDiv = document.getElementById(cancelBtnName + taskId)

    $(btnDiv)[0].innerText = "retry"
    if ($(btnDiv)[0].classList.contains("btn-primary")) {
        $(btnDiv)[0].classList.add("btn-secondary")
    } else {
        $(btnDiv)[0].classList.add("failed_btn")
    }

    var progressBar = document.getElementById(progressName + taskId);
    if (progressBar) $(progressBar).children().addClass("bg-secondary");

    showFailed(evt.target.responseText)
}

function cancelGroupUploadFile(gName) {
    var tasks = groupObj[gName].allTasks;

    var taskIds = tasks.slice();

    for (var i = 0; i < taskIds.length; i++) {
        cancelUploadFile(taskIds[i])
    }
}


//取消上传
function cancelUploadFile(taskId) {

    jkconsole("cancel click -- ", taskId)

    var task = tasksObj[taskId];
    if (task) {
        if (task.xhr) {
            if (task.xhr.status == 200) {
                removeTask(taskId)
            } else {
                if (task.xhr.readyState == 4) {
                    //retry
                    retryTask(task)

                } else {
                    task.xhr.abort();
                    jkconsole("cancel ", taskId, " success");
                    //remove?or retry?
                    removeTask(taskId)
                }
            }
        } else {
            removeTask(taskId)
        }
    }
}


//上传进度实现方法，上传过程中会频繁调用该方法
function progressFunction(evt, taskId) {

    var progressBar = document.getElementById(progressName + taskId);
    var percentageDiv = document.getElementById(percentageName + taskId);
    var task = tasksObj[taskId]
        // event.total是需要传输的总字节，event.loaded是已经传输的字节。如果event.lengthComputable不为真，则event.total等于0
    if (evt.lengthComputable) { //
        // progressBar.max = evt.total;
        // progressBar.value = evt.loaded;
        var percentValue = Math.round(evt.loaded / evt.total * 100) + "%";
        if (progressBar) $(progressBar).children().css("width", percentValue);
        if (percentageDiv) percentageDiv.innerHTML = percentValue;
    }
    var time = document.getElementById(timeName + taskId);
    var nt = new Date().getTime(); //获取当前时间
    var pertime = (nt - task["ot"]) / 1000; //计算出上次调用该方法时到现在的时间差，单位为s
    task["ot"] = new Date().getTime(); //重新赋值时间，用于下次计算
    var perload = evt.loaded - task["oloaded"]; //计算该分段上传的文件大小，单位b
    task["oloaded"] = evt.loaded; //重新赋值已上传文件大小，用以下次计算
    //上传速度计算
    var speed = pertime <= 0 ? perload : perload / pertime; //单位b/s
    var bspeed = speed;
    var units = 'b/s'; //单位名称
    if (speed / 1024 > 1) {
        speed = speed / 1024;
        units = 'k/s';
    }
    if (speed / 1024 > 1) {
        speed = speed / 1024;
        units = 'M/s';
    }
    speed = speed.toFixed(1);
    //记录最大速度
    if (bspeed > task["maxspeed"]) {
        task["maxspeed"] = bspeed;
        task["maxspeedStr"] = speed + units;
    }

    //剩余时间
    var resttime = ((evt.total - evt.loaded) / bspeed).toFixed(1);
    if (time) {
        time.innerHTML = '，速度：' + speed + units + '，剩余时间：' + resttime + 's';
        if (bspeed == 0) time.innerHTML = '，速度：' + '-' + units + '，剩余时间：' + '-' + 's';
    }
}

function formatBytes(origin) {
    var result = origin
    var unit = 'B'
    if (result / 1024 > 1) {
        result = result / 1024
        unit = 'kB'
    }
    if (result / 1024 > 1) {
        result = result / 1024
        unit = 'MB'
    }
    if (result / 1024 > 1) {
        result = result / 1024
        unit = 'GB'
    }

    return result.toFixed(2) + ' ' + unit
}

//Change the start and end values to reflect the hue map
//Refernece : http://www.ncl.ucar.edu/Applications/Images/colormap_6_3_lg.png

/*
Quick ref:
    0 – red
    60 – yellow
    120 – green
    180 – turquoise
    240 – blue
    300 – pink
    360 – red
*/
function hsl_col_perc(percent, start, end) {
    var a = percent / 100,
        b = (end - start) * a,
        c = b + start;

    // Return a CSS HSL string
    return 'hsl(' + c + ', 80%, 50%)';
}

function updateDirSize() {
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                jsonObj = JSON.parse(this.responseText);
                var ele = document.getElementById("dir-size-value");
                ele.innerText = formatBytes(jsonObj["used"]) + " / " + formatBytes(jsonObj["max"])
                if (jsonObj["used"] >= jsonObj["max"]) {
                    ele.innerText = ele.innerText + "(FULL)"
                }
                ele.style.color = hsl_col_perc(Math.min(jsonObj["used"] / jsonObj["max"], 1) * 100, 120, 360)
            } else {
                showFailed(this.responseText);
            }
        }
    };
    xhttp.open("GET", uploadMaxSizeUrl, true);

    xhttp.send();
}

function checkUploadSize() {
    if (config_uploadMaxSizeUrl && config_uploadMaxSizeUrl.length > 0) {
        updateDirSize();
    } else {
        document.getElementById("dir-size").style.display = 'none';
    }
}
checkUploadSize();

//toast function
const showToastAnime = `
        .dialog{
            position: fixed;
            z-index: 9998;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            background-color: #0000;
            text-align: center;
            pointer-events: none;
            transition: opacity 0.3s;
            opacity: 0;
        }
        .dialog.show{
            opacity:1;
        }
    `;
const style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = showToastAnime;
document.getElementsByTagName('head')[0].appendChild(style);

function showMsg(style, msg, dismissTime) {

    var dialog = document.createElement("div")
    dialog.innerHTML = "" +
        "<div class=\"dialog\">" +
        "<btn style=\"" +
        "position: relative;" +
        "top: 80%;" +
        "padding: 10px;" +
        "border-radius: 5px;" +
        "width: 50%;" +
        "pointer-events: none;" +
        "max-width: 300px;\" " +
        "class=\"" + style + "\">" + msg + "</btn>" +
        "</div>";

    document.body.appendChild(dialog);
    setTimeout(function() {
        dialog.children[0].classList.add("show");
    }, 50);

    setTimeout(function() {
        dialog.children[0].classList.remove("show");
    }, dismissTime - 300);
    setTimeout(function() {
        document.body.removeChild(dialog);
    }, dismissTime);
}

function showFailed(msg) {
    showMsg("btn-danger", msg, 3000);
}

function jkconsole(...args) {
    // console.log(args)
}