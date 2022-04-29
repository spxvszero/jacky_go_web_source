var jsonObj
var deepObjArr
var deepIdx
var deepIdxArr = new Array()

// let downloadJsonUrl = location.origin + "/download/json";
// let remoteDownloadUrl = location.origin + "/dd"
// let sharedUrl = location.origin + "/shared";
// let removeUrl = location.origin + "/files/remove";
let downloadJsonUrl = "http://localhost:8900" + "/download/json";
let remoteDownloadUrl = "http://localhost:8900" + "/remote_download"
let sharedUrl = "http://localhost:8900" + "/s";
let removeUrl = "http://localhost:8900" + "/files/remove";

var curPopoverObj;

$('html').on('click', function(e) {
    if (typeof $(e.target).data('original-title') == 'undefined' &&
        !$(e.target).parents().is('.popover')) {
        $('[data-original-title]').popover('hide');
        curPopoverObj = null
    }
});

function getDownloadDir() {
    jkconsole("发送");
    clearPopover();
    var table = document.getElementById("table-body")
    table.innerHTML = ""

    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                jsonObj = JSON.parse(this.responseText);
                deepObjArr = jsonObj;
                deepIdx = 0;

                jkconsole(jsonObj);

                tableEnter();
            } else {
                showFailed(this.responseText);
            }
        }
    };
    xhttp.open("GET", downloadJsonUrl, true);

    xhttp.send();

}

function tableEnter() {

    var table = document.getElementById("table-body")

    if (deepIdx > 0) {
        var tr = document.createElement("tr")
        tr.onclick = function() {
            return function() {
                goBackDeep();
            };
        }();
        tr.classList.add("table-secondary");
        table.appendChild(tr);

        var nameth = document.createElement("td");
        nameth.innerText = "..";
        tr.appendChild(nameth);

        var sizeth = document.createElement("td");
        tr.appendChild(sizeth);

        var updateth = document.createElement("td");
        tr.appendChild(updateth);

        var opth = document.createElement("td");
        tr.appendChild(opth);
    }

    if (deepObjArr == null) {
        return
    }

    sortRow();

    var length = deepObjArr.length;
    var arr = deepObjArr;

    for (i = 0; i < length; i++) {
        createTableRowWithObj(arr[i], table, null);
    }

}

function createTableRowWithObj(obj, table, linkElementId) {
    var tr = document.createElement("tr");

    var namePadding = "";
    if (linkElementId != null) {
        //tr onclick event
        tr.onclick = function(caller, linkObj) {
            return function() {
                goDeep(caller, linkObj);
            };
        }(tr, obj);

        //tr attr
        tr.setAttribute("linkElementId", linkElementId);

        //find relation with pre tr element
        if (table.children.length > 0) {
            var preTr = table.children[table.children.length - 1];
            var preElementId = preTr.getAttribute("linkElementId");
            var relation = getSamePrefixStringFromTwoStrings(preElementId.split("-").join(''), linkElementId.split("-").join(''));

            if (preElementId.length < linkElementId.length && relation != null && relation.length > 0) {
                namePadding += '|'
                namePadding += '-'.repeat(relation.length);
            }
        }
    } else {
        tr.onclick = function(caller, idx) {
            return function() {
                goDeep(caller, idx);
            };
        }(tr, i);
    }

    table.appendChild(tr);

    var nameth = document.createElement("td");
    if (obj["IsDir"]) {
        nameth.innerHTML = namePadding +
            "<svg width=\"23px\" height=\"19px\" viewBox=\"0 0 23 19\" >\n" +
            "    <desc>Created with Sketch.</desc>\n" +
            "    <defs></defs>\n" +
            "    <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n" +
            "        <g id=\"folder_opened\" transform=\"translate(0.751381, 0.652311)\" fill=\"#000000\" fill-rule=\"nonzero\">\n" +
            "            <path d=\"M20,5 C21.1045695,5 22,5.8954305 22,7 L21.9761871,7.2169305 L19.9959782,16.1278704 C19.9300429,17.1728563 19.0616163,18 18,18 L2,18 C0.8954305,18 0,17.1045695 0,16 L0,2 C0,0.8954305 0.8954305,0 2,0 L8,0 C9.1200023,0 9.832939,0.47545118 10.5489764,1.37885309 C10.5967547,1.43913352 10.8100999,1.71588275 10.8624831,1.78081945 C11.019726,1.97574495 11.0517795,1.99972956 11.0017863,2 L18,2 C19.1045695,2 20,2.8954305 20,4 L20,5 Z M18,5 L18,4 L10.994646,3.99998567 C10.2764915,3.99614058 9.8086916,3.65990923 9.3058322,3.03654146 C9.2364281,2.95050497 9.0158737,2.66440398 8.98159778,2.62115916 C8.60702158,2.14856811 8.38424442,2 8,2 L2,2 L2,6.89145869 L2.02912707,6.76040502 C2.31020006,5.62145726 2.83339587,5 4,5 L18,5 Z M2.02439383,16 L18,16 L18.0238129,15.7830695 L19.9756062,7 L4.03630578,7 C4.02068072,7.0495501 3.99991917,7.1212947 3.97618706,7.2169305 L2.02439383,16 Z\" id=\"Shape\"></path>\n" +
            "        </g>\n" +
            "    </g>\n" +
            "</svg>" + " " + obj["Name"]
    } else {
        nameth.innerHTML = namePadding +
            "<svg width=\"18px\" height=\"22px\" viewBox=\"0 0 18 22\">\n" +
            "            <desc>Created with Sketch.</desc>\n" +
            "                <defs></defs>\n" +
            "                <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n" +
            "                    <g id=\"file_text\" fill=\"#000000\" fill-rule=\"nonzero\">\n" +
            "                    <path d=\"M12,2.41421356 L12,6 L15.5857864,6 L12,2.41421356 Z M16,8 L12,8 C10.8954305,8 10,7.1045695 10,6 L10,2 L2,2 L2,20 L16,20 L16,8 Z M2,0 L12.4142136,0 L18,5.58578644 L18,20 C18,21.1045695 17.1045695,22 16,22 L2,22 C0.8954305,22 0,21.1045695 0,20 L0,2 C0,0.8954305 0.8954305,0 2,0 Z M5,16 L5,14 L11,14 L11,16 L5,16 Z M5,12 L5,10 L13,10 L13,12 L5,12 Z\" id=\"Shape\"></path>\n" +
            "                    </g>\n" +
            "                    </g>\n" +
            "                    </svg>" + " " + obj["Name"]
    }
    // nameth.innerText = nameth.innerText
    tr.appendChild(nameth)

    var sizeth = document.createElement("td")
    if (obj["IsDir"]) {
        sizeth.innerText = "-";
    } else {
        sizeth.innerText = formatFileSize(obj["Size"], 2);
    }
    tr.appendChild(sizeth);

    var updateth = document.createElement("td")
    var time = obj["ModTime"];
    var unixTimestamp = new Date(time * 1000);
    var dateTime = unixTimestamp.toLocaleDateString('chinese', {
        hour12: false
    });
    var timeTime = unixTimestamp.toLocaleTimeString('chinese', {
        hour12: false
    });
    updateth.innerText = dateTime + " " + timeTime;
    tr.appendChild(updateth)

    var opth = document.createElement("td")
    createOp(opth, obj)
    tr.appendChild(opth)
}

