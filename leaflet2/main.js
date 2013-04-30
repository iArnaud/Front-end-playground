/*
 * main.js
 * Copyright (C) 2013 ronan <ronan@vostro1310>
 *
 * Distributed under terms of the MIT license.
 */
"use strict";
var map, basemap = null;
var defaultZoom = 7;
var origin = [47, -2];
var shakes = [];
var markers = [];
var attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ';
attribution += '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ';
attribution += 'Imagery © <a href="http://cloudmade.com">CloudMade</a> - ';
attribution += 'Earthquakes RSS feed from © <a href="http://emsc-csem.org">emsc-csem.org</a>';
var apiKey = '4c84f836ade24ee5af7c98fcf67b0f2b';


var initialize = function () {
    map = L.map('map').setView(origin, defaultZoom);
    basemap = L.tileLayer('http://{s}.tile.cloudmade.com/' + apiKey + '/1/256/{z}/{x}/{y}.png', {maxZoom:19}).addTo(map);
    L.tileLayer('http://{s}.tile.cloudmade.com/' + apiKey + '/997/256/{z}/{x}/{y}.png', {attribution: attribution,maxZoom: 18}).addTo(map);
}

$.fn.filterNode = function(name) {
    return this.find('*').filter(function() {
        return this.nodeName === name;
    });
};


function xmlToJson(xml) {

    // Create the return object
    var obj = {};

    // text node
    if (4 === xml.nodeType) {
        obj = xml.nodeValue;
    }

    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var TEXT_NODE_TYPE_NAME = '#text',
            item = xml.childNodes.item(i),
            nodeName = item.nodeName,
            content;

            if (TEXT_NODE_TYPE_NAME === nodeName) {
                //single textNode or next sibling has a different name
                if ((null === xml.nextSibling) || (xml.localName !== xml.nextSibling.localName)) {
                    content = xml.textContent;

                    //we have a sibling with the same name
                } else if (xml.localName === xml.nextSibling.localName) {
                    //if it is the first node of its parents childNodes, send it back as an array
                    content = (xml.parentElement.childNodes[0] === xml) ? [xml.textContent] : xml.textContent;
                }
                return content;
            } else {
                if ('undefined' === typeof(obj[nodeName])) {
                    obj[nodeName] = xmlToJson(item);
                } else {
                    if ('undefined' === typeof(obj[nodeName].length)) {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }

                    obj[nodeName].push(xmlToJson(item));
                }
            }
        }
    }
    return obj;
}

var Shake = function (args) {
    this.geo = args.json;

    this.lat = parseFloat(this.geo['geo:lat']);
    this.long = parseFloat(this.geo['geo:long']);
    this.latLng = {};
    if('undefined' != typeof(L)) {
        this.latLng = new L.LatLng(this.lat, this.long);
    }
    this.magnitude = this.magnitude || parseFloat(this.geo['emsc:magnitude'].replace('ML ',''));
    this.depth = parseInt($.trim(this.geo['emsc:depth']));
    this.time = this.geo['emsc:time'];
    this.year =  parseInt(this.time.substring(0,4));
    this.month = parseInt(this.time.substring(5,7));
    this.yearMonth = this.time.substring(0,7);
    this.popUpContent = '<span><a href="' + this.geo['link'] + '">';
    this.popUpContent += '<strong>' + this.geo['title'] + '</strong></a>';
    this.popUpContent += '<br>Time: ' + this.time;
    this.popUpContent += "<br>Magnitude: " + this.magnitude;
    this.popUpContent += "<br>Depth: " + this.depth;
    this.popUpContent += "<br>Coords: " + this.lat + ";" + this.long;
    this.popUpContent += '</span>';
    shakes.push(this);
    this.placeMarker = function (){
        if('undefined' != typeof(L)) {
            var marker = L.marker(this.latLng).addTo(map);
            marker.bindPopup(this.popUpContent);
        }
        markers.push(marker);
    }
};

var Stats = function() {};
Stats.prototype = {
    min : 0,
    max : 12,
    step : 1,
    levels : [],
    knownLevels : {},

    depths : [],
    knownDepths : {},

    knownYears : [],
    knownMonthes : [],

    shakesInCurrentMonth : [],

    statsSummary : "",

    currentMonth : null,
    currentMonthLiteral : '',

    Register : function(shake) {
        var i = 0;
        for(i=this.min;i<this.max;i+=this.step) {
            this.levels[i] = this.levels[i] || [];
            if((i <= shake.magnitude) && (shake.magnitude < parseFloat(i+this.step))) {
                this.levels[i].push(shake);
            }
        }
        if(this.GetCurrentMonth() == shake.yearMonth) {
            this.shakesInCurrentMonth.push(shake);
        }
    },

    GetCurrentMonth : function () {
        if(!this.currentMonth) {
            var date = new Date();
            this.currentMonth = parseInt(date.getMonth()+1);
            if (1 === String(this.currentMonth).length) {
                this.currentMonth = "0" + String(this.currentMonth);
            }
            this.currentMonthLiteral = this.currentMonth + '/' + date.getFullYear();
            this.currentMonth = date.getFullYear() + '-' + this.currentMonth;
        }
        return this.currentMonth;
    },

    GenerateShakesStats : function() {
        var i=0;
        var shakesLevels = [];
        var shakesYears = [];
        var statsSummary = "";

        // levels
        for(i=this.min;i<this.max;i+=this.step) {
            if(this.levels[i] && 0 < this.levels[i].length) {
                this.knownLevels[""+i] = this.levels[i];
            }
        }
        for(i=0;i<shakes.length;i++) {
            if(2000 < shakes[i].year) {
                this.knownYears[shakes[i].year+""] = this.knownYears[shakes[i].year+""] || 0;
                this.knownYears[shakes[i].year+""] += 1;
            }
        }
        i=0;
        for(var prop in this.knownLevels){
            shakesLevels.push(this.knownLevels[prop].length + " shakes with magnitude " + (i+1));
            i++;
        }
        this.statsSummary = shakesLevels.join(' ; ') + '.';

        // years
        for(var prop in this.knownYears) {
            shakesYears.push(this.knownYears[prop] + " shakes in " + prop );
        }
        this.statsSummary += '<br />' + shakesYears.join(' ; ');
        this.statsSummary += ' ; ' + this.shakesInCurrentMonth.length + ' in current ' + this.currentMonthLiteral + '.';
    }
};

function handleRSS(url) {
    $.ajax({
        type: "GET",
        url: url,
        dataType: 'xml'
        }).done(function(xml) {
            var i=0;
            var stats= new Stats();
            $(xml).filterNode('item').each(function() {
                var shake = new Shake({json: xmlToJson(this)});
                shake.placeMarker();
                stats.Register(shake);
            });
            stats.GenerateShakesStats();
            var legend = '<a href="'+url+'">Earthquakes feed source</a>';
            legend += ' - ' + shakes.length + ' earthquakes';
            if(shakes.length > 0) {
                legend += ' from ' + shakes[shakes.length-1].time + ' to ' + shakes[0].time;
            }
            $('#legend').html(legend + ':<br>' + stats.statsSummary);
        });
    }

    $(document).ready(function() {
        // EMSC - Last 50 earthquakes 200km around Nantes, France
        var url = 'http://www.emsc-csem.org/service/rss/rss.php?typ=emsc&min_lat=43.95411967351&min_long=-5.965270057344&max_lat=50.291525105654&max_long=3.4187817544348';
        //url = '../rss.xml'; // local copy
        initialize();
        handleRSS(url);
    });


