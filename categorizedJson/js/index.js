var filters = ['espace_pub', 'logement', 'activite_eco', 'equipement'];
var contextualFilters = [];

$(document).ready(function() {

    // a sort of bubble sort
    DATA.sort(function(a,b){
        if(a.nom<b.nom) return -1;
        if(a.nom>b.nom) return 1;
        return 0;
    })

    fillProjects();

    // Filter list item click handler: add/remove last clicked filter in elements datasets
    $('#filters ul li a').on('click', function(e){
        e.preventDefault();
        var filter = $(this).attr('id');
        var selecteds = '#projects ul li a.' + filter;

        console.log("FILTER CLICKED: " + filter);

        if($(this).parent().hasClass('disabled')) {
            $(this).parent().removeClass('disabled');
            addFilter(selecteds, filter, flushStyles);
        } else {
            $(this).parent().addClass('disabled');
            removeFilter(selecteds, filter, flushStyles);
        }
    });


    $('#fake').on('load', function(){
        $('.ekwalable').delay(1000).ekwal();
    });
});

/* remove/add filter functions:
 *
 * Uses the last clicked filter to change the DOMelement.dataset.filters array
 *
 * Here we us a IDs array
 * instead of using a usual jQuery's $('.aClass') selector
 * because classes changes with filters,
 * and the .on() ('click') event handler takes such classes list changes in account.
 */

/*
 * Change elem dataset after a context's filter is being removed.
 *
 * @param {string} selecteds - The DOM selector
 * @param {string} filter - The last clicked filter
 * @param {string} callback - The callback fuction name to fire
 */
var removeFilter = function (selecteds, filter, callback) {
    var ids = [];
    $(selecteds).each(function(index){
        var elem = $(selecteds)[index];
        ids.push($(elem).attr('id'));
    });

    $(ids).each(function(index){
        var elem = $('#' + ids[index])[0];

        elem.dataset.filters = $.trim(elem.dataset.filters.replace(filter, ''));

        // check elem display:
        $(elem).parent().show();
        if(0 === elem.dataset.filters.length) {
            $(elem).parent().hide();
        }

        callback(elem);
    });
}

/*
 * Change elem dataset after a context's filter is being added
 *
 * @param {string} selecteds - The DOM selector
 * @param {string} filter - The last clicked filter
 * @param {string} callback - The callback fuction name to fire
 */
var addFilter = function (selecteds, filter, callback) {
    var ids = [];
    $(selecteds).each(function(index){
        var elem = $(selecteds)[index];
        ids.push($(elem).attr('id'));
    });
    $(ids).each(function(index){
        var elem = $('#' + ids[index])[0];

        // redefine elem filters:
        elem.dataset.filters += (' ' + filter);
        elem.dataset.filters = $.trim(elem.dataset.filters.replace('  ',' '));

        // check elem display:
        if(0 == elem.dataset.filters.length) {
            $(elem).parent().hide();
        }
        $(elem).parent().show();

        callback(elem);
    });
}

/*
 * After datasets begin changed,
 * move classes to change styles
 * @callback
 *
 * @param {object} element - The DOM element which style is to be changed
 */
var flushStyles = function(element) {

    if (1 < $.trim(element.dataset.filters).split(' ').length) {
        $(element).parent().attr('class', 'btn btn-mixed');
    } else {
        $(element).parent().attr('class', 'btn btn-' + $.trim(element.dataset.filters));
    }

    contextualFilters = [];
    $('#filters ul li').each(function(index) {
        if(!$(this).hasClass('disabled')){
            contextualFilters.push($('a', $(this)).attr('id'));
        }
    });
}

/**
 * Fill projects DATA items into #projects ul li DOM list
 * Add a click handler
 *
 */
var fillProjects = function() {
    for (var i=0;i<DATA.length;i++){
        var tags = DATA[i].tags.join(' ');
        var cssClass = 'btn-' + tags;
        if(1 < DATA[i].tags.length){
            cssClass = "btn-mixed";
        }
        var elem = '<li class="btn ' + cssClass + '"><a';
        elem += ' data-filters="' + tags + '"';
        elem += ' data-tags="' + tags + '"';
        elem += ' id="' + DATA[i].id + '"';
        elem += ' class="' + tags + '"';
        elem += ' href="#">' + DATA[i].nom + '</a></li>';
        $('#projects ul').append(elem);
    }

    // click handler
    $('#projects ul li a').on('click', function(e){
        e.preventDefault();
        console.log("OPERATION CLICKED: " + $(this).attr('id')  + ' | tags: ' + $(this).attr('class'));
    });
}

