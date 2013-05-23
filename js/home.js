$(function() {
    $("body").addClass("no-bg");
    $(window).load(function() {
        $("body").removeClass("no-bg");
    });

    try {
        $("#color-selector-box").html("");
        var colorPicker = window.colorPicker = new SmallColorPicker.CirclePicker({
            placement: {
                position: "static",
                parent: $("#color-selector-box")
            },
            colors: {
                colorOld: "#990e8d",
                colorNew: "#6d1f7a"
            },
            behavior: {
                hideOnSelect: false
            },
            events: {
                ok: function(color) {
                    showColorPickerText("Selected: " + color);
                },
                cancel: function() {
                    showColorPickerText("Cancelled");
                }
            }
        });
        colorPicker.show();
    } catch (err) {
        $("#color-selector-box")
            .addClass("text-error")
            .html("Error loading SmallColorPicker (" + err + "). Click <a href='img/screenshot.png'>here</a> to see what does it look like.");
    }

    $(".color-btn:not(#btn-picker)").click(function() {
        var cls = this.className.replace("color-btn ", "");
        var color = new SmallColorPicker.Color($("b", this).css("background-color")).toHex();
        $("#span-code-style span").html(cls);
        $("#span-code-color span").html(color);
        colorPicker.setColors(color);
    });

    $("#btn-picker").click(function() {
        var el = $(this);
        var bgEl = $("b", this);
        var color = new SmallColorPicker.Color(bgEl.css("background-color")).toHex();
        var picker = window.picker;
        if (!picker) {
            picker = window.picker = new SmallColorPicker.CirclePicker({
                placement: {
                    parent: this,
                    popup: true
                },
                events: {
                    ok: function(resultColor) {
                        bgEl.css("background-color", resultColor);
                        el.contents().last().remove();
                        el.append(resultColor);
                        $("#color-selector-box").fadeTo(300, 1);
                    },
                    cancel: function() {
                        $("#color-selector-box").fadeTo(300, 1);
                    }
                }
            });
        } else if (picker.isVisible()) {
            picker.hide();
            $("#color-selector-box").fadeTo(300, 1);
            return;
        }
        picker.setColors(color, color);
        picker.show();
        $("#color-selector-box").fadeTo(300, 0.03);
    });

    $(".link-toggle-source").click(function(e) {
        e.preventDefault();
        var el = $("#" + $(this).data("src-id"));
        el.toggle();
        $(this).text(el.is(":visible") ? "collapse example" : "expand example");
    });

    prettyPrint();
});

function showColorPickerText(text) {
    $("#color-selector-text").html(text).stop().show().css({opacity: 1}).fadeOut(2000);
}

