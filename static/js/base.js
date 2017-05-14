(function (interact) {

    'use strict';

    var sourceTypes = {
        SHARE : 0,
        SHARE_WITH_CI : 1,
        INTEGER : 2
    };

    var sourceType = 0;

    var calculate = function($dropzone) {
        var children = $dropzone.data('x');

        if (children != undefined) {
            if (sourceType == sourceTypes.SHARE) {
                var share = 0.0;
                for (var key in children) {
                    if (children.hasOwnProperty(key)) {
                        share += parseFloat(children[key].getAttribute('data-share'));
                    }
                }
                $dropzone.html(share.toFixed(1).toString().replace('.', ',') + ' %');
            } else if (sourceType == sourceTypes.SHARE_WITH_CI) {
                var share = 0.0;
                for (var key in children) {
                    if (children.hasOwnProperty(key)) {
                        share += parseFloat(children[key].getAttribute('data-share'));
                    }
                }
                $dropzone.html(share.toFixed(1).toString().replace('.', ',') + ' %');
            } else if (sourceType == sourceTypes.INTEGER) {
                console.log('calculate integer')
                var members = 0;
                for (var key in children) {
                    if (children.hasOwnProperty(key)) {
                        members += parseInt(children[key].getAttribute('data-members'));
                    }
                }
                $dropzone.html(members.toString() + ' ledamöter');
            } else {
            }
        }
    };

    var loadPsu = function() {
        console.log('load psu');
        sourceType = 1;
        jQuery.getJSON('/static/json/scb_psu_2016.json', function(data) {
            $.each(data.parties, function(party, obj) {
                var $draggable = $('.draggable#' + party);
                $draggable.attr('data-share', obj['share']);
                var $bar = $draggable.children('.bar');
                $bar.html(parseFloat(obj['share']).toFixed(1).toString().replace('.',','));
                $bar.css('height', 40 + Math.round(obj['share'] * 1.5));
            });
        });
    };

    var loadRiksdag = function() {
        console.log('load rd');
        sourceType = 2;
        jQuery.getJSON('/static/json/riksdagen.json', function(data) {
            $.each(data.parties, function(party, obj) {
                var $draggable = $('.draggable#' + party);
                $draggable.attr('data-members', parseInt(obj['members']));
                var $bar = $draggable.children('.bar');
                $bar.html(obj['members']);
                $bar.css('height', 40 + Math.round(obj['members'] * 0.5));
            });
        });
    };

/*    var loadNovus = function() {
        console.log('load novus');
        sourceType = 0;
        jQuery.getJSON('/static/json/novus.json', function(data) {
            $.each(data.parties, function(party, obj) {
                var $draggable = $('.draggable#' + party);
                $draggable.attr('data-share', parseInt(obj['share']));
                var $bar = $draggable.children('.bar');
                $bar.html(parseFloat(obj['share']).toFixed(1).toString().replace('.',','));
                $bar.css('height', 40 + Math.round(obj['share'] * 1.5));
            });
        });
    };
    */
    var loadTns = function() {
        console.log('load tns');
        sourceType = 0;
        jQuery.getJSON('/static/json/tns-sifo.json', function(data) {
            $.each(data.parties, function(party, obj) {
                var $draggable = $('.draggable#' + party);
                $draggable.attr('data-share', parseInt(obj['share']));
                var $bar = $draggable.children('.bar');
                $bar.html(parseFloat(obj['share']).toFixed(1).toString().replace('.',','));
                $bar.css('height', 40 + Math.round(obj['share'] * 1.5));
            });
        });
    };

    $('input[name=source]:radio').change(function() {
        var val = $(this).val();
        if (val == 'psu') {
            loadPsu();
        } else if (val == 'rd') {
            loadRiksdag();
        } else if (val == 'tns') {
            loadTns();
        } else {
            console.log('invalid val: ' + val);
        }
        calculate($('#block1'));
        calculate($('#block2'));
    });

    var transformProp;

    interact.maxInteractions(Infinity);

    // setup draggable elements.
    interact('.js-drag')
        .draggable({ max: Infinity })
        .on('dragstart', function (event) {
            event.interaction.x = parseInt(event.target.getAttribute('data-x'), 10) || 0;
            event.interaction.y = parseInt(event.target.getAttribute('data-y'), 10) || 0;
        })
        .on('dragmove', function (event) {
            event.interaction.x += event.dx;
            event.interaction.y += event.dy;

            if (transformProp) {
                event.target.style[transformProp] =
                    'translate(' + event.interaction.x + 'px, ' + event.interaction.y + 'px)';
            }
            else {
                event.target.style.left = event.interaction.x + 'px';
                event.target.style.top  = event.interaction.y + 'px';
            }
        })
        .on('dragend', function (event) {
            event.target.setAttribute('data-x', event.interaction.x);
            event.target.setAttribute('data-y', event.interaction.y);
        });

    // setup drop areas.
    // dropzone #1 accepts draggable #1
    setupDropzone('#block1', '#c, #l, #m, #kd, #s, #v, #mp, #sd');
    // dropzone #2 accepts draggable #1 and #2
    setupDropzone('#block2', '#c, #l, #m, #kd, #s, #v, #mp, #sd');

    /**
     * Setup a given element as a dropzone.
     *
     * @param {HTMLElement|String} el
     * @param {String} accept
     */
    function setupDropzone(el, accept) {
        interact(el)
            .dropzone({
                accept: accept,
                ondropactivate: function (event) {
                    addClass(event.relatedTarget, '-drop-possible');
                },
                ondropdeactivate: function (event) {
                    removeClass(event.relatedTarget, '-drop-possible');
                }
            })
            .on('dropactivate', function (event) {
                var active = event.target.getAttribute('active')|0;
                if (active === 0) {
                    addClass(event.target, '-drop-possible');
                }

                event.target.setAttribute('active', active + 1);
            })
            .on('dropdeactivate', function (event) {
                var active = event.target.getAttribute('active')|0;

                // change style if it was previously active
                // but will no longer be active
                if (active === 1) {
                    removeClass(event.target, '-drop-possible');
                }

                event.target.setAttribute('active', active - 1);
            })
            .on('dragenter', function (event) {
                addClass(event.target, '-drop-over');
            })
            .on('dragleave', function (event) {
                var $dropzone = $(event.target);
                var children = $dropzone.data('x') == undefined ? {} : $dropzone.data('x');
                delete children[event.relatedTarget.getAttribute('id')];
                $dropzone.data('x', children);
                removeClass(event.target, '-drop-over');
                calculate($dropzone);
            })
            .on('drop', function (event) {
                removeClass(event.target, '-drop-over');
                var $dropzone = $(event.target);
                var children = $dropzone.data('x') == undefined ? {} : $dropzone.data('x');
                children[event.relatedTarget.getAttribute('id')] = event.relatedTarget;
                $dropzone.data('x', children);
                calculate($dropzone);
            });
    }

    function addClass (element, className) {
        if (element.classList) {
            return element.classList.add(className);
        }
        else {
            element.className += ' ' + className;
        }
    }

    function removeClass (element, className) {
        if (element.classList) {
            return element.classList.remove(className);
        }
        else {
            element.className = element.className.replace(new RegExp(className + ' *', 'g'), '');
        }
    }

    interact(document).on('ready', function () {
        transformProp = 'transform' in document.body.style
            ? 'transform': 'webkitTransform' in document.body.style
            ? 'webkitTransform': 'mozTransform' in document.body.style
            ? 'mozTransform': 'oTransform' in document.body.style
            ? 'oTransform': 'msTransform' in document.body.style
            ? 'msTransform': null;
    });

    loadRiksdag();

}(window.interact));