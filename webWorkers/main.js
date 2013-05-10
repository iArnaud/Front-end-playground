/*
 * main.js
 * Copyright (C) 2013 ronan <ronan@vostro1310>
 *
 * Distributed under terms of the MIT license.
 */

"use strict";
var workers = [];
var numWorkers = 3;
for(var i = 0; i < numWorkers; i++){
    workers[i] =  new Worker("worker.js");
    workers[i].postMessage({message: "ping", id: i});
    workers[i].onmessage = onWorkerMessage;
    workers[i].onerror = onWorkerError;
}

function onWorkerError(evt) {
        var text = "<br />Error in worker " + evt.filename + " at line " + evt.lineno + ': ' + evt.message;
        document.getElementById("result").innerHTML += text;
}
function onWorkerMessage(evt) {
    if("pong" == evt.data.message) {
        var text = "<br />Worker " + evt.data.id + " said " + evt.data.message + ', count is ' + evt.data.count;
        document.getElementById("result").innerHTML += text;
    }
}





