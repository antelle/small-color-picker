$(function() {
    $("body").addClass("no-bg");
    $(window).load(function() {
        $("body").removeClass("no-bg");
    });

    try {
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
                    showColorPickerText("Selected color: " + color);
                },
                cancel: function(color) {
                    showColorPickerText("Cancelled");
                }
            }
        });
        colorPicker.show();
    } catch (err) {
        $("#color-selector-box")
            .addClass("text-error")
            .html("Error loading SmallColorPicker (" + err + ")");
    }

    $(".color-btn").click(function() {
        var cls = this.className.replace("color-btn ", "");
        var color = new SmallColorPicker.Color($("b", this).css("background-color")).toHex();
        $("#span-code-style span").html(cls);
        $("#span-code-color span").html(color);
        colorPicker.setColors(color);
    });

    prettyPrint();
});

function showColorPickerText(text) {
    $("#color-selector-text").html(text).stop().show().css({opacity: 1}).fadeOut(2000);
}