function formatFileSize(size, number) {
    var unit = "b";
    if (size / 1024 > 1) {
        size = size / 1024;
        unit = "kB"
    }
    if (size / 1024 > 1) {
        size = size / 1024;
        unit = "MB"
    }
    if (size / 1024 > 1) {
        size = size / 1024;
        unit = "GB"
    }

    size = size.toFixed(number);

    return size + " " + unit
}


function createOp(td, obj) {

    var downloadBtn = createOpBtn();
    downloadBtn.innerHTML = "\n" +
        "<svg width=\"16px\" height=\"16px\" viewBox=\"0 0 16 16\" version=\"1.1\">\n" +
        "    <desc>Created with Sketch.</desc>\n" +
        "    <defs></defs>\n" +
        "    <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n" +
        "        <g id=\"Artboard\" transform=\"translate(-2.000000, -2.000000)\" fill=\"#FFFFFF\" fill-rule=\"nonzero\">\n" +
        "            <g id=\"download\" transform=\"translate(2.500000, 2.500000)\">\n" +
        "                <path d=\"M11.455,6.8371875 C11.374,6.669375 11.196,6.5625 11,6.5625 L9,6.5625 L9,0.46875 C9,0.21 8.776,0 8.5,0 L6.5,0 C6.224,0 6,0.21 6,0.46875 L6,6.5625 L4,6.5625 C3.804,6.5625 3.626,6.6703125 3.545,6.8371875 C3.463,7.005 3.495,7.2009375 3.624,7.3396875 L7.124,11.0896875 C7.219,11.191875 7.356,11.25 7.5,11.25 C7.644,11.25 7.781,11.1909375 7.876,11.0896875 L11.376,7.3396875 C11.506,7.201875 11.536,7.005 11.455,6.8371875 Z\" id=\"Shape\"></path>\n" +
        "                <path d=\"M13,10.3125 L13,13.125 L2,13.125 L2,10.3125 L0,10.3125 L0,14.0625 C0,14.5809375 0.448,15 1,15 L14,15 C14.553,15 15,14.5809375 15,14.0625 L15,10.3125 L13,10.3125 Z\" id=\"Shape\"></path>\n" +
        "            </g>\n" +
        "        </g>\n" +
        "    </g>\n" +
        "</svg>"
    downloadBtn.onclick = function(caller, obj) {
        return function() {
            downloadAction(caller, obj);
        };
    }(downloadBtn, obj);
    td.appendChild(downloadBtn);


    var perViewBtn = createOpBtn();
    perViewBtn.innerHTML = "\n" +
        "<svg width=\"16px\" height=\"16px\" viewBox=\"0 0 16 16\" version=\"1.1\">\n" +
        "    <desc>Created with Sketch.</desc>\n" +
        "    <defs></defs>\n" +
        "    <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n" +
        "        <g id=\"Artboard\" transform=\"translate(-2.000000, -2.000000)\" fill=\"#FFFFFF\" fill-rule=\"nonzero\">\n" +
        "            <g id=\"preview\" transform=\"translate(2.000000, 2.000000)\">\n" +
        "                <path d=\"M15.7782663,14.8125198 L14.3759773,13.4141921 C14.7191841,12.8927006 14.9196601,12.2697853 14.9196601,11.6007232 C14.9196601,10.0054237 13.7834788,8.6699661 12.2756261,8.35615819 L12.2756261,5.66716384 C12.275762,5.66128814 12.2765326,5.65559322 12.2765326,5.64967232 C12.2765326,5.48659887 12.218153,5.33749153 12.1219717,5.22051977 C12.1210652,5.21943503 12.1202493,5.21835028 12.1193428,5.21726554 C12.1067422,5.2020791 12.0934164,5.18761582 12.0795467,5.17360452 C12.0776884,5.17175141 12.0758754,5.16985311 12.074017,5.168 C12.0679433,5.1620339 12.0623229,5.15557062 12.0560227,5.14983051 L7.09076487,0.198689266 C7.09058357,0.198463277 7.09031161,0.198282486 7.09013031,0.198056497 C7.07616997,0.184180791 7.0616204,0.17120904 7.04675354,0.158779661 C7.04208499,0.154892655 7.03728045,0.151231638 7.03252125,0.147435028 C7.02159773,0.138757062 7.01049292,0.130440678 6.99907082,0.122485876 C6.99349575,0.118553672 6.98787535,0.114711864 6.98211898,0.110960452 C6.97015297,0.103141243 6.95796034,0.095819209 6.9455864,0.0888135593 C6.94055524,0.0859661017 6.93566006,0.0828926554 6.93053824,0.080180791 C6.91408499,0.0714124294 6.89731445,0.0633672316 6.88027195,0.056 C6.87329178,0.0529717514 6.86608499,0.0503502825 6.85896884,0.0475480226 C6.84772805,0.0431186441 6.83644193,0.038960452 6.8249745,0.0351638418 C6.81695184,0.0324971751 6.80888385,0.029920904 6.80077054,0.0275706215 C6.78794334,0.023819209 6.77498017,0.0206101695 6.76192635,0.0176271186 C6.75571671,0.016180791 6.74964306,0.0144632768 6.7433881,0.0132429379 C6.72448725,0.00949152542 6.7054051,0.00668926554 6.68623229,0.00456497175 C6.68006799,0.00388700565 6.67385836,0.00348022599 6.66764873,0.00293785311 C6.65201133,0.00162711864 6.63637394,0.000858757062 6.62064589,0.000587570621 C6.61701983,0.000497175141 6.61352975,0 6.60990368,0 L0.717552408,0 C0.342073654,0 0.0376657224,0.303548023 0.0376657224,0.677966102 L0.0376657224,14.2372881 C0.0376657224,14.6117062 0.342073654,14.9152542 0.717552408,14.9152542 L11.5957394,14.9152542 C12.2667422,14.9152542 12.8914674,14.7153446 13.4144816,14.3729718 L14.8167705,15.7712542 C14.9495297,15.9036384 15.1235354,15.9698531 15.2975411,15.9698531 C15.4715467,15.9698531 15.6455524,15.9036836 15.7782663,15.7712542 C16.0437847,15.5065311 16.0437847,15.0772429 15.7782663,14.8125198 Z M13.5598867,11.6007684 C13.5598867,12.6807232 12.6787989,13.559322 11.5957394,13.559322 C10.5126799,13.559322 9.63159207,12.680678 9.63159207,11.6007684 C9.63159207,10.5208588 10.5126799,9.64216949 11.5957394,9.64216949 C12.6787989,9.64216949 13.5598867,10.5208136 13.5598867,11.6007684 Z M7.28979037,2.31471186 L9.95435694,4.97175141 L7.28979037,4.97175141 L7.28979037,2.31471186 Z M1.39743909,1.3559322 L5.930017,1.3559322 L5.930017,5.64971751 C5.930017,6.02413559 6.23442493,6.32768362 6.60990368,6.32768362 L10.9158527,6.32768362 L10.9158527,8.35620339 C9.408,8.6700113 8.2718187,10.0054237 8.2718187,11.6007684 C8.2718187,12.3330169 8.51159207,13.0102147 8.91644193,13.559322 L1.39743909,13.559322 L1.39743909,1.3559322 Z\" id=\"XMLID_231_\"></path>\n" +
        "            </g>\n" +
        "        </g>\n" +
        "    </g>\n" +
        "</svg>";
    perViewBtn.onclick = function(caller, obj) {
        return function() {
            previewAction(caller, obj);
        };
    }(perViewBtn, obj);
    td.appendChild(perViewBtn);

    var sharedBtn = createOpBtn();
    sharedBtn.innerHTML = "\n" +
        "<svg width=\"16px\" height=\"16px\" viewBox=\"0 0 16 16\" version=\"1.1\">\n" +
        "    <desc>Created with Sketch.</desc>\n" +
        "    <defs></defs>\n" +
        "    <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n" +
        "        <g id=\"shard\" transform=\"translate(-2.000000, -2.000000)\" fill=\"#FFFFFF\" fill-rule=\"nonzero\">\n" +
        "            <g id=\"share\" transform=\"translate(2.500000, 2.500000)\">\n" +
        "                <path d=\"M14.2129442,6.53109905 L12.0110119,6.53109905 L12.0110119,8.33213928 L13.0899283,8.33213928 L13.0899283,13.0514755 L2.10942985,13.0514755 L2.10942985,8.33213928 L3.07895845,8.33213928 L3.07895845,6.53109905 L0.931253742,6.53109905 C0.589775481,6.53109905 0.31347222,6.7404197 0.31347222,6.99911535 L0.31347222,14.5083424 C0.31347222,14.767038 0.589775481,14.9763587 0.931253742,14.9763587 L14.2129442,14.9763587 C14.5544224,14.9763587 14.8307257,14.767038 14.8307257,14.5083424 L14.8307257,6.99911535 C14.8307257,6.7404197 14.5544224,6.53109905 14.2129442,6.53109905 Z\" id=\"Shape\"></path>\n" +
        "                <path d=\"M11.455,6.8371875 C11.374,6.669375 11.196,6.5625 11,6.5625 L9,6.5625 L9,0.46875 C9,0.21 8.776,0 8.5,0 L6.5,0 C6.224,0 6,0.21 6,0.46875 L6,6.5625 L4,6.5625 C3.804,6.5625 3.626,6.6703125 3.545,6.8371875 C3.463,7.005 3.495,7.2009375 3.624,7.3396875 L7.124,11.0896875 C7.219,11.191875 7.356,11.25 7.5,11.25 C7.644,11.25 7.781,11.1909375 7.876,11.0896875 L11.376,7.3396875 C11.506,7.201875 11.536,7.005 11.455,6.8371875 Z\" id=\"Shape\" transform=\"translate(7.499910, 5.625000) scale(1, -1) translate(-7.499910, -5.625000) \"></path>\n" +
        "            </g>\n" +
        "        </g>\n" +
        "    </g>\n" +
        "</svg>"
    sharedBtn.onclick = function(caller, obj) {
        return function() {
            sharedAction(caller, obj);
        };
    }(sharedBtn, obj);
    td.appendChild(sharedBtn);

    var removeBtn = createOpBtn();
    removeBtn.classList.replace("btn-primary", "btn-danger");
    removeBtn.innerHTML = "\n" +
        "<svg width=\"16px\" height=\"16px\" viewBox=\"0 0 16 16\" version=\"1.1\">\n" +
        "    <desc>Created with Sketch.</desc>\n" +
        "    <defs></defs>\n" +
        "    <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n" +
        "        <g id=\"remove\" transform=\"translate(-2.000000, -2.000000)\" fill=\"#FFFFFF\" stroke=\"#FFFFFF\">\n" +
        "            <g id=\"Group\" transform=\"translate(2.914919, 1.942580)\">\n" +
        "                <path d=\"M0.188205901,1.70882278 C0.72453821,2.25666095 12.6982595,14.1316142 13.2137446,14.6284165 C13.7292297,15.1252188 14.4832429,14.3248751 14.022553,13.8556413 C13.5618632,13.3864075 1.42150771,1.34491638 0.956374992,0.894365339 C0.491242278,0.443814303 -0.348126408,1.16098462 0.188205901,1.70882278 Z\" id=\"Path-2\"></path>\n" +
        "                <path d=\"M0.188205901,1.70882278 C0.72453821,2.25666095 12.6982595,14.1316142 13.2137446,14.6284165 C13.7292297,15.1252188 14.4832429,14.3248751 14.022553,13.8556413 C13.5618632,13.3864075 1.42150771,1.34491638 0.956374992,0.894365339 C0.491242278,0.443814303 -0.348126408,1.16098462 0.188205901,1.70882278 Z\" id=\"Path-copy\" transform=\"translate(7.090437, 7.768817) scale(1, -1) translate(-7.090437, -7.768817) \"></path>\n" +
        "            </g>\n" +
        "        </g>\n" +
        "    </g>\n" +
        "</svg>";
    removeBtn.onclick = function(caller, obj) {
        return function() {
            removeAction(caller, obj);
        };
    }(removeBtn, obj);
    td.appendChild(removeBtn);
}

