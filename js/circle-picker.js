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
     * Enum for color picker mode.
     * @readonly
     * @enum {number}
     */
    SmallColorPicker.Mode = {
        /** Graphical color selection */
        COLOR: 1,
        /** Text color selection/view */
        NUMBER: 2
    };

    /**
     * ColorPicker default options.
     */
    SmallColorPicker.defaults = {
        placement: {
            position: "absolute",
            top: "0",
            left: "0",
            parent: null,
            popup: false
        },
        colors: {
            colorOld: null,
            colorNew: "#ff0000"
        },
        texts: {
            ok: "OK",
            cancel: "Cancel",
            switchModeToNum: "Show numbers",
            switchModeToCol: "Show color wheel"
        },
        behavior: {
            rotate: true,
            hideOnSelect: true,
            mode: SmallColorPicker.Mode.COLOR,
            switchMode: true
        },
        events: {
            ok: null,
            cancel: null
        }
    };

    /**
     * Circle color picker.
     * @param opts - Options, see SmallColorPicker.defaults as example
     * @constructor
     */
    SmallColorPicker.CirclePicker = function(opts) {
        var _opts = $.extend(true, {}, SmallColorPicker.defaults, opts);
        var _color = new SmallColorPicker.Color(_opts.colors.colorNew);
        var _colorOld = new SmallColorPicker.Color(_opts.colors.colorOld);
        var _dom;
        var _domProps;
        var _canvas;
        var _parent = _opts.placement.parent ? $(_opts.placement.parent) : null;
        var _mode = _opts.behavior.mode;
        var _id = ~~(Math.random() * 10000);
        var _squareRotation = 0;
        var _transforms = {};
        var _lastUserSquareX, _lastUserSquareY;
        var _browserFeatures;
        var _resizeTimeout;

        /**
         * Initializes color picker before first control show.
         */
        function initialize() {
            detectBrowserFeatures();
            assertBrowserIsSupported();
            createElements();
            bindEvents();
            getStyleProps();
        }

        /**
         * Detects browser features.
         */
        function detectBrowserFeatures() {
            _browserFeatures = {
                // Safari has a bug: elements positioned above the canvas are not redrawn without forcing them to do it
                // Disable this in other browsers for speed acceleration
                redrawBug: navigator.userAgent.indexOf("Safari") != -1,
                // Firefox cannot rotate canvas directly: it renders jagged edges (because of empty subpixels outside?)
                // Other browsers antialias edges and perform canvas rotation faster than converting to dataimg and transforming it
                directCanvasRotate: navigator.userAgent.indexOf("Firefox") == -1,
                borderRadius: "borderRadius" in document.body.style
            };
        }

        /**
         * Asserts we can use color picker.
         * @throws {string} Will throw an error if the browser is not supported
         */
        function assertBrowserIsSupported() {
            if (!_browserFeatures.borderRadius) {
                throw "Browser is not supported";
            }
        }

        /**
         * Sets correct element position if the picker is displayed in popup.
         */
        function setPosition() {
            if (!_opts.placement.popup || !_parent)
                return;
            if (_resizeTimeout) {
                clearTimeout(_resizeTimeout);
                _resizeTimeout = null;
            }
            var parentPosition = _parent.position(), parentWidth = _parent.outerWidth(), parentHeight = _parent.outerHeight(),
                windowHeight = $(window).outerHeight(), windowWidth = $(window).width(),
                width = _dom.el.outerWidth(), height = _dom.el.outerHeight(),
                paddingToPageBorder = 10, innerArrowPadding = 1, smallPadding = 1,
                arrowSize = 15,
                offset = {}, arrowOffset = {}, arrowInnerOffset = {};

            var spaceAbove = parentPosition.top - $(window).scrollTop();
            var spaceBelow = windowHeight - parentHeight - spaceAbove;
            var spaceLeft = parentPosition.left - $(window).scrollLeft();
            var spaceRight = windowWidth - parentWidth - spaceLeft;

            if (Math.max(spaceAbove, spaceBelow) > height + paddingToPageBorder && Math.min(spaceLeft, spaceRight) > width/2 - parentWidth/2 + paddingToPageBorder) {
                offset.left = parentPosition.left + parentWidth/2 - width/2;
                arrowOffset.left = width/2 - arrowSize;
                arrowInnerOffset.left = -arrowSize;
                if (spaceAbove > spaceBelow) {
                    offset.top = parentPosition.top - height - arrowSize + 3;
                    arrowOffset.top = height - 2;
                    arrowInnerOffset.top = -arrowSize - innerArrowPadding;
                    setArrowBorders("top", arrowSize);
                } else {
                    offset.top = parentPosition.top + parentHeight + smallPadding + arrowSize;
                    arrowOffset.top = -arrowSize;
                    arrowInnerOffset.top = innerArrowPadding;
                    setArrowBorders("bottom", arrowSize);
                }
            } else {
                offset.top = parentPosition.top + parentHeight/2 - height/2;
                arrowOffset.top = height/2 - arrowSize;
                arrowInnerOffset.top = -arrowSize;
                if (spaceLeft > spaceRight) {
                    offset.left = parentPosition.left - width - arrowSize + 2;
                    arrowOffset.left = width - 1;
                    arrowInnerOffset.left = -arrowSize - innerArrowPadding;
                    setArrowBorders("left", arrowSize);
                } else {
                    offset.left = parentPosition.left + parentWidth + smallPadding + arrowSize;
                    arrowOffset.left = -arrowSize;
                    arrowInnerOffset.left = innerArrowPadding;
                    setArrowBorders("right", arrowSize);
                }
            }
            _dom.el.css(offset);
            _dom.arrow.css(arrowOffset);
            _dom.arrowInner.css(arrowInnerOffset);
        }

        /**
         * Turns arrow by adjusting border heights.
         * @param {string} placement - Arrow placement
         * @param {number} arrowSize - Arrow size
         */
        function setArrowBorders(placement, arrowSize) {
            var color = _dom.arrow.css("color");
            var innerColor = _dom.arrowInner.css("color");
            var opposite;
            switch (placement) {
                case "top":
                    opposite = "bottom";
                    break;
                case "bottom":
                    opposite = "top";
                    break;
                case "left":
                    opposite = "right";
                    break;
                case "right":
                    opposite = "left";
                    break;
            }
            $.each(["top", "right", "bottom", "left"], function(ix, pos) {
                var prop = "border-" + pos;
                var borderColor = pos == placement ? color : "transparent";
                var border = pos == opposite ? "none" : arrowSize + "px solid " + borderColor;
                _dom.arrow.css(prop, border);

                borderColor = pos == placement ? innerColor : "transparent";
                border = pos == opposite ? "none" : arrowSize + "px solid " + borderColor;
                _dom.arrowInner.css(prop, border);
            });
        }

        /**
         * Created DOM elements.
         * Initializes _dom variable.
         */
        function createElements() {
            _dom = {};
            createElementsForSelf();
            if (_opts.placement.popup) {
                createElementsForPopup();
            }
            createElementsForColorWheel();
            createElementsForNumbersMode();
            createElementsForSamples();
            createElementsForControls();
        }

        /**
         * Creates main element.
         */
        function createElementsForSelf() {
            _dom.el =
                $("<div></div>")
                    .appendTo(_opts.placement.popup || !_parent ? document.body : _parent)
                    .addClass("s-c-p")
                    .css({
                        position: _opts.placement.position,
                        left: _opts.placement.left,
                        top: _opts.placement.top
                    });
            if (_dom.el.css("position") == "static")
                _dom.el.css("position", "relative");
        }

        /**
         * Creates popup controls: arrows and container.
         */
        function createElementsForPopup() {
            _dom.el.css("position", "absolute");
            _dom.el.addClass("s-c-p-popup");
            _dom.arrow = $("<div></div>")
                .appendTo(_dom.el)
                .addClass("s-c-p-arrow");
            _dom.arrowInner = $("<div></div>")
                .appendTo(_dom.arrow)
                .addClass("s-c-p-arrow-inner");
        }

        /**
         * Creates controls for color wheel mode.
         */
        function createElementsForColorWheel() {
            _dom.circle = $("<div></div>")
                .appendTo(_dom.el)
                .addClass("s-c-p-circle");
            $("<div></div>")
                .appendTo(_dom.circle)
                .addClass("s-c-p-circle-inner");
            _dom.circleMark = $("<div></div>")
                .appendTo(_dom.circle)
                .addClass("s-c-p-circle-mark");
            _dom.square = $(_browserFeatures.directCanvasRotate ? "<canvas></canvas>" : "<img/>")
                .appendTo(_dom.el)
                .addClass("s-c-p-square");
            _dom.squareMark = $("<div></div>")
                .appendTo(_dom.el)
                .addClass("s-c-p-square-mark");
            if (_browserFeatures.directCanvasRotate) {
                _canvas = _dom.square[0];
            } else {
                _canvas = $("<canvas></canvas>").appendTo(_dom.el).hide()[0];
            }
            var canvasSize = Math.min(_dom.square.width(), 100);
            $(_canvas).attr({ width: canvasSize, height: canvasSize });
        }

        /**
         * Creates controls for number mode.
         */
        function createElementsForNumbersMode() {
            var textsEl = $("<div></div>")
                .appendTo(_dom.el)
                .addClass("s-c-p-color-texts");
            $.each({ rgb: ["r", "g", "b"], hsv: ["h", "s", "b"] }, function(prop, colors) {
                var columnEl = $("<div></div>")
                    .appendTo(textsEl)
                    .addClass("s-c-p-column");
                $.each(colors, function(j, col) {
                    var div = $("<div></div>")
                        .appendTo(columnEl)
                        .addClass("s-c-p-row");
                    $("<label></label>")
                        .appendTo(div)
                        .attr("for", "s-c-p-txt-" + _id + "-" + prop + "-" + col)
                        .text(col.toUpperCase() + ":");
                    var max = prop == "rgb" ? 255 : col == "h" ? 360 : 100;
                    $("<input/>")
                        .attr({ id: "s-c-p-txt-" + _id + "-" + prop + "-" + col, type: "text", maxLength: 3, autocomplete: "off",
                            "data-prop": prop, "data-col": col, "data-min": 0, "data-max": max })
                        .appendTo(div);
                });
            });
            var div = $("<div></div>")
                .appendTo(textsEl)
                .addClass("s-c-p-row-full");
            $("<input/>")
                .attr({ id: "s-c-p-txt-" + _id + "-hex", type: "text", maxLength: 24, autocomplete: "off" })
                .appendTo(div);
        }

        /**
         * Creates controls for color samples and captions.
         */
        function createElementsForSamples() {
            _dom.colorOld = $("<div></div>")
                .appendTo(_dom.el)
                .addClass("s-c-p-color s-c-p-color-old");
            _dom.colorNew = $("<div></div>")
                .appendTo(_dom.el)
                .addClass("s-c-p-color s-c-p-color-new");
            _dom.sampleOld = $("<div></div>")
                .appendTo(_dom.el)
                .addClass("s-c-p-sample s-c-p-sample-old")
                .text(_opts.texts.cancel);
            _dom.sampleNew = $("<div></div>")
                .appendTo(_dom.el)
                .addClass("s-c-p-sample s-c-p-sample-new")
                .text(_opts.texts.ok);
        }

        /**
         * Creates controls mode switching.
         */
        function createElementsForControls() {
            if (_opts.behavior.switchMode) {
                _dom.modeSwitch = $("<div></div>")
                    .appendTo(_dom.el)
                    .addClass("s-c-p-mode-switch");
            }
        }

        /**
         * Fills properties from DOM elements. Used to cache them, should be called each time after element is shown.
         */
        function getStyleProps() {
            _domProps = {
                globalSelectionMode: $(document.body).css("user-select"),
                squareWidth: _dom.square.width(),
                circleWidth: _dom.circle.width(),
                elWidth: _dom.el.width()
            }
        }

        /**
         * Binds events to DOM elements.
         */
        function bindEvents() {
            _dom.circle.on("mousedown", handleCircleMouseDown);
            _dom.square
                .on("mousedown", handleSquareMouseDown)
                .on("selectstart", function(e) { e.preventDefault(); });
            _dom.sampleNew.click(function() {
                if (_opts.behavior.hideOnSelect) {
                    hide();
                    _colorOld = _color;
                }
                if (_opts.events.ok)
                    _opts.events.ok(_color.toHex());
            });
            _dom.sampleOld.click(function() {
                if (_opts.behavior.hideOnSelect)
                    hide();
                if (_opts.events.cancel)
                    _opts.events.cancel(_colorOld.toHex());
            });
            if (_opts.placement.popup && _parent) {
                $(window).resize(handleWindowResized);
            }
            if (_dom.modeSwitch) {
                _dom.modeSwitch.click(function() {
                    switchMode();
                });
            }
            $(".s-c-p-row input", _dom.el)
                .focus(function() {
                    $(this).data("oldval", +$(this).val());
                })
                .blur(function(e) {
                    var val = $(this).val();
                    var newVal = parseNumeric(val, +$(this).data("min"), +$(this).data("max"));
                    if (val !== newVal.toString()) {
                        $(this).val(isNaN(newVal) ? +$(this).data("oldval") : newVal);
                        handleNumericInputKeyup(e, true);
                    }
                })
                .keyup(function(e) {
                    handleNumericInputKeyup(e, false);
                });
            $("#s-c-p-txt-" + _id + "-hex", _dom.el)
                .focus(function() {
                    $(this).data("oldval", $(this).val());
                })
                .blur(function(e) {
                    var val = $(this).val();
                    var newVal = parseColor(val);
                    if (val !== newVal) {
                        $(this).val(newVal || $(this).data("oldval"));
                        handleHexInputKeyup(e, true);
                    }
                })
                .keyup(function(e) {
                    handleHexInputKeyup(e, false);
                });
        }

        /**
         * User clicked on circle: begin changing color hue.
         * @param e
         */
        function handleCircleMouseDown(e) {
            e.preventDefault();
            processCircleColorChangeEvent(e.pageX, e.pageY);
            toggleGlobalSelection(false);
            $(document)
                .on("mousemove", handleDocumentMouseMoveForCircle)
                .one("mouseup", handleDocumentMouseUp);
        }

        /**
         * User clicked on square: begins changing color saturation and value.
         * @param e
         */
        function handleSquareMouseDown(e) {
            e.preventDefault();
            processSquareColorChangeEvent(e.pageX, e.pageY);
            toggleGlobalSelection(false);
            $(document)
                .on("mousemove", handleDocumentMouseMoveForSquare)
                .one("mouseup", handleDocumentMouseUp);
        }

        /**
         * Mouse is moved in hue changing mode.
         * @param e
         */
        function handleDocumentMouseMoveForCircle(e) {
            processCircleColorChangeEvent(e.pageX, e.pageY);
        }

        /**
         * Mouse is moved in saturation-value changing mode.
         * @param e
         */
        function handleDocumentMouseMoveForSquare(e) {
            processSquareColorChangeEvent(e.pageX, e.pageY);
        }

        /**
         * Mouse is up: finishes color change.
         */
        function handleDocumentMouseUp() {
            toggleGlobalSelection(true);
            $(document)
                .off("mousemove", handleDocumentMouseMoveForCircle)
                .off("mousemove", handleDocumentMouseMoveForSquare);
        }

        /**
         * Adjusts popup placement when window is resized.
         */
        function handleWindowResized() {
            if (isVisible() && _opts.placement.popup && !_resizeTimeout) {
                _resizeTimeout = setTimeout(setPosition, 100);
            }
        }

        /**
         * Handles keyup in numeric text box (rgb, hsv). Updates other text boxes
         * @param {object} e - Event
         * @param {boolean} force - Force update fields, even if the value has not changed from old one
         */
        function handleNumericInputKeyup(e, force) {
            var el = $(e.target);
            var val = parseNumeric(el.val(), +el.data("min"), +el.data("max"));
            if (isNaN(val)) {
                val = el.data("oldval");
            } else if (!force && val == el.data("oldval")) {
                return;
            }
            var prop = el.data("prop");
            var col = el.data("col");
            var color = new SmallColorPicker.Color();
            switch (prop) {
                case "rgb":
                    var rgb = readNumericRgb();
                    rgb[col] = val;
                    color.setRgb(rgb.r, rgb.g, rgb.b);
                    break;
                case "hsv":
                    var hsv = readNumericHsv();
                    hsv[col == "b" ? "v" : col] = val;
                    color.setHsv(hsv.h, hsv.s, hsv.v);
                    break;
            }
            if (_color.val == color.val)
                return;
            _color = color;
            displayNumericHex();
            if (prop == "rgb")
                displayNumericHsv();
            else
                displayNumericRgb();
            displayNewColorSample();
        }

        /**
         * Handles keyup in hex text box. Updates numeric text boxes
         * @param {object} e - Event
         * @param {boolean} force - Force update fields, even if the value has not changed from old one
         */
        function handleHexInputKeyup(e, force) {
            var el = $(e.target);
            var val = parseColor(el.val());
            if (!val) {
                val = el.data("oldval");
            } else if (!force && val == el.data("oldval")) {
                return;
            }
            var color = new SmallColorPicker.Color(val);
            if (_color.val == color.val)
                return;
            _color = color;
            displayNumericHsv();
            displayNumericRgb();
            displayNewColorSample();
        }

        /**
         * Processes color hue change.
         * @param {number} x - PageX
         * @param {number} y - PageY
         */
        function processCircleColorChangeEvent(x, y) {
            var offs = _dom.circle.offset();
            var hue = getHueByCircleCoords(x - offs.left, y - offs.top);
            _color.hue(hue);
            var baseColor = new SmallColorPicker.Color().setHsv(hue, 100, 100);
            displaySquareColor(baseColor.toHex());
            displayNewColorSample();
            moveCircleMark(hue);
            moveSquareMark();
        }

        /**
         * Processes color saturation-value change.
         * @param {number} x - PageX
         * @param {number} y - PageY
         */
        function processSquareColorChangeEvent(x, y) {
            if (!_transforms.fw) {
                var offs = _dom.circle.offset();
                var radius = _domProps.circleWidth/2;
                var squareSize = _domProps.squareWidth/2;

                _transforms.fw = new SmallColorPicker.Transforms.Translate2D(-offs.left - radius, -offs.top - radius);
                if (_opts.behavior.rotate)
                    _transforms.fw.chain(new SmallColorPicker.Transforms.Rotate2D(-_squareRotation));
                _transforms.fw.chain(new SmallColorPicker.Transforms.Translate2D(squareSize, squareSize));
            }
            var transformed = _transforms.fw.apply([x, y]);

            x = Math.max(0, Math.min(_domProps.squareWidth - 1, transformed[0]));
            y = Math.max(0, Math.min(_domProps.squareWidth - 1, transformed[1]));
            _color = getColorBySquareCoords(x, y);
            displayNewColorSample();
            moveSquareMark(x, y);
        }

        /**
         * Enables or disabled global text selection.
         * @param {boolean} enabled
         */
        function toggleGlobalSelection(enabled) {
            $(document.body).css({ webkitUserSelect: enabled ? _domProps.globalSelectionMode : "none" });
        }

        /**
         * Converts coordinates to color hue.
         * @param {number} x - X offset from circle left
         * @param {number} y - Y offset from circle top
         * @returns {number} - Calculated color hue
         */
        function getHueByCircleCoords(x, y) {
            var size = _domProps.circleWidth;
            x -= size/2;
            y -= size/2;
            var tg = Math.atan2(x, y);
            return 180 - tg/Math.PI/2*360;
        }

        /**
         * Converts coordinates to color, adjusting its saturation and value.
         * @param {number} x - X offset from square left
         * @param {number} y - Y offset from square top
         * @returns {SmallColorPicker.Color} - Color with calculated saturation and value.
         */
        function getColorBySquareCoords(x, y) {
            var ctx = _canvas.getContext("2d");
            var pix = ctx.getImageData(x, y, 1, 1).data;
            return new SmallColorPicker.Color().setRgb(pix[0], pix[1], pix[2]);
        }

        /**
         * Updates old color sample and description.
         */
        function displayOldColorSample() {
            _dom.colorOld[0].innerHTML = _colorOld === null ? "" : _colorOld.toHex();
            setSampleColor(_dom.sampleOld, _colorOld === null ? new SmallColorPicker.Color(0x999999) : _colorOld, "old")
        }

        /**
         * Updates new color sample and description.
         */
        function displayNewColorSample() {
            _dom.colorNew[0].innerHTML = _color.toHex() + "<br/>"; // for better text selection, we'll add a line break
            setSampleColor(_dom.sampleNew, _color, "new");
        }

        /**
         * Updates color sample and description.
         * @param {jQuery} el - Color sample element
         * @param {SmallColorPicker.Color} color - Sample color
         * @param {string} name - "new" or "old"; used to cache properties for speed
         */
        function setSampleColor(el, color, name) {
            var v = color.toHsv().v;
            el[0].style.backgroundColor = color.toHex();
            if (!_domProps.colorSamplesLight) {
                _domProps.colorSamplesLight = {};
            }
            if (v > 80) {
                if (_domProps.colorSamplesLight[name] !== true) {
                    _domProps.colorSamplesLight[name] = true;
                    el.addClass("s-c-p-light");
                }
            } else {
                if (_domProps.colorSamplesLight[name] !== false) {
                    _domProps.colorSamplesLight[name] = false;
                    el.removeClass("s-c-p-light");
                }
            }
        }

        /**
         * Draws gradient on square for selected color hue.
         * @param {string} baseColor - Base color HTML hex representation
         */
        function displaySquareColor(baseColor) {
            var col = new SmallColorPicker.Color(baseColor);
            var hue = col.hue();

            var size = _canvas.width;
            var ctx = _canvas.getContext("2d");
            ctx.clearRect(0, 0, size, size);
            
            var imageData = ctx.createImageData(size, size);
            var data = imageData.data;
            for (var s = 0; s < size; s++) {
                for (var v = 0; v < size; v++) {
                    col.setHsv(hue, Math.round(s*100/(size - 1)), Math.round(v*100/(size - 1)));
                    var offset = ((size - v - 1)*size + s)*4;
                    data[offset] = col.r();
                    data[offset + 1] = col.g();
                    data[offset + 2] = col.b();
                    data[offset + 3] = 255;
                }
            }
            ctx.putImageData(imageData, 0, 0);
            if (!_browserFeatures.directCanvasRotate) {
                _dom.square[0].src = _canvas.toDataURL();
            }
        }

        /**
         * Moves mark on circle to correspond color hue.
         * @param {number} [userHue] - Hue; if undefined, hue from _color will be used
         */
        function moveCircleMark(userHue) {
            var hue = userHue === undefined ? _color.hue() : userHue;
            var angle = hue/180*Math.PI;
            var width = _domProps.circleWidth;
            var angleOffset = 0.025;
            var attr = {
                transform: "rotate(" + angle + "rad)",
                left: width/2 - width*Math.sin(-angle + angleOffset)/2,
                top: width/2 - width*Math.cos(-angle + angleOffset)/2
            };
            _dom.circleMark.css(attr);
            _squareRotation = angle - Math.PI/4;
            _transforms = {};
            if (_opts.behavior.rotate)
                _dom.square.css({ transform: "rotate(" + _squareRotation + "rad)" });
        }

        /**
         * Moves mark on square to correspond color saturation and value.
         * Coordinates of user click are used to improve movement smoothness.
         * @param {number} [userX] - X coordinate of user click
         * @param {number} [userY] - Y coordinate of user click
         */
        function moveSquareMark(userX, userY) {
            var width = _domProps.squareWidth;
            var hsv = _color.toHsv();
            var x = 0;
            var y = 0;
            if (userX !== undefined)
                _lastUserSquareX = userX;
            if (userY !== undefined)
                _lastUserSquareY = userY;
            if (_lastUserSquareX !== undefined && _lastUserSquareY !== undefined /*&& hsv.s === 0 && hsv.v === 0*/) {
                x += _lastUserSquareX;
                y += _lastUserSquareY;
            } else {
                x += hsv.s*width/100;
                y += width - hsv.v*width/100;
                x = Math.max(0, Math.min(width - 1, x));
                y = Math.max(0, Math.min(width - 1, y));
            }

            if (!_transforms.rev) {
                var squareSize = _domProps.squareWidth/2;
                var elSize = _domProps.elWidth/2;

                _transforms.rev = new SmallColorPicker.Transforms.Translate2D(-squareSize, -squareSize);
                if (_opts.behavior.rotate)
                    _transforms.rev.chain(new SmallColorPicker.Transforms.Rotate2D(_squareRotation));
                _transforms.rev.chain(new SmallColorPicker.Transforms.Translate2D(elSize - 3, elSize - 3));
            }

            var transformed = _transforms.rev.apply([x, y]);

            var style = _dom.squareMark[0].style;
            style.left = transformed[0] + "px";
            style.top = transformed[1] + "px";
            adjustSquareMarkColor();
        }

        /**
         * Sets square mark color to dark or bright, based of perceived brightness of underlying pixels.
         * Used to ensure the square mark is dark on light pixels and vice versa.
         */
        function adjustSquareMarkColor() {
            var isLight = _color.getPerceivedBrightness() > 125;
            if (_domProps.isSqMaskLight === isLight)
                return;
            _domProps.isSqMaskLight = isLight;
            var borderColor = new SmallColorPicker.Color().setHsv(0, 0, isLight ? 40 : 90);
            _dom.squareMark[0].style.borderColor = borderColor.toHex();
            // force redraw element in Safari
            forceRedrawElement(_dom.squareMark[0]);
        }

        /**
         * Redraws element; this is used to overcome a bug in Safari: element border is not redrawn in some cases.
         * see http://stackoverflow.com/questions/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes
         * @param {HTMLElement} el - Element
         */
        function forceRedrawElement(el) {
            if (!_browserFeatures.redrawBug)
                return;
            el.style.display = "inline-block";
            //noinspection BadExpressionStatementJS
            el.offsetHeight;
            el.style.display = "block";
        }

        /**
         * Parses dec or hex numeric value from string. If the value is not int, returns NaN.
         * @param str - Input string
         * @param min - Min value
         * @param max - Max value
         * @returns {number}
         */
        function parseNumeric(str, min, max) {
            str = $.trim(str);
            var result;
            if (/^\d*$/g.test(str))
                result = +str;
            else if (/^[\da-f]+$/gi.test(str))
                result = parseInt(str, 16);
            else
                return NaN;
            return Math.max(min, Math.min(max, result));
        }

        /**
         * Parses color (including named colors) from string.
         * @param {string} str - String to parse in any format
         * @returns {string} - Parsed color in hex format or null if there was an error
         */
        function parseColor(str) {
            try {
                return new SmallColorPicker.Color(str).toHex();
            } catch (err) {
                if (/^[a-z]+$/gi.test(str)) {
                    str = str.toLowerCase();
                    var el = $("<div style='color:black'></div>").css("color", str).appendTo("body");
                    var color = el.css("color");
                    el.remove();
                    try {
                        color = new SmallColorPicker.Color(color);
                        if (color.val || str == "black")
                            return color.toHex();
                        return null;
                    } catch (err2) {
                        return null;
                    }
                }
                return null;
            }
        }

        /**
         * Moves circle and square marks.
         */
        function moveMarks() {
            moveCircleMark();
            moveSquareMark();
        }

        /**
         * Switches between color picker input modes.
         */
        function switchMode() {
            _mode = _mode == SmallColorPicker.Mode.COLOR ? SmallColorPicker.Mode.NUMBER : SmallColorPicker.Mode.COLOR;
            displayMode();
        }

        /**
         * Displays controls for currently selected mode
         */
        function displayMode() {
            if (_mode == SmallColorPicker.Mode.NUMBER) {
                _dom.el.addClass("s-c-p-mode-num");
                _dom.squareMark.hide();
                if (_dom.modeSwitch)
                    _dom.modeSwitch.attr("title", _opts.texts.switchModeToCol);
                displayNumericRgb();
                displayNumericHsv();
                displayNumericHex();
            } else {
                _dom.el.removeClass("s-c-p-mode-num");
                _dom.squareMark.show();
                if (_dom.modeSwitch)
                    _dom.modeSwitch.attr("title", _opts.texts.switchModeToNum);
                displaySquareColor(_color.toHex());
                moveMarks();
            }
        }

        /**
         * Fills RGB text boxes with values from _color.
         */
        function displayNumericRgb() {
            $.each(_color.toRgb(), function(part, num) {
                $("#s-c-p-txt-" + _id + "-rgb-" + part, _dom.el).val(num);
            });
        }

        /**
         * Reads values from RGB text boxes.
         * @returns {{r: number, g: number, b: number}}
         */
        function readNumericRgb() {
            var result = {};
            $.each(["r", "g", "b"], function(ix, part) {
                result[part] = ~~$("#s-c-p-txt-" + _id + "-rgb-" + part, _dom.el).val();
            });
            return result;
        }

        /**
         * Fills HSV text boxes with values from _color.
         */
        function displayNumericHsv() {
            $.each(_color.toHsv(), function(part, num) {
                $("#s-c-p-txt-" + _id + "-hsv-" + (part === "v" ? "b" : part), _dom.el).val(Math.round(num));
            });
        }

        /**
         * Reads values from HSV text boxes.
         * @returns {{h: number, s: number, v: number}}
         */
        function readNumericHsv() {
            var result = {};
            $.each(["h", "s", "v"], function(ix, part) {
                result[part] = ~~$("#s-c-p-txt-" + _id + "-hsv-" + (part === "v" ? "b" : part), _dom.el).val();
            });
            return result;
        }

        /**
         * Fills hex text box with values from _color.
         */
        function displayNumericHex() {
            $("#s-c-p-txt-" + _id + "-hex", _dom.el).val(_color.toHex());
        }

        /**
         * Gets state of the control.
         * @returns {boolean}
         */
        function isVisible() {
            return _dom && _dom.el && _dom.el.is(":visible");
        }

        /**
         * Shows color picker.
         */
        function show() {
            if (!_dom) {
                initialize();
            }
            displayOldColorSample();
            displayNewColorSample();
            setPosition();
            displayMode();
            _dom.el.show();
        }

        /**
         * Hides color picker.
         */
        function hide() {
            _dom.el.hide();
        }

        /**
         * Hides or shows color picker.
         */
        this.toggle = function() {
            if (this.isVisible())
                this.hide();
            else
                this.show();
        };

        /**
         * Gets state of the control.
         * @returns {boolean}
         */
        this.isVisible = isVisible;

        /**
         * Shows color picker.
         */
        this.show = show;

        /**
         * Hides color picker.
         */
        this.hide = hide;

        /**
         * Switches between color picker input modes.
         */
        this.switchMode = switchMode;

        /**
         * Sets old and new colors.
         * @param {string} [color] - New color HTML hex representation; undefined = don't change.
         * @param {string} [colorOld] - Old color HTML hex representation; undefined = don't change; null = set to no old color.
         */
        this.setColors = function(color, colorOld) {
            if (color !== undefined)
                _color = new SmallColorPicker.Color(color);
            if (colorOld !== undefined)
                _colorOld = colorOld === null ? null : new SmallColorPicker.Color(colorOld);
            if (this.isVisible()) {
                this.show();
            }
        };

        /**
         * Gets or sets color picker parent.
         * @param {HTMLElement|jQuery|string} [parent] - New parent (element or jQuery selector)
         * @returns {jQuery} - Parent element
         * @throws {string} Will throw an error if the picker is not in popup mode;
         */
        this.parent = function(parent) {
            if (parent) {
                if (this.isVisible()) {
                    this.hide();
                    _parent = $(parent);
                    this.show();
                } else {
                    _parent = $(parent);
                }
            }
            return _parent;
        }
    };

})(window.jQuery, document, window);
