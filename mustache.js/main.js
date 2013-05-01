/*
 * main.js
 * Copyright (C) 2013 ronan <ronan@vostro1310>
 *
 * Distributed under terms of the MIT license.
 */

"use strict";

$(document).ready(function(){
    Catastrophes.Flush();
    setInterval(function(){Catastrophes.Flush()}, 10000);
});

var url = 'http://search.twitter.com/search.json?q=catastroph&rpp=50&include_entities=true&result_type=recent&lang=en';

var partials = {
    header: '<h1><a href="' + url + '" target="_blank">Live catastrophes</a></h1><div id="content">'
    ,footer: '</div>'
};

var Catastrophes = {
    Flush: function(){
        $.getJSON(url, function(data){
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
                });
            });
        });
    }
}