function createOpBtn(btnId) {
    var btn = document.createElement("button");
    btn.classList.add("btn", "btn-primary");
    btn.setAttribute("type", "button");
    btn.setAttribute("style", "margin:2px 5px;");
    if (btnId) btn.setAttribute("id", btnId);
    return btn;
}


function downloadFileWithObj(btn, obj, preview) {
    // var xhttp;
    // xhttp = new XMLHttpRequest();
    // xhttp.onreadystatechange = function() {
    //     if (this.readyState == 4) {
    //         jkconsole("????")
    //         $(btn).prop("disable",false)
    //     }
    // };
    //
    var path = "";

    if (obj["DirPath"] && obj["DirPath"].length > 0) {
        path = obj["DirPath"] + '/' + obj["Name"];
    } else {
        path = obj["Name"];
    }

    var url = downloadJsonUrl + "?filePath=" + btoa(toBinary(path));
    if (preview) {
        if (obj["IsDir"]) {
            showFailed("Dir could not preview.")
            return
        } else {
            url += "&download=true";
        }
    }
    //
    // xhttp.open("GET", url , true);

    // xhttp.send();

    let name = obj["Name"]
    let suffix = "mp4"
    if (name.indexOf(suffix, name.length - suffix.length) === -1) {
        window.open(url)
    } else {
        previewWithVideo(url)
    }
}

