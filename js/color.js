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

    /**
     * Color convertible to different formats.
     * @param {string|number} [val] - Hex or rgb color value
     * @constructor
     */
    SmallColorPicker.Color = function(val) {
        this.val = 0;
        if (typeof val === "number") {
            this.val = val;
        } else if (typeof val == "string") {
            if (val.charAt(0) === "#") {
                this.val = parseInt(val.substr(1), 16);
            } else {
                var match = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)/g.exec(val);
                if (!match) {
                    throw "Invalid color: " + val;
                }
                this.setRgb(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
            }
        }
    };

    SmallColorPicker.Color.prototype = {
        constructor: SmallColorPicker.Color,
        /**
         * Gets or sets red value.
         * @param {number} [r]
         * @returns {number}
         */
        r: function(r) {
            if (r !== undefined) {
                this.val = this.val & 0x00ffff | r << 16;
                return r;
            }
            return this.val >> 16 & 255;
        },
        /**
         * Gets or sets green value.
         * @param {number} [g]
         * @returns {number}
         */
        g: function(g) {
            if (g !== undefined) {
                this.val = this.val & 0xff00ff | g << 8;
                return g;
            }
            return this.val >> 8 & 255;
        },
        /**
         * Gets or sets blue value.
         * @param {number} [b]
         * @returns {number}
         */
        b: function(b) {
            if (b !== undefined) {
                this.val = this.val & 0xffff00 | b;
                return b;
            }
            return this.val & 255;
        },
        /**
         * Converts color to HTML hex representation, e.g. #00ffcc.
         * @returns {string}
         */
        toHex: function() {
            var str = ("00000" + this.val.toString(16)).substr(-6);
            return "#" + str;
        },
        /**
         * Converts color to rgb components.
         * @returns {{r: number, g: number, b: number}}
         */
        toRgb: function() {
            return { r: this.r(), g: this.g(), b: this.b() };
        },
        /**
         * Converts color to HTML rgb represenration, e.g. rgb(0, 100, 255)
         * @returns {string}
         */
        toRgbStr: function() {
            return "rgb(" + this.r() + "," + this.g() + "," + this.b() + ")";
        },
        /**
         * Sets color rgb components.
         * @param {number} r
         * @param {number} g
         * @param {number} b
         * @returns {SmallColorPicker.Color} - this
         */
        setRgb: function(r, g, b) {
            this.r(r);
            this.g(g);
            this.b(b);
            return this;
        },
        /**
         * Converts color to hsv components.
         * @returns {{h: number, s: number, v: number}}
         */
        toHsv: function() {
            var r = this.r(), g = this.g(), b = this.b();
            var min = Math.min(r, g, b), max = Math.max(r, g, b),
                delta = max - min,
                h, s, v;

            v = Math.floor(max/255 * 100);
            if (max == 0) return { h: 0, s: 0, v: 0 };
            s = Math.floor(delta/max * 100);
            var deltadiv = delta == 0 ? 1 : delta;
            if (r == max) h = (g - b)/deltadiv;
            else if (g == max) h = 2 + (b - r)/deltadiv;
            else h = 4 + (r - g)/deltadiv;
            h = Math.floor(h * 60);
            if (h < 0) h += 360;
            return { h: h, s: s, v: v };
        },
        /**
         * Sets color hsv components.
         * @param {number} h
         * @param {number} s
         * @param {number} v
         * @returns {SmallColorPicker.Color} - this
         */
        setHsv: function(h, s, v) {
            h = h/360;
            s = s/100;
            v = v/100;
            
            if (s == 0) {
                var val = Math.round(v * 255);
                this.r(val);
                this.g(val);
                this.b(val);
                return this;
            }
            var hPos = h*6;
            var hPosBase = Math.floor(hPos);
            var base1 = v*(1 - s);
            var base2 = v*(1 - s*(hPos - hPosBase));
            var base3 = v*(1 - s*(1 - (hPos - hPosBase)));
            var r, g, b;
            if (hPosBase == 0) { r = v; g = base3; b = base1; }
            else if (hPosBase == 1) { r = base2; g = v; b = base1; }
            else if (hPosBase == 2) { r = base1; g = v; b = base3; }
            else if (hPosBase == 3) { r = base1; g = base2; b = v; }
            else if (hPosBase == 4) { r = base3; g = base1; b = v; }
            else { r = v; g = base1; b = base2; }

            this.r(Math.round(r*255));
            this.g(Math.round(g*255));
            this.b(Math.round(b*255));

            return this;
        },
        /**
         * Gets or sets color hue
         * @param {number} [hue]
         * @returns {number}
         */
        hue: function(hue) {
            if (hue !== undefined) {
                var hsv = this.toHsv();
                this.setHsv(hue, hsv.s, hsv.v);
                return this;
            }
            return this.toHsv().h;
        },
        /**
         * Gets color perceived brightness based of rgb components.
         * @returns {number} - Perceived brightness value, 0..255
         */
        getPerceivedBrightness: function() {
            var rgb = this.toRgb();
            return Math.sqrt(rgb.r*rgb.r*.241 + rgb.g*rgb.g*.691 + rgb.b*rgb.b*.068);
        }
    };

})(window.jQuery, document, window);
