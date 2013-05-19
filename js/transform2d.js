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
    SmallColorPicker.Transforms = {};

    /**
     * 2D affine transform.
     * @param {number[][]} matrix - Transformation matrix with 2x3 elements
     * @constructor
     */
    SmallColorPicker.Transforms.Transform2D = function(matrix) {
        this.matrix = matrix;
        this.next = null;
    };
    SmallColorPicker.Transforms.Transform2D.prototype = {
        constructor: SmallColorPicker.Transforms.Transform2D,

        /**
         * Applies the transform against point. If there are any chained transforms, applies them also.
         * @param {number[]} pt - Point ([x, y])
         * @returns {number[]} - Result point ([x, y])
         */
        apply: function(pt) {
            var result = [
                this.matrix[0][0]*pt[0] + this.matrix[0][1]*pt[1] + this.matrix[0][2],
                this.matrix[1][0]*pt[0] + this.matrix[1][1]*pt[1] + this.matrix[1][2]
            ];
            return this.next ? this.next.apply(result) : result;
        },

        /**
         * Adds another transform to the end of transforms chain.
         * @param {SmallColorPicker.Transforms.Transform2D} transform
         * @returns {SmallColorPicker.Transforms.Transform2D} - this
         */
        chain: function(transform) {
            if (this.next)
                this.next.chain(transform);
            else
                this.next = transform;
            return this;
        }
    };

    /**
     * Translation transform.
     * @param {number} dx - X axis offset
     * @param {number} dy - Y axis offset
     * @constructor
     */
    SmallColorPicker.Transforms.Translate2D = function(dx, dy) {
        SmallColorPicker.Transforms.Transform2D.call(this, [[1, 0, dx], [0, 1, dy]]);
    };
    SmallColorPicker.Transforms.Translate2D.prototype = new SmallColorPicker.Transforms.Transform2D;
    SmallColorPicker.Transforms.Translate2D.prototype.constructor = SmallColorPicker.Transforms.Translate2D;

    /**
     * Rotation transform.
     * @param {number} angle - Rotation angle (rad)
     * @constructor
     */
    SmallColorPicker.Transforms.Rotate2D = function(angle) {
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        SmallColorPicker.Transforms.Transform2D.call(this, [[cos, -sin, 0], [sin, cos, 0]]);
    };
    SmallColorPicker.Transforms.Rotate2D.prototype = new SmallColorPicker.Transforms.Transform2D;
    SmallColorPicker.Transforms.Rotate2D.prototype.constructor = SmallColorPicker.Transforms.Translate2D;

})(window.jQuery, document, window);
