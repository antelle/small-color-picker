(function($, document, window, undefined) {

    "use strict";

    var _pickerBackup = SmallColorPicker.CirclePicker;

    var PickerMock = function(opts) {
        PickerMock.addCall("constructor", { opts: opts });
        this._visible = false;
        this._parent = "parent";
    };
    PickerMock.calls = [];
    PickerMock.prototype = {
        constructor: PickerMock,
        show: function() { this._visible = true; PickerMock.addCall("show"); },
        hide: function() { this._visible = false; PickerMock.addCall("hide"); },
        toggle: function(visible) { this._visible = !this._visible; PickerMock.addCall("toggle", { visible: visible }); },
        isVisible: function() { PickerMock.addCall("isVisible"); return this._visible; },
        switchMode: function(mode) { PickerMock.addCall("switchMode", { mode: mode }); },
        setColors: function(color, oldColor) { PickerMock.addCall("setColors", { color: color, oldColor: oldColor }); },
        parent: function(parent) { PickerMock.addCall("parent", { parent: parent }); if (parent) this._parent = $(parent); return this._parent; },
        destroy: function() { PickerMock.addCall("destroy"); }
    };
    PickerMock.addCall = function(name, args) {
        PickerMock.calls.push({ name: name, args: args });
    };
    PickerMock.getCalls = function(name, filter) {
        var calls = [];
        $.each(PickerMock.calls, function(ix, call) {
            if (call.name === name && (!filter || filter(call)))
                calls.push(call);
        });
        return calls;
    };
    PickerMock.expectCalls = function(assertName, call, min, max, filter) {
        var calls = PickerMock.getCalls(call, filter);
        ok(calls.length >= (min || 0) && calls.length <= (max || calls.length),
            assertName + " (expected " + (min === max ? min : (min || "0") + ".." + (max || "inf")) + ", was " + calls.length
             + (filter ? " filtered" : "") + " calls to '" + call + "')");
    };

    function colorEqual(x, y) {
        return new SmallColorPicker.Color(x).val === new SmallColorPicker.Color(y).val;
    }

    module("jQuery plugin", {
        setup: function() {
            SmallColorPicker.CirclePicker = PickerMock;
            PickerMock.calls = [];
            if (!$("#qunit-fixture").length)
                $("<div id='qunit-fixture'></div>").appendTo("body");
            $("#qunit-fixture")
                .html("")
                .append("<div class='color-btn' id='color-btn1'><b style='background:#ffffff'></b>#ffffff</div>")
                .append("<div class='color-btn' id='color-btn2'><b style='background:#000000'></b>#000000</div>")
                .append("<div class='color-btn' id='color-btn3'><b style='background:#ff0000'></b>click here</div>");
        },
        teardown: function() {
            SmallColorPicker.CirclePicker = _pickerBackup;
        }
    });

    test("incorrect creation", function() {
        var btns = $("#qunit-fixture .color-btn");
        ok(btns.smallColorPicker(), "proxy returned for empty objects");
        btns.smallColorPicker().show();
        ok(!btns.smallColorPicker().isVisible(), "isVisible is false");
        btns.smallColorPicker().destroy();
    });

    test("constructor: popup", function() {
        var btns = $("#qunit-fixture .color-btn");
        btns.smallColorPicker({});
        PickerMock.expectCalls("picker created only one time", "constructor", 1, 1);
        btns.smallColorPicker().destroy();
        PickerMock.expectCalls("picker destroyed only one time", "destroy", 1, 1);
    });

    test("constructor: static", function() {
        var btns = $("#qunit-fixture .color-btn");
        btns.smallColorPicker({ placement: { popup: false } });
        PickerMock.expectCalls("picker created for each element", "constructor", btns.length, btns.length);
        btns.each(function() {
            var id = this.id;
            PickerMock.expectCalls("picker created for element " + this.id, "constructor", 1, 1, function(call) { return $(call.args.opts.placement.parent).attr("id") == id; });
        });
        btns.smallColorPicker().destroy();
        PickerMock.expectCalls("picker destroyed for each element", "destroy", btns.length, btns.length);
    });

    test("isVisible", function() {
        var btns = $("#qunit-fixture .color-btn");
        btns.smallColorPicker({ placement: { popup: false } });
        ok(!$("#qunit-fixture .color-btn").smallColorPicker().isVisible(), "picker is not visible if all are hidden");
        PickerMock.expectCalls("isVisible called for each element", "isVisible", btns.length, btns.length);
        btns.first().data("scp").show();
        ok(btns.smallColorPicker().isVisible(), "picker is visible if at least one is visible");
    });

    function operationTest(op, isPopup) {
        var btns = $("#qunit-fixture .color-btn");
        btns.smallColorPicker({ placement: { popup: isPopup } });
        btns.smallColorPicker()[op]();
        if (isPopup)
            PickerMock.expectCalls(op + " called only once", op, 1, 1);
        else
            PickerMock.expectCalls(op + " called for each element", op, btns.length, btns.length);
    }

    test("show: popup", function() {
        operationTest("show", true);
    });

    test("show: static", function() {
        operationTest("show", false);
    });

    test("hide: popup", function() {
        operationTest("hide", true);
    });

    test("hide: static", function() {
        operationTest("hide", false);
    });

    test("toggle: popup", function() {
        operationTest("toggle", true);
    });

    test("toggle: static", function() {
        operationTest("toggle", false);
    });

    test("switchMode: popup", function() {
        operationTest("switchMode", true);
    });

    test("switchMode: static", function() {
        operationTest("switchMode", false);
    });

    test("setColors: popup", function() {
        operationTest("setColors", true);
    });

    test("setColors: static", function() {
        operationTest("setColors", false);
    });

    test("parent: popup", function() {
        var btns = $("#qunit-fixture .color-btn");
        btns.smallColorPicker({});
        equal(btns.smallColorPicker().parent(), "parent", "parent is returned");
        PickerMock.expectCalls("parent called only once", "parent", 1, 1);
    });

    test("parent: static", function() {
        var btns = $("#qunit-fixture .color-btn");
        btns.smallColorPicker({ placement: { popup: false } });
        equal(btns.smallColorPicker().parent(), "parent", "parent is returned");
        PickerMock.expectCalls("parent called only once", "parent", 1, 1);
    });

    test("click handler", function() {
        var btns = $("#qunit-fixture .color-btn");
        btns.smallColorPicker({});
        btns.first().click();
        PickerMock.expectCalls("picker shown", "show", 1, 1);
        PickerMock.expectCalls("color is set to white", "setColors", 1, 1, function(call) { return colorEqual(call.args.color, "#fff") && colorEqual(call.args.oldColor, "#fff"); });
        PickerMock.expectCalls("mode switched to color", "switchMode", 1, 1, function(call) { return call.args.mode === SmallColorPicker.Mode.COLOR; });
        equal($(btns.smallColorPicker().parent()).attr("id"), btns.first().attr("id"), "parent is set");
        ok(btns.smallColorPicker().isVisible(), "picker is visible");
        PickerMock.calls = [];
        btns.last().click();
        PickerMock.expectCalls("picker shown", "show", 1, 1);
        PickerMock.expectCalls("color is set to red", "setColors", 1, 1, function(call) { return colorEqual(call.args.color, "#f00") && colorEqual(call.args.oldColor, "#f00"); });
        PickerMock.expectCalls("mode switched to color", "switchMode", 1, 1, function(call) { return call.args.mode === SmallColorPicker.Mode.COLOR; });
        equal($(btns.smallColorPicker().parent()).attr("id"), btns.last().attr("id"), "parent is changed");
        ok(btns.smallColorPicker().isVisible(), "picker is visible");
        PickerMock.calls = [];
        btns.last().click();
        PickerMock.expectCalls("picker not shown again", "show", 0, 0);
        PickerMock.expectCalls("picker hidden", "hide", 1, 1);
    });

    test("picker color selected event", function() {
        var btns = $("#qunit-fixture .color-btn");
        btns.smallColorPicker({});
        btns.first().click();
        PickerMock.expectCalls("picker shown", "show", 1, 1);
        PickerMock.calls = [];
        btns.first().trigger("scp_ok", "#aabbcc");
        equal(btns.first().data("scp-col"), "#aabbcc", "button data is set");
        equal($.trim(btns.first().text()), "#aabbcc", "button text is set");
        equal(new SmallColorPicker.Color(btns.first().find("b:first").css("background-color")).toHex(), "#aabbcc", "button bgcolor is set");
        ok(!btns.last().data("scp-col"), "another button data is not changed");
    });

})(window.jQuery, document, window);
