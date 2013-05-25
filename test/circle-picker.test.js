(function($, document, window, undefined) {

    "use strict";

    function ensureStyleIsLoaded(styles) {
        var anythingIsLoaded = false;
        $.each(styles, function(ix, style) {
            if ($("link[href$='" + style + "']").length) {
                return;
            }
            less.env = "production";
            anythingIsLoaded = true;
            $("head").append("<link rel='stylesheet/less' href='/test/" + style + "' />");
            var sheet = $("link[href$='" + style + "']")[0];
            less.sheets.push(sheet);
        });
        if (anythingIsLoaded) {
            less.refresh();
        }
    }

    module("Circle picker", {
        setup: function() {
            ensureStyleIsLoaded(["less/circle-picker.less", "less/color-buttons.less"]);
            if (!$("#qunit-fixture").length)
                $("<div id='qunit-fixture' style='position:absolute;width:1000px;height:1000px;left:-10000px;top:-10000px;'></div>").appendTo("body");
            $("#qunit-fixture")
                .html("")
                .append("<div id='picker'></div>")
                .append("<div class='color-btn' id='color-btn1'></div>")
                .append("<div class='color-btn' id='color-btn2'></div>")
                .append("<div class='color-btn' id='color-btn3'></div>");
        },
        teardown: function() {
            $(".s-c-p").remove();
        }
    });

    function createPicker(opts) {
        return new SmallColorPicker.CirclePicker($.extend(true, {}, {
            placement: {
                parent: $("#picker"),
                popup: true
            },
            behavior: {
                animation: false
            }
        }, opts));
    }

    function getPickerEl() {
        return $(".s-c-p:first");
    }

    function assertVisible(picker, el) {
        ok(picker.isVisible(), "picker is visible");
        ok(el.is(":visible"), "picker element is visible");
    }

    function assertHidden(picker, el) {
        ok(!picker.isVisible(), "picker is hidden");
        ok(el.is(":hidden"), "picker element is hidden");
    }

    function assertColorsEqual(newColor, oldColor) {
        var oldColorEl = $(".s-c-p-color.s-c-p-color-old");
        var newColorEl = $(".s-c-p-color.s-c-p-color-new");
        var oldColorSample = $(".s-c-p-sample.s-c-p-sample-old");
        var newColorSample = $(".s-c-p-sample.s-c-p-sample-new");
        equal(oldColorEl.text(), oldColor, "old color is set");
        equal(newColorEl.text(), newColor, "new color is set");
        equal(new SmallColorPicker.Color(oldColorSample.css("background-color")).toHex(), oldColor, "old color sample is set");
        equal(new SmallColorPicker.Color(newColorSample.css("background-color")).toHex(), newColor, "new color sample is set");
    }

    test("Basic creation", function() {
        ok(createPicker(), "picker is created");
        equal(getPickerEl().length, 1, "picker element is present");
    });

    test("Empty parent creation", function() {
        try {
            createPicker({ placement: { parent: $("no-such-element") }});
        } catch (err) {
            equal(err, "Color picker should have exactly one parent", "error is thrown");
            return;
        }
        ok(false, "error should be thrown");
    });

    test("Multiple parent creation", function() {
        try {
            var els = $(".color-btn");
            ok(els.length > 1, "elements are present");
            createPicker({ placement: { parent: els }});
        } catch (err) {
            equal(err, "Color picker should have exactly one parent", "error is thrown");
            return;
        }
        ok(false, "error should be thrown");
    });

    test("hidden by default", function() {
        var picker = createPicker();
        var el = getPickerEl();
        assertHidden(picker, el);
    });

    test("show", function() {
        var picker = createPicker();
        var el = getPickerEl();
        picker.show();
        assertVisible(picker, el);
        picker.show();
        assertVisible(picker, el);
        picker.hide();
        picker.show();
        assertVisible(picker, el);
    });

    test("hide", function() {
        var picker = createPicker();
        var el = getPickerEl();
        picker.hide();
        assertHidden(picker, el);
        picker.hide();
        assertHidden(picker, el);
        picker.show();
        picker.hide();
        assertHidden(picker, el);
    });

    test("toggle", function() {
        var picker = createPicker();
        var el = getPickerEl();
        picker.show();
        assertVisible(picker, el);
        picker.toggle();
        assertHidden(picker, el);
        picker.toggle();
        assertVisible(picker, el);
        picker.toggle(false);
        assertHidden(picker, el);
        picker.toggle(false);
        assertHidden(picker, el);
        picker.toggle(true);
        assertVisible(picker, el);
        picker.toggle(true);
        assertVisible(picker, el);
    });

    test("parent", function() {
        var picker = createPicker({ placement: { parent: "#color-btn1" } });
        equal(picker.parent().length, 1, "picker has one parent");
        equal(picker.parent().attr("id"), "color-btn1", "picker parent is color-btn1");
        picker.parent("#color-btn2");
        equal(picker.parent().length, 1, "picker has one parent");
        equal(picker.parent().attr("id"), "color-btn2", "picker parent is color-btn2");
        picker.show();
        assertVisible(picker, getPickerEl());
        picker.parent("#color-btn3");
        equal(picker.parent().length, 1, "picker has one parent");
        equal(picker.parent().attr("id"), "color-btn3", "picker parent is color-btn3");
        try {
            picker.parent(".color-btn");
        } catch (err) {
            equal(err, "Color picker should have exactly one parent", "error is thrown");
            return;
        }
        ok(false, "error should be thrown");
    });

    test("destroy", function() {
        var picker = createPicker();
        equal($(".s-c-p").length, 1, "picker element is present");
        picker.destroy();
        equal($(".s-c-p").length, 0, "picker element is absent");
    });

    test("setColors", function() {
        var picker = createPicker();
        picker.setColors("#ff0000", "#0000ff");
        picker.show();
        assertColorsEqual("#ff0000", "#0000ff");
        picker.setColors("#aaaaaa");
        assertColorsEqual("#aaaaaa", "#0000ff");
        picker.setColors("#aabbcc", "#ddeeff");
        assertColorsEqual("#aabbcc", "#ddeeff");
    });

    test("switchMode", function() {
        var picker = createPicker();
        picker.show();
        var colorCircle = $(".s-c-p-circle");
        equal(colorCircle.length, 1, "color sircle is found");
        var textInputs = $(".s-c-p input[type=text]");
        equal(textInputs.length, 7, "color inputs are found");
        ok(colorCircle.is(":visible"), "color circle is visible");
        ok(textInputs.is(":hidden"), "text inputs are hidden");
        picker.switchMode();
        ok(colorCircle.is(":hidden"), "color circle is hidden");
        ok(textInputs.is(":visible"), "text inputs are visible");
        picker.switchMode();
        ok(colorCircle.is(":visible"), "color circle is visible");
        ok(textInputs.is(":hidden"), "text inputs are hidden");
        picker.switchMode(SmallColorPicker.Mode.COLOR);
        ok(colorCircle.is(":visible"), "color circle is visible");
        ok(textInputs.is(":hidden"), "text inputs are hidden");
        picker.switchMode(SmallColorPicker.Mode.NUMBER);
        ok(colorCircle.is(":hidden"), "color circle is hidden");
        ok(textInputs.is(":visible"), "text inputs are visible");
        picker.switchMode(SmallColorPicker.Mode.NUMBER);
        ok(colorCircle.is(":hidden"), "color circle is hidden");
        ok(textInputs.is(":visible"), "text inputs are visible");
        picker.switchMode(SmallColorPicker.Mode.COLOR);
        ok(colorCircle.is(":visible"), "color circle is visible");
        ok(textInputs.is(":hidden"), "text inputs are hidden");
    });

    test("create with number mode", function() {
        var picker = createPicker({ behavior: { mode: SmallColorPicker.Mode.NUMBER } });
        picker.show();
        var colorCircle = $(".s-c-p-circle");
        equal(colorCircle.length, 1, "color sircle is found");
        var textInputs = $(".s-c-p input[type=text]");
        equal(textInputs.length, 7, "color inputs are found");
        ok(colorCircle.is(":hidden"), "color circle is hidden");
        ok(textInputs.is(":visible"), "text inputs are visible");
    });

    // TODO: test color picking in both modes
    // TODO: test events

})(window.jQuery, document, window);
