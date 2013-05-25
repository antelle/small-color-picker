(function($, document, window, undefined) {

    "use strict";

    module("Transform2D", {});

    test("Simple", function() {
        var matrix = [[1, 2, 3], [4, 5, 6]];
        var tr = new SmallColorPicker.Transforms.Transform2D(matrix);
        equal(tr.matrix, matrix, "Matrix is set");
        equal(tr.next, null, "Next transform is null");
        var result = tr.apply([10, 20]);
        deepEqual(result, [1*10 + 2*20 + 3, 4*10 + 5*20 + 6], "Transform is applied correctly");
    });

    test("Chaining", function() {
        var matrix1 = [[1, 2, 3], [4, 5, 6]];
        var matrix2 = [[1, 0, 1], [0, 1, 2]];
        var result = new SmallColorPicker.Transforms.Transform2D(matrix1)
            .chain(new SmallColorPicker.Transforms.Transform2D(matrix2))
            .apply([10, 20]);
        deepEqual(result, [1*10 + 2*20 + 3 + 1, 4*10 + 5*20 + 6 + 2], "Transforms are applied correctly");
    });

    test("Chaining 2 times", function() {
        var result = new SmallColorPicker.Transforms.Translate2D(1, 1)
            .chain(new SmallColorPicker.Transforms.Rotate2D(Math.PI/2))
            .chain(new SmallColorPicker.Transforms.Translate2D(-1, -1))
            .apply([10, 20]);
        equal(Math.round(result[0]), -22, "Applied correctly on x");
        equal(Math.round(result[1]), 10, "Applied correctly on y");
    });

    test("Translate2D", function() {
        var result = new SmallColorPicker.Transforms.Translate2D(1, 2).apply([10, 20]);
        deepEqual(result, [1 + 10, 2 + 20], "Translate2D is applied correctly");
    });

    test("Rotate2D", function() {
        var result = new SmallColorPicker.Transforms.Rotate2D(Math.PI/2).apply([5, 5]);
        equal(Math.round(result[0]), -5, "Rotate2D is applied correctly on x");
        equal(Math.round(result[1]), 5, "Rotate2D is applied correctly on y");
    });

})(window.jQuery, document, window);
