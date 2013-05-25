$(function() {
    $("body").addClass("no-bg");
    $(window).load(function() {
        $("body").removeClass("no-bg");
    });

    try {
        $("#color-selector-box").html("");
        $("#color-selector-box").smallColorPicker({
            placement: {
                position: "static",
                popup: false
            },
            colors: {
                colorOld: "#990e8d",
                colorNew: "#6d1f7a"
            },
            behavior: {
                hideOnSelect: false
            }
        }).on({
                scp_ok: function(picker, color) {
                    showColorPickerText("Selected: " + color);
                },
                scp_cancel: function() {
                    showColorPickerText("Cancelled");
                }
            });
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
        $("#color-selector-box").smallColorPicker().setColors(color);
    });

    $("#btn-picker").smallColorPicker({}).on({
        scp_show: function() {
            $("#color-selector-box").fadeTo(200, 0.03);
        },
        scp_hide: function() {
            $("#color-selector-box").fadeTo(500, 1);
        }
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

