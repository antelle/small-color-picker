/**
 * @license SmallColorPicker | (c) 2013 Antelle | https://github.com/antelle/small-color-picker/blob/master/MIT-LICENSE.txt
 */

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(function($, document, window, undefined) {

    "use strict";

    window.SmallColorPicker = window.SmallColorPicker || {};

    var JQUERY_DATA_PROP_NAME = "scp";
    var JQUERY_DATA_PROP_NAME_COLOR = "scp-col";

    /**
     * Proxy class for grouping calls with jQuery object.
     * @param {jQuery} els - jQuery elements collection
     * @constructor
     */
    SmallColorPicker.Proxy = function(els) {
        this.els = els;
    };
    SmallColorPicker.Proxy.prototype = (function() {
        function getPicker(el) {
            return $(el).data("scp");
        }
        function each(els, fn) {
            var processed = [];
            els.each(function() {
                var picker = getPicker(this);
                if (!picker)
                    return true;
                var isProcessed = false;
                $.each(processed, function(ix, p) {
                    if (p === picker) {
                        isProcessed = true;
                        return false;
                    }
                    return true;
                });
                if (isProcessed)
                    return true;
                processed.push(picker);
                return fn.call(picker);
            });
        }
        return {
            constructor: SmallColorPicker.Proxy,
            show: function() {
                each(this.els, function() { this.show(); });
                return this;
            },
            hide: function() {
                each(this.els, function() { this.hide(); });
                return this;
            },
            toggle: function(visible) {
                each(this.els, function() { this.toggle(visible); });
                return this;
            },
            isVisible: function() {
                var result = false;
                each(this.els, function() {
                    if (this.isVisible()) {
                        //noinspection JSUnusedAssignment
                        result = true;
                        return false;
                    }
                    result = false;
                    return true;
                });
                return result;
            },
            switchMode: function(mode) {
                each(this.els, function() { this.switchMode(mode); });
                return this;
            },
            setColors: function(color, oldColor) {
                each(this.els, function() { this.setColors(color, oldColor); });
                return this;
            },
            parent: function(parent) {
                return this.els.length ? getPicker(this.els[0]).parent(parent) : null;
            },
            destroy: function() {
                each(this.els, function() { this.destroy(); });
                this.els.each(function() { $(this).removeData(JQUERY_DATA_PROP_NAME); });
                return this;
            }
        }
    })();

    /**
     * Determines whether the element is color button.
     */
    function isColorBtn(el) {
        return $(el).hasClass("color-btn");
    }

    /**
     * Gets element color from DOM.
     */
    function getElementColor(el) {
        if (isColorBtn(el)) {
            return $(el).find("b:first").css("background-color");
        }
        return $(el).data(JQUERY_DATA_PROP_NAME_COLOR);
    }

    /**
     * Sets element color in DOM.
     */
    function setElementColor(el, color) {
        if (isColorBtn(el)) {
            $(el).find("b").css("background-color", color).end();
            var lastContent = $(el).contents().last();
            var text = lastContent.text();
            if (text.length && text.charAt(0) == "#") {
                lastContent.remove();
                $(el).append(color);
            }
        }
        $(el).data(JQUERY_DATA_PROP_NAME_COLOR, color);
    }

    /**
     * Initializes SmallColorPicker or gets created SmallColorPicker.CirclePicker object.
     * @param {object} [opts] - Options: options object to create color picker; null to get call its methods
     * @returns {jQuery|SmallColorPicker.Proxy} - jQuery object in case the picker is created; callable proxy otherwise
     */
    $.fn.smallColorPicker = function(opts) {
        if (opts === undefined || !this.length)
            return new SmallColorPicker.Proxy(this);
        if (!opts.placement || opts.placement.popup) {
            var elOpts = $.extend(true, {}, opts, { placement: { parent: this[0] } });
            var popupPicker = new SmallColorPicker.CirclePicker(elOpts);
            $(this).data(JQUERY_DATA_PROP_NAME, popupPicker);
            this.on({
                click: function() {
                    if (popupPicker.parent()[0] === this && popupPicker.isVisible()) {
                        popupPicker.hide();
                    } else {
                        var color = getElementColor(this);
                        popupPicker.parent(this);
                        popupPicker.setColors(color, color);
                        popupPicker.switchMode(SmallColorPicker.Mode.COLOR);
                        popupPicker.show();
                    }
                },
                scp_ok: function(e, color) {
                    setElementColor(this, color);
                }
            });
            return this;
        } else {
            // static positioning: add picker to each element
            return this.each(function() {
                var elOpts = $.extend(true, {}, opts, { placement: { parent: this } });
                var picker = new SmallColorPicker.CirclePicker(elOpts);
                $(this).data(JQUERY_DATA_PROP_NAME, picker);
            });
        }
    };

})(window.jQuery, document, window);