function downloadAction(caller, obj) {
    event.cancelBubble = true;

    // var span = document.createElement("span")
    // span.classList.add("spinner-border","spinner-border-sm")
    // caller.appendChild(span)
    // $(caller).prop('disabled', true)

    downloadFileWithObj(caller, obj, false)
}

function previewAction(caller, obj) {
    event.cancelBubble = true;
    downloadFileWithObj(caller, obj, true)
}

function sharedAction(caller, obj) {
    event.cancelBubble = true;

    if (sharedUrl.length <= 0 || sharedUrl == null) {
        showFailed("Unsupported Feature");
        return;
    }

    if (clearPopover(caller)) return;

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            var title = "";
            let contentEle = null;
            let isHtml = false;
            if (this.status == 200) {
                title = "Shared Success";
                let content = sharedUrl + '/' + this.responseText;
                contentEle = document.createElement("div")
                contentEle.addEventListener("click", function(event) {
                    copyTextToClipboard(content);
                });
                let qrcodeElement = document.createElement("div")
                qrcodeElement.style.textAlign = "-webkit-center";
                let qrcodeGenerator = new QRCode(qrcodeElement, {
                    text: content,
                    width: 168,
                    height: 168,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
                contentEle.append(content)
                let gapEle = document.createElement("div")
                gapEle.setAttribute("style", "height:12px;")
                contentEle.appendChild(gapEle)
                contentEle.appendChild(qrcodeElement)

                isHtml = true;
            } else {
                title = "Shared Failed";
                contentEle = this.responseText;
            }

            $(caller).popover({
                "container": 'body',
                "title": title,
                "content": contentEle,
                "placement": "top",
                "html": isHtml
            }).popover("show");
            curPopoverObj = caller;
        }
    };

    var path = "";

    if (obj["DirPath"] && obj["DirPath"].length > 0) {
        path = obj["DirPath"] + '/' + obj["Name"];
    } else {
        path = obj["Name"];
    }

    var url = sharedUrl

    xhttp.open("POST", url, true);
    var data;
    data = new FormData();
    data.append("filePath", btoa(toBinary(path)));
    data.append("timeInterval", 2);

    xhttp.withCredentials = true;

    xhttp.send(data);

}

