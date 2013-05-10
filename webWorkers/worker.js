/*
 * main.js
 * Copyright (C) 2013 ronan <ronan@vostro1310>
 *
 * Distributed under terms of the MIT license.
 */

"use strict";
onmessage = handleMessage;
var count = 0;
var id;

function handleMessage(evt) {
    id = evt.data.id;
    if ("ping" == evt.data.message) {
        sendMessage();
    }
}

var sendMessage = function() {
    postMessage({message:"pong", count: count, id: id});
    count++;
    setTimeout("sendMessage()", 2500);
};
