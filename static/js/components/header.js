function header() {
  let modal = {};
  let view = {
    showMenu: (dom) => {
      dom.classList.add("header-menu-show");
    },
    hideMenu: (dom) => {
      dom.classList.remove("header-menu-show");
    },
  };
  let controller = {
    init: (userData, memberDom, memberCenterDom) => {
      const headerComponentLoadingPlaceholder = document.querySelectorAll(
        ".header-component-loading-placeholder"
      );
      memberDom.textContent = userData?.id ? "登出系統" : "登入/註冊";
      if (userData?.id) {
        memberCenterDom.textContent = "會員中心";
      } else {
        memberCenterDom.parentNode.style.display = "none";
      }
      headerComponentLoadingPlaceholder.forEach((el) => {
        el.remove();
      });
    },
    menu: (btnDom) => {
      const body = document.querySelector("body");
      const menuDom = document.querySelector(".header-menu");
      view.showMenu(menuDom);
      body.addEventListener("click", (e) => {
        if (!btnDom.contains(e.target)) {
          view.hideMenu(menuDom);
        }
      });
    },
  };

  return controller;
}

export default header();