function removeAction(caller, obj) {
    event.cancelBubble = true;

    if (removeUrl == null || removeUrl.length <= 0) {
        showFailed("Unsupported Feature");
        return;
    }

    if (window.confirm("Really Want To Delete " + obj["Name"] + " ?")) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                var title = "";
                var content = "";
                if (this.status == 200) {
                    removeObj(obj, caller);
                    removeElementWithObj(caller);
                } else {
                    showFailed(this.responseText);
                }
            }
        };

        var path = "";

        if (obj["DirPath"] && obj["DirPath"].length > 0) {
            path = obj["DirPath"] + '/' + obj["Name"];
        } else {
            path = obj["Name"];
        }

        var url = removeUrl;

        xhttp.open("POST", url, true);
        var data;
        data = new FormData();
        data.append("filePath", path);
        data.append("isDir", obj["IsDir"]);

        xhttp.withCredentials = true;
        xhttp.send(data);
    } else {

    }
}

function goDeep(caller, rowOrObj) {

    var linkElementId = caller.getAttribute("linkElementId");
    if (linkElementId != null) {
        if (!rowOrObj["IsDir"]) {
            return
        }
        var idxArr = linkElementId.split('-');
        deepIdx = idxArr.length;
        deepIdxArr = idxArr;
        deepObjArr = rowOrObj["SubFiles"];

    } else {
        if (!deepObjArr[rowOrObj]["IsDir"]) {
            return
        }
        deepIdx++;
        deepIdxArr.push(rowOrObj);
        deepObjArr = deepObjArr[rowOrObj]["SubFiles"];
    }



    jkconsole("deepindex -- ", deepIdx, " deepidxArr -- ", deepIdxArr, " deepObj -- ", deepObjArr);

    reloadTable()

}

function getTrElement(caller) {
    //get tr element
    var el = caller;
    do {
        if (el.tagName && el.tagName.toLowerCase() == "tr") {
            break;
        }
        el = el.parentElement;
    } while (el != null && el.parentElement != null);
    return el;
}

function removeElementWithObj(caller) {
    //get tr element
    var el = getTrElement(caller);

    //get relative element Id
    var relativeElementId = el.getAttribute("linkElementId");
    if (relativeElementId != null) {
        var collections = el.parentElement.children;
        for (var i = collections.length - 1; i >= 0; i--) {
            var elementId = collections[i].getAttribute("linkElementId");
            if (elementId != null && elementId.startsWith(relativeElementId)) {
                el.parentElement.removeChild(collections[i]);
            }
        }
    } else {
        //remove called tr element
        el.parentElement.removeChild(el);
    }
}

function removeObj(obj, btnCaller) {

    var linkElementId = getTrElement(btnCaller).getAttribute("linkElementId");
    if (linkElementId != null) {
        var idxArr = linkElementId.split('-');
        var lastIdx = idxArr[idxArr.length - 1];
        var removeObj = jsonObj;
        for (var i = 0; i < idxArr.length - 1; i++) {
            var objIdx = idxArr[i];
            var tmpObj = removeObj[parseInt(objIdx)];
            removeObj = tmpObj["SubFiles"];
        }
        removeObj.splice(lastIdx, 1);
    } else {
        //remove data
        var objIndex = deepObjArr.indexOf(obj);
        if (!isNaN(objIndex)) deepObjArr.splice(objIndex, 1);
    }
}

function reloadTable() {
    var table = document.getElementById("table-body");
    table.innerHTML = "";

    clearPopover();
    tableEnter();
}

function goBackDeep() {
    deepIdx--;

    //find obj
    var obj = jsonObj;

    if (deepIdx > 0) {
        for (i = 0; i < deepIdx; i++) {
            var row = deepIdxArr[i];
            obj = obj[row]["SubFiles"];
            jkconsole("searching deepindex -- ", deepIdx, " deepidxArr -- ", deepIdxArr, " deepObj -- ", obj);
        }
    }

    deepIdxArr.pop();
    deepObjArr = obj;

    jkconsole("deepindex -- ", deepIdx, " deepidxArr -- ", deepIdxArr, " deepObj -- ", obj);
    reloadTable()
}

function backToTopDir() {
    deepIdx = 0;
    deepIdxArr = [];
    deepObjArr = jsonObj;
    reloadTable();
}

function jkconsole(...args) {
    // console.log(args)
}

function clearPopover(objCaller) {
    if (curPopoverObj != null) {
        var sameObj = (objCaller == curPopoverObj);
        $(curPopoverObj).popover("dispose");
        curPopoverObj = null;

        if (sameObj) return true;
    }
    return false;
}

// convert a Unicode string to a string in which
// each 16-bit unit occupies only one byte
function toBinary(string) {
    const codeUnits = new Uint16Array(string.length);
    for (let i = 0; i < codeUnits.length; i++) {
        codeUnits[i] = string.charCodeAt(i);
    }
    const charCodes = new Uint8Array(codeUnits.buffer);
    let result = '';
    for (let i = 0; i < charCodes.byteLength; i++) {
        result += String.fromCharCode(charCodes[i]);
    }
    return result;
}

function fromBinary(binary) {
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    const charCodes = new Uint16Array(bytes.buffer);
    let result = '';
    for (let i = 0; i < charCodes.length; i++) {
        result += String.fromCharCode(charCodes[i]);
    }
    return result;
}


