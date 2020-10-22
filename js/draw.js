/*jshint esversion: 6 */

// Selectors
const S_DRAW_CANVAS = '.js-draw-canvas';
const S_DRAW_CONTROLS = '.js-draw-controls';

// Classes
const CONTROLS_CLASSES = {
  C_DRAW_PENCIL_S: 'js-draw-pencil-s',
  C_DRAW_PENCIL_M: 'js-draw-pencil-m',
  C_DRAW_PENCIL_L: 'js-draw-pencil-l',
  C_DRAW_ERASER_S: 'js-draw-eraser-s',
  C_DRAW_ERASER_M: 'js-draw-eraser-m',
  C_DRAW_ERASER_L: 'js-draw-eraser-l'
};

// Modifiers classes
const M_SELECTED = '--selected';

function Draw(element, canvasWidth, canvasHeight) {
  const _self = this;

  // -- Interface -- //
  _self.element = element;
  _self.canvasWidth = canvasWidth;
  _self.canvasHeight = canvasHeight;

  /**
   * Creates the start of a line
   * @param {number[]} point - An array with the x and y coordinates.
   */
  _self.lineStart = function(point) {
    _ctx.beginPath();
    _ctx.moveTo(point[0], point[1]);
    _self.lineTo(point);
  };

  /**
   * Moves the line to a point
   * @param {number[]} point - An array with the x and y coordinates.
   */
  _self.lineTo = function(point) {
    _ctx.lineTo(point[0], point[1]);
  };

  /**
   * Draws the line to canvas.
   */
  _self.drawLine = function() {
    _ctx.stroke();
  };

  /**
   * Clears the canvas by covering it with a white square/rectangle.
   */
  _self.clearCanvas = function() {
    _ctx.fillStyle = '#FFFFFF';
    _ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  };

  /**
   * Sets the style of the line.
   * @param {number} width - The width of the line in pixels.
   * @param {string} color - The hexidecimal color code (#FFFFFF) to set the line color.
   */
  _self.setLineStyle = function(width, color) {
    _ctx.lineWidth = width;
    _ctx.strokeStyle = color;
    _ctx.lineCap = 'round';
    _ctx.lineJoin = 'round';
  };

  /**
   * Returns the canvas image data.
   * @return {Object} - Returns an image data object, with the size of the
   *                    full canvas.
   */
  _self.getImageData = function() {
    return _ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  };

  // -- Internals -- //
  let _canvasEle;
  let _controlsEle;
  let _ctx;

  /**
   * Sets up the canvas and its controls.
   */
  (function _setup() {
    _canvasEle = element.querySelector(S_DRAW_CANVAS);
    _canvasEle.width = canvasWidth;
    _canvasEle.height = canvasHeight;

    _ctx = _canvasEle.getContext('2d');
    _self.clearCanvas();
    _self.setLineStyle(7, '#000000');

    _canvasEle.addEventListener('mousedown', _mouseDown);
    document.addEventListener('mouseup', _mouseUp);

    _canvasEle.addEventListener('touchstart', _touchStart);
    _canvasEle.addEventListener('touchmove', _touchMove);

    _controlsEle = element.querySelector(S_DRAW_CONTROLS);
    _controlsEle.addEventListener('click', _controlsClick);
  })();

  /**
   * Gets the x, y from an canvas based on the mouse position.
   * @param {Object} - The event object from an event listener.
   * @return {number[]} point - An array with the x and y coordinates.
   */
  function _pageToCanvasPoint(e) {

    const resizeRatio = _canvasEle.width / _canvasEle.clientWidth;
    const canvasX = (e.pageX - _canvasEle.offsetLeft) * resizeRatio;
    const canvasY = (e.pageY - _canvasEle.offsetTop) * resizeRatio;

    return [canvasX, canvasY];
  }

  /**
   * Starts a line on the location of the pointer.
   * @param {number[]} point - An array with the x and y coordinates.
   */
  function _canvasPointerDown(point) {
    _self.lineStart(point);
    _self.drawLine();
  }

  /**
   * Draws a line to the location of the pointer.
   * @param {number[]} point - An array with the x and y coordinates.
   */
  function _canvasPointerMove(point) {
    _self.lineTo(point);
    _self.drawLine();
  }

  /**
   * Handles mousedown.
   * @param {Object} - The event object.
   */
  function _mouseDown(e) {
    _canvasPointerDown( _pageToCanvasPoint(e) );
    document.addEventListener('mousemove', _mouseMove);
  }

  /**
   * Handles mousemove.
   * @param {Object} - The event object.
   */
  function _mouseMove(e) {
    _canvasPointerMove( _pageToCanvasPoint(e) );
  }

  /**
   * Handles mouse up.
   */
  function _mouseUp() {
    document.removeEventListener('mousemove', _mouseMove);
  }

  /**
   * Handles touchstart.
   * @param {Object} - The event object.
   */
  function _touchStart(e) {
    e.preventDefault();
    _canvasPointerDown( _pageToCanvasPoint(e.touches[0]) );
  }

  /**
   * Handles touchmove.
   * @param {Object} - The event object.
   */
  function _touchMove(e) {
    e.preventDefault();
    _canvasPointerMove( _pageToCanvasPoint(e.touches[0]) );
  }

  /**
   * Deligates click events for the controls.
   * @param {Object} - The event object from an event listener.
   */
  function _controlsClick(e) {

    let controlClass;
    for (const key in CONTROLS_CLASSES) {
      if (e.target.classList.contains(CONTROLS_CLASSES[key])) {
        controlClass = CONTROLS_CLASSES[key];
      }
    }

    if (!controlClass) {
       return;
    }

    const controlEles = _controlsEle.children;
    for (let i = 0; i < controlEles.length; i++) {
      controlEles[i].classList.remove(M_SELECTED);
    }

    e.target.classList.add(M_SELECTED);

    switch (controlClass) {
      case CONTROLS_CLASSES.C_DRAW_ERASER_S:
        _self.setLineStyle(3, '#FFFFFF');
        break;

      case CONTROLS_CLASSES.C_DRAW_ERASER_M:
        _self.setLineStyle(7, '#FFFFFF');
        break;

      case CONTROLS_CLASSES.C_DRAW_ERASER_L:
        _self.setLineStyle(50, '#FFFFFF');
        break;

      case CONTROLS_CLASSES.C_DRAW_PENCIL_S:
        _self.setLineStyle(3, '#000000');
        break;

      case CONTROLS_CLASSES.C_DRAW_PENCIL_M:
        _self.setLineStyle(7, '#000000');
        break;

      case CONTROLS_CLASSES.C_DRAW_PENCIL_L:
        _self.setLineStyle(20, '#000000');
        break;
    }
  }

}

export default Draw;
