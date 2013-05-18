module("Color", {});

test("Empty constructor", function() {
    var color = new SmallColorPicker.Color();
    equal(color.val, 0, "Value is 0");
});

test("Constructor with number", function() {
    var color = new SmallColorPicker.Color(0x123456);
    equal(color.val, 0x123456, "Value is set");
});

test("Constructor with hex string", function() {
    var color = new SmallColorPicker.Color("#123456");
    equal(color.val, 0x123456, "Value is parsed");
});

test("Constructor rgb string", function() {
    var color = new SmallColorPicker.Color("rgb(1, 2, 3);");
    equal(color.val, 0x010203, "Value is parsed");
});

function rgbPartsTest(val, a, b, c) {
    var color = new SmallColorPicker.Color(val);
    equal(color[a](), 0xaa, "First value read");
    equal(color[a](0xff), 0xff, "First value written");
    equal(color[a](), 0xff, "First value read");
    equal(color[b](), 0xbb, "Second value read");
    equal(color[c](), 0xcc, "Third value read");
}

test("RGB: red", function() {
    rgbPartsTest(0xaabbcc, "r", "g", "b");
});

test("RGB: green", function() {
    rgbPartsTest(0xbbaacc, "g", "r", "b");
});

test("RGB: blue", function() {
    rgbPartsTest(0xccbbaa, "b", "g", "r");
});

test("toHex", function() {
    var color = new SmallColorPicker.Color(0x123456);
    equal(color.toHex(), "#123456", "Correct hex representation");
    color = new SmallColorPicker.Color();
    equal(color.toHex(), "#000000", "Correct zero hex representation");
    color = new SmallColorPicker.Color(0x0a0b0c);
    equal(color.toHex(), "#0a0b0c", "Correct partly zero hex representation");
});

test("toRgb", function() {
    var rgb = new SmallColorPicker.Color(0x123456).toRgb();
    ok(rgb, "Value is not null");
    equal(rgb.r, 0x12, "Red value");
    equal(rgb.g, 0x34, "Green value");
    equal(rgb.b, 0x56, "Blue value");
});

test("toRgbStr", function() {
    var rgb = new SmallColorPicker.Color(0x010203).toRgbStr();
    equal(rgb, "rgb(1,2,3)", "Correct rgb representation");
});

test("setRgb", function() {
    var color = new SmallColorPicker.Color().setRgb(1, 2, 3);
    equal(color.toHex(), "#010203", "Correctly set rgb values");
});

test("toHsv", function() {
    var hsv = new SmallColorPicker.Color(0xcc0505).toHsv();
    ok(hsv, "Value is not null");
    equal(hsv.h, 0, "H value");
    equal(hsv.s, 97, "S value");
    equal(hsv.v, 80, "V value");
});

test("setHsv", function() {
    var color = new SmallColorPicker.Color(0xcc0505).setHsv(50, 50, 80);
    equal(color.toHex(), "#ccbb66", "Correctly set hsv values");
});

test("hue", function() {
    var color = new SmallColorPicker.Color(0xff0000);
    equal(color.hue(), 0, "Red hue");
    color.hue(120);
    equal(color.toHex(), "#00ff00", "Correctly set green value");
    equal(color.hue(), 120, "Green hue");
});

test("getPerceivedBrightness", function() {
    var red = new SmallColorPicker.Color(0xff0000);
    var green = new SmallColorPicker.Color(0x00ff00);
    var blue = new SmallColorPicker.Color(0x0000ff);
    ok(red.getPerceivedBrightness() > blue.getPerceivedBrightness(), "Red is brighter than blue");
    ok(green.getPerceivedBrightness() > red.getPerceivedBrightness(), "Green is even brighter");
});
