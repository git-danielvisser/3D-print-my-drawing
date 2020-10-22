/*jshint esversion: 6 */

// Modifiers
const M_HIDDEN = 'h-hidden';

function PageSwitcher(element) {
  const _self = this;

  // -- Interface -- //
  _self.element = element;
  _self.currentPage = 1;
  _self.totalPages = element.children.length;

  /**
   * Jumps to the page with the given number.
   * @param {number} pageNum
   */
  _self.jumpToPage = function(pageNum) {
    if (_self.doesPageExist(pageNum)) {
      _hidePage();
      _self.currentPage = pageNum;
      _displayPage();
    }
  };

  /**
   * Jumps to the next page.
   */
  _self.nextPage = function() {
    const nextPage = _self.currentPage + 1;
    if (_self.doesPageExist(nextPage)) {
      _self.jumpToPage(nextPage);
    }
  };

  /**
   * Jumps to the previous page.
   */
  _self.previousPage = function() {
    const previousPage = _self.currentPage - 1;
    if (_self.doesPageExist(previousPage)) {
      _self.jumpToPage(previousPage);
    }
  };

  /**
   * Checks if a page exists
   * @param {number} pageNum
   * @return {boolean}
   */
  _self.doesPageExist = function(pageNum) {
    return (pageNum >= 1 && pageNum <= this.totalPages);
  };

  // -- Internals -- //

  /**
   * Displays page (element node) with given number.
   * @param {number} pageNum
   */
  function _displayPage(pageNum = _self.currentPage) {
    const pageEles = _self.element.children;
    pageEles[pageNum-1].classList.remove(M_HIDDEN);
  }

  /**
   * Hides page (element node) with given number.
   * @param {number} pageNum
   */
  function _hidePage(pageNum = _self.currentPage) {
    const pageEles = _self.element.children;
    pageEles[pageNum-1].classList.add(M_HIDDEN);
  }

}

export default PageSwitcher;
