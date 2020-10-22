/*jshint esversion: 6 */
/*jshint browser: true */
/*jslint devel: true */

// Imports
import PageSwitcher from './page-switcher.js';
import Draw from './draw.js';
import DrawModeler from './draw-modeler.js';
import * as helpers from './helpers.js';

// Selectors
const S_PAGE_SWITCHER = '.js-page-switcher';
const S_DRAW = '.js-draw';
const S_DRAW_CANVAS = '.js-draw-canvas';
const S_DRAW_MODELER = '.js-draw-modeler';

const S_MODEL_WIDTH_INPUT = '.js-canvas-width-input';
const S_MODEL_HEIGHT_INPUT = '.js-canvas-height-input';
const S_DRAW_STEP_BUTTON = '.js-draw-step-button';
const S_MODEL_STEP_BUTTON = '.js-model-step-button';
const S_DOWNLOAD_MODEL_BUTTON = '.js-download-model-buttton';

// Variables
let canvasSize;
let pageSwitcher;
let draw;
let drawModeler;

// Start script
document.addEventListener('DOMContentLoaded', function() {
  const pageSwitcherEle = document.querySelector(S_PAGE_SWITCHER);
  pageSwitcher = new PageSwitcher(pageSwitcherEle);

  const drawStepButtonEle = document.querySelector(S_DRAW_STEP_BUTTON);
  drawStepButtonEle.addEventListener('click', drawStep);

  const modelStepButtonEle = document.querySelector(S_MODEL_STEP_BUTTON);
  modelStepButtonEle.addEventListener('click', modelStep);

  const downloadModelButtonEle = document.querySelector(S_DOWNLOAD_MODEL_BUTTON);
  downloadModelButtonEle.addEventListener('click', downloadModel);
});

function drawStep() {
  const modelWidthInput = document.querySelector(S_MODEL_WIDTH_INPUT);
  const modelHeightInput = document.querySelector(S_MODEL_HEIGHT_INPUT);

  const modelWidth = +modelWidthInput.value;
  const modelHeight = +modelHeightInput.value;

  if (!isFinite(modelWidth)  ||
      !isFinite(modelHeight) ||
      modelWidth < 1 ||
      modelHeight < 1)  {
    alert('Invalid drawing size');
    return;
  }

  pageSwitcher.nextPage();

  const drawEle = document.querySelector(S_DRAW);
  const drawCanvasEle = document.querySelector(S_DRAW_CANVAS);
  const pageSwitcherEle = pageSwitcher.element;
  const currentPageEle = pageSwitcher.element.children[1];

  const maxWidth = currentPageEle.offsetWidth;
  let maxHeight = pageSwitcherEle.offsetHeight;
  maxHeight -= currentPageEle.offsetHeight + currentPageEle.offsetTop;
  maxHeight += drawCanvasEle.offsetHeight;

  canvasSize = helpers.getMaxSize(modelWidth, modelHeight, maxWidth, maxHeight);
  draw = new Draw(drawEle, canvasSize.maxWidth, canvasSize.maxHeight);
}

function modelStep() {

  pageSwitcher.nextPage();

  const drawModelerEle = document.querySelector(S_DRAW_MODELER);
  drawModeler = new DrawModeler(drawModelerEle, canvasSize.maxWidth, canvasSize.maxHeight);

  const avarage = (canvasSize.width+canvasSize.height) / 2;

  const options = {
    imageData: draw.getImageData(),
    width: canvasSize.width,
    height: canvasSize.height,
    frameDepth: avarage / 100 * 2,
    drawingDepth: avarage / 100 * 10,
    borderWidth: avarage / 100 * 2,
    borderDepth: avarage / 100 * 10
  };

  drawModeler.createDrawingModel(options);
}

function downloadModel() {
  drawModeler.downloadSTL();
}
