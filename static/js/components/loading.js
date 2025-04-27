function loading() {
  let model = {};
  let view = {
    show: (dom) => {
      if (dom) {
        dom.classList.add("component-loading-show");
      }
    },
    hide: (dom) => {
      if (dom) {
        dom.classList.remove("component-loading-show");
      }
    },
  };
  let controller = {
    show: (btnDom) => {
      view.show(btnDom);
    },
    hide: (btnDom) => {
      view.hide(btnDom);
    },
  };

  return controller;
}

export default loading();