//input search style
const searchStyle = `
        ::-webkit-input-placeholder {
            font-style: italic;
        }
        ::-moz-placeholder { font-style: italic; } /* firefox 19+ */
        :-ms-input-placeholder {font-style: italic;} /* Internet Explorer 10+ */
        :-moz-placeholder { font-style: italic; } /* firefox 14-18 */
    `;
const addStyle = document.createElement('style');
addStyle.type = 'text/css';
addStyle.innerHTML = searchStyle;
document.getElementsByTagName('head')[0].appendChild(addStyle);

//input search function
var inputElement = document.getElementById("search-input")
inputElement.addEventListener('input', searchInputChange);

function searchInputChange(evt) {

    //query list
    var inputStr = evt.target.value;

    if (inputStr.length <= 0) {
        backToTopDir();
        return;
    }

    var table = document.getElementById("table-body");
    table.innerHTML = "";
    clearPopover();
    filterArrayFromText(inputStr, table)
};

function filterArrayFromText(txt, table) {
    var obj = jsonObj;

    recursiveGetObjWithTxt(obj, null, txt, function(dic, elementId) {
        createTableRowWithObj(dic, table, elementId);
    });
}

function recursiveGetObjWithTxt(inputObj, linkElementId, searchTxt, handle) {
    for (var i = 0; i < inputObj.length; i++) {
        var curId = i;
        var tmpDic = inputObj[i];
        if (tmpDic["Name"].search(new RegExp(searchTxt, "i")) != -1) {
            handle(tmpDic, bindLinkElementId(linkElementId, curId));
        }
        if (tmpDic["SubFiles"] != null && tmpDic["SubFiles"].length > 0) {
            recursiveGetObjWithTxt(tmpDic["SubFiles"], bindLinkElementId(linkElementId, curId), searchTxt, handle);
        }
    }
}

function bindLinkElementId(originId, curId) {
    if (originId != null) {
        return originId + "-" + curId
    } else {
        return curId.toString()
    }
}

function getSamePrefixStringFromTwoStrings(firstString, secondString) {
    var length = Math.min(firstString.length, secondString.length);

    var findIndex = length - 1;
    for (var i = 0; i < length; i++) {
        if (firstString[i] != secondString[i]) {
            findIndex = i - 1;
            break;
        }
    }

    if (findIndex < 0) return null

    return firstString.slice(0, findIndex + 1)
}


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

function showSuccess(msg) {
    showMsg("btn-success", msg, 3000);
}

//Sort Row
var sortType = 0;
var sortOrderIncrease = false;

function sortRow() {
    if (sortType <= 0) {
        return;
    }

    switch (sortType) {
        case 1:
            {
                sortWithName();
                break;
            }
        case 2:
            {
                sortWithSize();
                break;
            }
        case 3:
            {
                sortWithTime();
                break;
            }
        default:
            {

            }
    }

}

function sortClickName() {
    if (sortType === 1) {
        sortOrderIncrease = !sortOrderIncrease;
    } else {
        sortOrderIncrease = false;
    }
    sortType = 1;
    sortIconChange();
    reloadTable();
}

function sortWithName() {
    deepObjArr.sort(function(a, b) {
        if (a["IsDir"] && !b["IsDir"]) {
            return -1;
        }
        if (b["IsDir"] && !a["IsDir"]) {
            return 1;
        }
        return a["Name"].localeCompare(b["Name"]);
    });

    if (sortOrderIncrease) {
        deepObjArr.reverse();
    }
}

function sortClickSize() {
    if (sortType === 2) {
        sortOrderIncrease = !sortOrderIncrease;
    } else {
        sortOrderIncrease = false;
    }
    sortType = 2;
    sortIconChange();
    reloadTable();
}

function sortWithSize() {

    deepObjArr.sort(function(a, b) {
        if (a["IsDir"] && !b["IsDir"]) {
            return 1;
        }
        if (b["IsDir"] && !a["IsDir"]) {
            return -1;
        }
        return b["Size"] - a["Size"];
    });

    if (sortOrderIncrease) {
        deepObjArr.reverse();
    }
}

function sortClickTime() {
    if (sortType === 3) {
        sortOrderIncrease = !sortOrderIncrease;
    } else {
        sortOrderIncrease = false;
    }
    sortType = 3;
    sortIconChange();
    reloadTable();
}

function sortWithTime() {
    deepObjArr.sort(function(a, b) {
        return b["ModTime"] - a["ModTime"];
    });

    if (sortOrderIncrease) {
        deepObjArr.reverse();
    }
}

function sortIconChange() {
    document.getElementById("sortIcon1").innerText = "";
    document.getElementById("sortIcon2").innerText = "";
    document.getElementById("sortIcon3").innerText = "";

    var icon = "";
    if (sortOrderIncrease) {
        icon = " ↑";
    } else {
        icon = " ↓";
    }

    let htmlId = "sortIcon" + sortType;
    document.getElementById(htmlId).innerText = icon;
}

function remoteDownload() {
    var url = document.getElementById("url-path").value;
    var name = document.getElementById("save-name").value;

    if (url.length > 0 && url.startsWith("http")) {} else {
        showFailed("URL is not legal.");
        return;
    }

    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                showSuccess('Add Task Success!')
            } else {
                showFailed(this.responseText);
            }
        }
    };

    var requestUrl = remoteDownloadUrl + "?url=" + btoa(toBinary(url));
    if (name.length > 0) {
        requestUrl += "&filename=" + btoa(toBinary(name));
    }

    xhttp.open("GET", requestUrl, true);

    xhttp.send();

    $('#modalDownload').modal('hide')
}

