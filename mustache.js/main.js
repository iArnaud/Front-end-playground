/*
 * main.js
 * Copyright (C) 2013 ronan <ronan@vostro1310>
 *
 * Distributed under terms of the MIT license.
 */

"use strict";


$(document).ready(function(){
    Stream.Flush();
    setInterval(function(){Stream.Flush()}, 10000);
});

var search = 'web2day%20c%20est%20parti';
var searchLabel = search.replace(/%20/gi, " ");
console.log(searchLabel);
var rpp = 100;

var url = 'http://search.twitter.com/search.json?q='+search+'&rpp='+rpp+'&include_entities=true&result_type=recent';

//url = "http://playground/mustache.js/search.json";

var partials = {
    header: '<h1><a id="titleLabel" href="' + url + '" target="_blank">Live<br>"' + searchLabel + '"</a></h1><div id="content">'
    ,footer: '</div>'
};

var results;

var Stream = {
    Flush: function(){
        $.getJSON(url, function(data){
            results = data.results;
            console.log(url, results);
            data.getDate = function() {
                var dt = new Date(Date.parse(this.created_at));
                var _date = dt.getDate() + '/'  + parseInt(dt.getMonth()+1) + '/' + dt.getFullYear();
                _date += ' ' + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
                return _date;
            };

            data.userLink = function() {
                return function(user_id, render) {
                    return '<a href="http:\/\/www.twitter.com\/' + render(user_id) + '" target=\"_blank\">@' + render(user_id) + '</a> ';
                }
            };
            data.parsedText = function() {
                var tweetText = this.text;
                var parsedText;

                // @ to links
                parsedText = tweetText.replace(/(^|\s)@(\w+)/g, function(u) {
                    u = u.trim();
                    var username = u.replace("@","");
                    var newLink = ' <a href="http:\/\/www.twitter.com\/'+username+'" target=\"_blank\">@'+username+'<\/a>';
                    return newLink;
                });

                // # links
                parsedText = parsedText.replace(/(^|\s)#(\w+)/g, function(h) {
                    h = h.trim();
                    var hashtag = h.replace("#","");
                    var newLink = ' <a href="http:\/\/www.twitter.com\/search?q='+hashtag+'" target=\"_blank\">'+h+'<\/a>';
                    return newLink;
                });

                // http links
                var linkExp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                parsedText = parsedText.replace(linkExp,"<a target='_blank' href='$1'>$1</a>");

                return parsedText;
            }

            data.userImg = function(){
                return '<img src="' + this.profile_image_url + '" title="' + this.from_user + '" />';
            };

            $('#tweets').fadeOut("fast", function(){
                $('#tweets').fadeIn("fast", function(){
                    $('#tweets').html(Mustache.to_html($('#template').html(), data, partials));
                    $('a#titleLabel').html($('a#titleLabel').html() + "<br>(" + data.results.length + " found)");
                });
            });
        });
    }
}


