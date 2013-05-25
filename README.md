# SmallColorPicker

SmallColorPicker is a tiny jQuery color picker licensed under MIT. Also the project includes buttons styles for color selection.  
Live demo page is [here](http://antelle.github.io/small-color-picker/). Screenshot:  
  
<img src="http://antelle.github.io/small-color-picker/img/screenshot.png" alt="Small color picker" width="336px" height="240px" />

## Features
This color picker includes:  

* color wheel and text input modes;
* minimalistic popup interface;
* old (previous) and new (current) color display;
* color buttons which will automatically change its color;
* popup and static positioning;
* text input of colors in natural language;
* touch devices support;
* multi-target popup mode (if initialized with several buttons, only one picker will be visible);
* retina graphics.

This color picker does not include:

* support of non-CSS3 browsers


## Usage

SmallColorPicker initializations should look like this:  
```javascript
try {
    $(".color-btn").smallColorPicker({ /* options */ });
} catch (err) {
    // the browser is not supported
}
```   
Please note: `options` object is mandatory, you can pass just `{}`.  
You can use color picker either in static mode (e.g. in a control displayed on your page), or in popup mode. In case the picker is initialized in popup mode, only one picker will be created for jQuery selector used for initialization (you can see this on example.html page in the source code). If you are using color buttons from this library, the picker will automatically replace color values in them.  
To get an earlier created color picker, call  
```javascript
var picker = $(".color-btn").smallColorPicker();  
```  
If you wish, you can also use the picker in non-jQuery version (`new SmallColorPicker.CirclePicker({})`) but this is more complex and still requires jQuery for operation.  

### Options
```javascript
$(".color-btn").smallColorPicker({
    placement: {
        position: "absolute", // positioning (ignored in popup mode)
        top: "0", // top posision (ignored in popup mode)
        left: "0", // left position (ignored in popup mode)
        parent: null, // don't pass this if you are using jQuery plugin version
        popup: true // popup or static color picker verson
    },
    colors: {
        colorOld: null, // old color (the one displayed on the left)
        colorNew: "#ff0000" // new color (displayed on the right; currently selected color)
    },
    texts: { // texts used in color picker
        ok: "OK",
        cancel: "Cancel",
        switchModeToNum: "Show numbers",
        switchModeToCol: "Show color wheel"
    },
    behavior: {
        rotate: true, // whether to rotate color wheel
        hideOnSelect: true, // auto hide picker on color select
        mode: SmallColorPicker.Mode.COLOR, // default color selection mode 
        switchMode: true, // whether the user can switch input mode
        animation: true // show/hide fade animation 
    }
});
```
### Methods
This code explains usage of methods:  
```javascript
var picker = $(".color-btn").smallColorPicker(); // get the picker
picker.show(); // show the picker
picker.hide(); // hide the picker
picker.toggle(); // toggle picker visibility
picker.toggle(true); // show the picker
picker.toggle(false); // hide the picker
var visible = picker.isVisible(); // is the picker visible
picker.switchMode(); // switch input mode between color wheel and numberic
picker.switchMode(SmallColorPicker.Mode.COLOR); // switch to clor wheel mode
picker.switchMode(SmallColorPicker.Mode.NUMBER); // switch to numeric mode
picker.setColors("#ff0000"); // set the displayed (selected) color
picker.setColors("#ff0000", "#000000"); // set both colors: displayed (selected) and old (previously selected)
var parent = picker.parent(); // get picker current parent
picker.parent("#btn2"); // change picker parent
picker.destroy(); // completely remove color picker 
```

## Building

Use grunt to build this project. It will put the result into ../build-v1 folder. 