var taskListTimer;
//download task list modal hidden event
$('#modalDownloadList').on('hidden.bs.modal', function(e) {
    // do something...
    clearInterval(taskListTimer);
    taskListTimer = null;
})

//download task list modal show event
$('#modalDownloadList').on('shown.bs.modal', function(e) {
    // do something...
    if (taskListTimer == null) {
        taskListTimer = setInterval(() => {
            getDownloadTaskList();
        }, 1000);
    }
})

function getDownloadTaskList() {

    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                jkconsole(this.responseText)
                createListWithData(JSON.parse(this.responseText))
            } else {
                showFailed(this.responseText);
            }
        }
    };

    var requestUrl = remoteDownloadUrl + "?type=list";

    xhttp.open("GET", requestUrl, true);

    xhttp.send();
}

function clearDownloadTasks() {
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                getDownloadTaskList();
            } else {
                showFailed(this.responseText);
            }
        }
    };

    var requestUrl = remoteDownloadUrl + "?type=clear";

    xhttp.open("GET", requestUrl, true);

    xhttp.send();
}

function createListWithData(data) {

    if (data != null) {
        visableTaskList(true)

        sortTaskListData(data)

        let table = document.getElementById("task-list-table-body")

        if (document.getElementById("task-list-table-list-anchor") == null) {
            table.innerHTML = "<tr id='task-list-table-list-anchor'>\
                                    <th>\
                                    </th>\
                                    <th style=\"width: 30%;\">\
                                    </th>\
                                </tr>\
            "
        }

        //check rows with datas
        let lists = new Array();
        let copyDOM = Array.prototype.slice.call(table.children)
        copyDOM.forEach((element) => {
            if (element.getAttribute('id').startsWith('taskList-')) {
                if (lists.length >= data.length) {
                    element.parentElement.removeChild(element);
                } else {
                    lists.push(element);
                }
            }
        })

        for (let index = 0; index < data.length; index++) {
            const subData = data[index];

            let tr;
            if (index >= lists.length) {
                tr = createTaskList();
                table.appendChild(tr);
            } else {
                tr = lists[index];
            }

            updateTaskListWithData(tr, subData);

        }

    } else {
        visableTaskList(false)
    }
}

function createTaskList() {

    let tr = document.createElement("tr")
    tr.classList.add('task-list')

    let nametd = document.createElement("td")
    nametd.classList.add('task-content');

    nametd.innerHTML = "<div onclick=\"toggleDisplay(this)\">\
                                        <div class='task-content-name' style=\"display: contents;\">" + "</div>\
                                        <div class='task-content-source' style=\"display: none;\">" + "</div>\
                                        <button type=\"button\" class=\"btn btn-link\" style=\"padding: 0 0 3px 0;\" onclick=\"copyTaskElement(this)\">copy</button>\
                                    </div>"

    let progresstd = document.createElement("td")
    progresstd.innerHTML = "<div class=\"progress\">\
                <div class=\"progress-bar\"role=\"progressbar\"style=\"width: 100%" + "\"aria-valuenow=\"0\"aria-valuemin=\"0\"aria-valuemax=\"100\">" + "</div>\
                </div>"

    tr.append(nametd)
    tr.append(progresstd)

    return tr
}

function updateTaskListWithData(tr, data) {

    //check if same list, if so ,maintain copy status
    let copyStatus = false;
    if (tr.getAttribute('id') === ("taskList-" + data['Identify'])) {
        copyStatus = true;
    }

    tr.setAttribute('id', "taskList-" + data['Identify']);

    // 0-ready 1-running 3-finished 4-failed
    let status = data["Status"]

    let statusStyle = ""
    if (status === 0) {
        statusStyle = "bg-secondary"
    } else if (status === 1) {
        statusStyle = "bg-primary"
    } else if (status === 3) {
        statusStyle = "bg-success"
    } else if (status === 4) {
        statusStyle = "bg-danger"
    } else {
        statusStyle = "bg-warning"
    }

    //change name
    let nametd = tr.getElementsByClassName("task-content")[0]
    let name = ""
    if (data["SaveName"] && data["SaveName"] != null) {
        name = data["SaveName"]
    } else {
        name = "< Name Not Found >"
    }
    nametd.getElementsByClassName('task-content-name')[0].innerText = name;
    nametd.getElementsByClassName('task-content-source')[0].innerText = data["SourceUrl"];
    if (!copyStatus) {
        //reset status
        nametd.getElementsByClassName('task-content-name')[0].style.display = 'contents';
        nametd.getElementsByClassName('task-content-source')[0].style.display = 'none';
    }


    //change progress 
    let progresstd = tr.getElementsByClassName('progress-bar')[0]
    for (let j = 0; j < progresstd.classList.length; j++) {
        const className = progresstd.classList[j];
        if (className.startsWith('bg-')) {
            progresstd.classList.remove(className);
        }
    }
    progresstd.classList.add(statusStyle);
    let progressValue = (parseFloat(data["Progress"]) * 100).toFixed(2);
    let progressWord = progressValue + "%"
    if (status === 0) {
        progressValue = 100;
        progressWord = "Waiting"
    } else if (status === 3) {
        progressValue = 100;
        progressWord = "Done"
    } else if (status === 4) {
        progressValue = 100;
        progressWord = "Failed"
    }
    progresstd.style.width = progressValue + "%";
    progresstd.setAttribute('aria-valuenow', progressValue);
    progresstd.innerText = progressWord;
}


function sortTaskListData(data) {
    data.sort(function(a, b) {
        if (a["Status"] === b["Status"]) {
            return a["CreateAt"] < b["CreateAt"] ? 1 : -1;
        } else {
            if (a["Status"] > b["Status"]) {
                return 1;
            } else {
                return -1;
            }
        }
    })
}

