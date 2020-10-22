/*jshint esversion: 6 */

/**
 * Gets the max size of an child within a container,
 * without losing the proper aspect ratio.
 * @param {number} width - The width of the child.
 * @param {number} height - The height of the child.
 * @param {number} containerWidth - The width of the enclosing container.
 * @param {number} containerHeight - The height of the enclosing container.
 * @return {Object} - Returns an object containing: ratio, scale, maxScale,
 *                    width, heigt, maxWidth and maxHeight.
 *
 */
function getMaxSize(width, height, containerWidth, containerHeight) {
  const ratio = width / height;

  let maxWidth = containerWidth;
  let maxHeight = containerWidth / ratio;
  if (maxHeight > containerHeight) {
    maxWidth = containerHeight * ratio;
    maxHeight = containerHeight;
  }

  const scale = maxWidth / width;
  const maxScale = width / maxWidth;

  return {
    ratio,
    scale,
    maxScale,
    width,
    height,
    maxWidth,
    maxHeight,
  };
}

//function getScale(w, h,)

export {getMaxSize};
