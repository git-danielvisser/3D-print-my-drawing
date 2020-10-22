/*jshint esversion: 6 */

// Imports
import * as helpers from './helpers.js';

// Selectors
const S_DRAW_MODELER_SCENCE = '.js-draw-modeler-scene';

function DrawModeler(element, canvasWidth, canvasHeight) {
  const _self = this;

  // -- Interface -- //
  _self.element = element;
  _self.canvasWidth = canvasWidth;
  _self.canvasHeight = canvasHeight;

  /**
   * Creates an 3D drawing based on imageData and adds it to the scene.
   * @param {Object} imageData
   */
  _self.createDrawingModel = function(options) {

    const {
      imageData,
      width,
      height,
      frameDepth=5,
      drawingDepth=10,
      borderWidth=2,
      borderDepth=2
    } = options;

    const frame = _createFrame(
      width,
      height,
      frameDepth,
      borderWidth,
      borderDepth
    );

    const drawing = _createExtrudedDrawing(
      imageData,
      width-borderWidth*2,
      height-borderWidth*2,
      drawingDepth
    );

    drawing.translateZ(frameDepth);

    const drawingModel = new THREE.Group();
    drawingModel.add(frame);
    drawingModel.add(drawing);

    _camera.position.z = (width > height) ? width : height;
    _scene.add(drawingModel);

    _animateScene();
  };

  /**
   * Saves the scene as an .stl file.
   * Thanks to: https://github.com/atnartur/three-STLexporter,
   * https://github.com/eligrey/FileSaver.js
   */
  _self.downloadSTL = function() {
    const exporter = new THREE.STLExporter();
    const stlString = exporter.parse(_scene);

    const blob = new Blob([stlString], {type: 'stl/plain'});
    saveAs(blob, 'test.stl');
  };

  // -- Internals -- //
  let _scene;
  let _camera;
  let _renderer;
  let _controls;

  /**
   * Sets up the basic three js scene, without any models.
   */
  (function _setup() {
    const sceneEle = element.querySelector(S_DRAW_MODELER_SCENCE);
    _scene = new THREE.Scene();

    _renderer = new THREE.WebGLRenderer();
    _renderer.setSize(canvasWidth, canvasHeight);
    sceneEle.appendChild(_renderer.domElement);

    _camera = new THREE.PerspectiveCamera(100, canvasWidth / canvasHeight, 0.1, 5000);

    _controls = new THREE.OrbitControls(_camera, sceneEle, sceneEle);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(0, 20, 150);
    _scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xFFFFFF);
    directionalLight.position.set(0, 0, 20);
    _scene.add(ambientLight);

    _animateScene();
  })();

  /**
   * Animates the scene, gets invoked when a frame is requested.
   */
  function _animateScene() {
    requestAnimationFrame(_animateScene);
    _controls.update();
    _renderer.render(_scene, _camera);
  }

  /**
   * Converts imageData to an (3D) extruded drawing. Only works with black and white
   * drawings.
   * @param {Object} imageData
   * @return {Object} - Returns a THREE.Group with extruded meshes.
   */
  function _createExtrudedDrawing(imageData, width, height, depth) {
    const traceData = _imageDataToTraceData(imageData);
    const pathsData = _traceDataToPathsData(traceData);
    const shapes = _pathsDataToShapes(pathsData);

    const drawing = new THREE.Group();
    shapes.forEach((shape) => {

      var material = new THREE.MeshLambertMaterial( {
        color: 0x4cd63a
      } );

      var extrudeSettings = {
        depth: depth,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
      const mesh = new THREE.Mesh(geometry, material);
      drawing.add(mesh);
    });

    // Make y coordinates negative to invert the model again: https://muffinman.io/three-js-extrude-svg-path/#code
    // Pretty dirty
    drawing.scale.set(width/imageData.width, -(height / imageData.height), 1);

    drawing.translateX(-width / 2);
    drawing.translateY(height / 2);

    return drawing;
  }

  /**
   * Creates a 3D drawing frame.
   * @param {number} width
   * @param {number} height
   * @param {number} depth
   * @param {number} borderWidth
   * @param {number} borderDepth
   * @return {Object} - Returns a THREE.Mesh.
   */
  function _createFrame(width, height, depth, borderWidth, borderDepth) {

    const w = width,
          h = height,
          d = depth,
          bw = borderWidth,
          bd = borderDepth;

    const geometry = new THREE.Geometry();
     geometry.vertices.push(
       // Outside
       new THREE.Vector3(0, 0, 0), // ◻ ⌞ 0
       new THREE.Vector3(w, 0, 0), // ◻ ⌟ 1
       new THREE.Vector3(w, h, 0), // ◻ ⌝ 2
       new THREE.Vector3(0, h, 0), // ◻ ⌜ 3

       new THREE.Vector3(0, 0, bd), // ⇡◻ ⌞ 4
       new THREE.Vector3(w, 0, bd), // ⇡◻ ⌟ 5
       new THREE.Vector3(w, h, bd), // ⇡◻ ⌝ 6
       new THREE.Vector3(0, h, bd), // ⇡◻ ⌜ 7

       // Inside
       new THREE.Vector3(bw, bw, d),     // ▣ ⌞ 8
       new THREE.Vector3(w-bw, bw, d),   // ▣ ⌟ 9
       new THREE.Vector3(w-bw, h-bw, d), // ▣ ⌝ 10
       new THREE.Vector3(bw, h-bw, d),   // ▣ ⌜ 11

       new THREE.Vector3(bw, bw, bd),     // ⇡▣ ⌞ 12
       new THREE.Vector3(w-bw, bw, bd),   // ⇡▣ ⌟ 13
       new THREE.Vector3(w-bw, h-bw, bd), // ⇡▣ ⌝ 14
       new THREE.Vector3(bw, h-bw, bd)    // ⇡▣ ⌜ 15
     );

     geometry.faces.push(
       // Outside top south
       new THREE.Face3(4, 13, 12),
       new THREE.Face3(4, 5, 13),
       // Outside top east
       new THREE.Face3(5, 14, 13),
       new THREE.Face3(5, 6, 14),
       // Outside top south
       new THREE.Face3(6, 15, 14),
       new THREE.Face3(6, 7, 15),
       // Outside top west
       new THREE.Face3(7, 12, 15),
       new THREE.Face3(7, 4, 12),
       // Outside bottom
       new THREE.Face3(0, 3, 2),
       new THREE.Face3(0, 2, 1),
       // Outside front
       new THREE.Face3(0, 5, 4),
       new THREE.Face3(0, 1, 5),
       // Outside Right
       new THREE.Face3(1, 6, 5),
       new THREE.Face3(1, 2, 6),
       // Outside Back
       new THREE.Face3(2, 7, 6),
       new THREE.Face3(2, 3, 7),
       // Outside Left
       new THREE.Face3(3, 4, 7),
       new THREE.Face3(3, 0, 4),

       // Inside bottom
       new THREE.Face3(8, 10, 11),
       new THREE.Face3(8, 9, 10),
       // Inside front
       new THREE.Face3(8, 12, 13),
       new THREE.Face3(8, 13, 9),
       // Inside Right
       new THREE.Face3(9, 13, 14),
       new THREE.Face3(9, 14, 10),
       // Inside Back
       new THREE.Face3(10, 14, 15),
       new THREE.Face3(10, 15, 11),
       // Inside Left
       new THREE.Face3(11, 15, 12),
       new THREE.Face3(11, 12, 8)
     );

    geometry.computeBoundingSphere();
    geometry.computeFaceNormals();

     var material = new THREE.MeshLambertMaterial( {
       color: 0x328a27
     } );

     const frame = new THREE.Mesh(geometry, material);
     frame.translateX(-width/2);
     frame.translateY(-height/2);

     return frame;
  }

  /**
   * Vectorizes imageData and returns the traceData.
   * Thanks to: https://github.com/jankovicsandras/imagetracerjs
   * @param {Object} imageData
   * @return {Object} - Returns the traceData.
   */
  function _imageDataToTraceData(imageData) {
    const traceOptions = {
      pal: [
        {r:0,g:0,b:0,a:0},
        {r:255,g:255,b:255,a:255}
      ],
      rightangleenhance: false,
      ltres:0.01,
      qtres:0.01
    };

    return ImageTracer.imagedataToTracedata(imageData, traceOptions);
  }

  /**
   * Returns the visible paths from a traceData object
   * @param {Object} traceData
   * @return {Object[]} - Returns an array of pathData.
   */
  function _traceDataToPathsData(traceData) {
    let pathsData = [];

    traceData.layers.forEach((layerData, i) => {
      // Ignore white-ish layers
      const c = traceData.palette[i];
      if (c.r > 240 &&
          c.g > 240 &&
          c.b > 240) {
        return;
      }

      layerData.forEach((pathData) => {
        pathsData.push(pathData);
      });

    });

    return pathsData;
  }

  /**
   * Converts an array of ImageTracer paths to an array of THREE.Shape objects.
   * @param {Object[]} pathsData
   * @return {Object[]} - Returns an array of THREE.Shape objects.
   */
  function _pathsDataToShapes(pathsData) {

    const shapes = [];

    for (let i = 0; i < pathsData.length; i++) {
      // Continue if an holepath is encoutered.
      // The normal paths contain indecies in 'holechildren' for their corresponding holePaths.
      if (pathsData[i].isholepath) {
        continue;
      }

      const shape =_segmentsDataToShape(pathsData[i].segments);

      // If the shape has no holes.
      if (!pathsData[i].holechildren) {
        return shape;
      }

      // Add corresponding holes to the shape.
      const holePathDataIndices = pathsData[i].holechildren;
      for (let j = 0; j < holePathDataIndices.length; j++) {

        const holePathData = pathsData[ holePathDataIndices[j] ];
        const holeShape =_segmentsDataToShape(holePathData.segments);
        shape.holes.push(holeShape);
      }

      shapes.push(shape);
    }

    return shapes;
  }

  /**
   * Converts an array of ImageTracer segments to a THREE.Shape object.
   * @param {Object[]} segmentsData
   * @return {Object} - Returns the THREE.Shape object
   */
  function _segmentsDataToShape(segmentsData) {
    const shape = new THREE.Shape();
    shape.moveTo(segmentsData[0].x1, segmentsData[0].y1);

    segmentsData.forEach((s, i) => {
      // Line
      if (s.type === 'L') {
        shape.lineTo(s.x1, s.y1);
      // Bezier curve
      } else if (s.type === 'Q') {
        shape.bezierCurveTo(s.x1, s.y1, s.x2, s.y2, s.x3, s.y3);
      }
    });

    return shape;
  }

}

export default DrawModeler;