function toggleDisplay(ele) {
    let elements = ele.children;
    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        if (element.tagName === "BUTTON") {
            continue
        }
        if (element.style.display === "none") {
            element.style.display = "contents";
        } else {
            element.style.display = "none";
        }
    }
}

function copyTaskElement(btn) {
    event.cancelBubble = true;

    let elements = btn.parentElement.children;
    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        if (element.tagName === "BUTTON") {
            continue
        }
        if (element.style.display !== "none") {
            copyTextToClipboard(element.innerText)
            break
        }
    }
}

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);

    //if apple
    if (navigator.userAgent.match(/ipad|iphone/i)) {
        //range
        let range = document.createRange();
        range.selectNodeContents(textArea);
        let selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        textArea.setSelectionRange(0, 999999);
    } else {
        textArea.select();
    }

    textArea.focus();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
        successful ? showSuccess("copy success!") : showFailed("copy failed!")
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        showFailed("copy error!")
    }

    document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
        showSuccess("copy success!")
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
        showFailed("copy failed!")
    });
}

function visableTaskList(visable) {
    let footer = document.getElementById("task-list-table-footer")
    let taskBody = document.getElementById("task-list-body")
    let taskBodyEmpty = document.getElementById("task-list-body-empty")

    if (visable) {
        footer.style.display = "inherit"
        taskBody.style.display = "inherit"
        taskBodyEmpty.style.display = "none"
    } else {
        footer.style.display = "none"
        taskBody.style.display = "none"
        taskBodyEmpty.style.display = "flex"
    }
}

function closePreviewer(ele) {
    let previewer = ele.parentElement.parentElement;
    document.body.removeChild(previewer)
}



//video css funtion
const videoCssStyle = `
        #video-previewer:-webkit-full-screen {
            width: 100%;
            height: 100%;
            background-color: black;
        }
        #video-previewer:-webkit-full-screen video {
            width: 100%;
        }
    `;
const videoStyle = document.createElement('style');
videoStyle.type = 'text/css';
videoStyle.innerHTML = videoCssStyle;
document.getElementsByTagName('head')[0].appendChild(videoStyle);


function previewWithVideo(url) {
    let previewer = document.createElement("div")

    // if (flvjs.isSupported()) {

    //     previewer.innerHTML = "<div style=\"background: rgba(1,1,1,0.3);position: fixed;display:flex;z-index: 11;top: 0;width: 100%;height: 100%;\">\
    //                         <div style=\"z-index:11;position: absolute;top: -60px;right: -60px;width: 120px;color: white;border-radius: 100%;height: 120px;text-align: left;vertical-align: bottom;background: #0000007a;margin: 0 auto;\" onclick=\"closePreviewer(this)\">\
    //                             <div style='bottom: 0px;position: absolute;width: 60px;height: 60px;line-height: 50px;text-align: center;padding-left: 10px;font-size: 25px;font-weight: 500;'>X</div>\
    //                             </div>\
    //                         <video id=\"video-previewer\">\
    //                             Your browser does not support the video tag.\
    //                         </video>\
    //                     </div>"


    //     document.body.append(previewer)

    //     var videoElement = document.getElementById('video-previewer');
    //     var flvPlayer = flvjs.createPlayer({
    //         type: 'flv',
    //         url: url
    //     });
    //     flvPlayer.attachMediaElement(videoElement);
    //     flvPlayer.load();
    //     flvPlayer.play();

    //     return
    // }

    previewer.innerHTML = "<div style=\"background: rgba(1,1,1,0.3);position: fixed;display:flex;z-index: 11;top: 0;width: 100%;height: 100%;\">\
                                <div style=\"z-index:11;position: absolute;top: -60px;right: -60px;width: 120px;color: white;border-radius: 100%;height: 120px;text-align: left;vertical-align: bottom;background: #0000007a;margin: 0 auto;\" onclick=\"closePreviewer(this)\">\
                                    <div style='bottom: 0px;position: absolute;width: 60px;height: 60px;line-height: 50px;text-align: center;padding-left: 10px;font-size: 25px;font-weight: 500;'>X</div>\
                                    </div>\
                                <video id=\"video-previewer\" mediagroup=\"masterController\">\
                                    <source src=" + encodeURI(url) + " type='video/mp4'>\
                                    Your browser does not support the video tag.\
                                </video>\
                            </div>"


    document.body.append(previewer)

    var demo = new Moovie({
        selector: "#video-previewer",
        dimensions: {
            width: "100%"
        }
    });

    let urls = new Array()
    for (const obj in deepObjArr) {
        if (Object.hasOwnProperty.call(deepObjArr, obj)) {
            const element = deepObjArr[obj];
            const listObj = getPlayListObjFromObj(element);
            if (listObj != null) {
                urls.push(listObj);
            }

        }
    }

    // Call External Plugin
    var PlaylistPlugin = new _Moovie_Playlist({
        reference: demo, // variable that initializated moovie
        sources: urls,
        dimensions: {
            width: "240px",
            height: "100%"
        }
    });

}

function getPlayListObjFromObj(obj) {

    let name = obj["Name"]
    let suffix = "mp4"
    if (name.indexOf(suffix, name.length - suffix.length) === -1) {
        return null
    }
    if (obj["DirPath"] && obj["DirPath"].length > 0) {
        path = obj["DirPath"] + '/' + obj["Name"];
    } else {
        path = obj["Name"];
    }

    var url = downloadJsonUrl + "?filePath=" + btoa(toBinary(path));
    if (preview) {
        if (obj["IsDir"]) {
            return null
        } else {
            url += "&download=true";
        }
    }

    return {
        "src": encodeURI(url),
        "title": obj["Name"]
    }
}