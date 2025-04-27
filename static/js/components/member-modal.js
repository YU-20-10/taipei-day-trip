import loading from "./loading.js";

function memberModal() {
  let modal = {
    formData: {},
    getFormData: function (dom) {
      const rowFormData = new FormData(dom);
      this.formData = Object.fromEntries(rowFormData);
    },
    formDataVilidation: function (mode) {
      const mailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
      const passwordRegex = /^\w{2,15}$/;
      // \u4e00-\u9fff 為Unicode中文範圍
      const nameRegex = /^[\u4e00-\u9fffa-zA-Z0-9]{2,15}$/;
      let mailCheck = mailRegex.test(this.formData?.["email"]);
      let passwordCheck = passwordRegex.test(this.formData?.["password"]);
      let nameCheck = nameRegex.test(this.formData?.["name"]);
      if (mode === "signup" && mailCheck && passwordCheck && nameCheck) {
        return true;
      } else if (mode === "signin" && mailCheck && passwordCheck) {
        return true;
      } else {
        this.formData = {};
        return false;
      }
    },
    postData: async function (url, data) {
      try {
        let response = await fetch(url, {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "content-type": "application/json",
          },
        });
        let result = await response.json();
        if (result.error) {
          throw result;
        }
        return result;
      } catch (error) {
        throw error;
      }
    },
    putData: async function (url, data) {
      try {
        let response = await fetch(url, {
          method: "PUT",
          body: JSON.stringify(data),
          headers: {
            "content-type": "application/json",
          },
        });
        let result = await response.json();
        if (result.error) {
          throw result;
        }
        localStorage.setItem("taipei_day_trip", result.token);
        window.location.replace(window.location.href);
      } catch (error) {
        throw error;
      }
    },
  };
  let view = {
    backdrop: (dom) => {
      let check = document.querySelector(".modal-backdrop");
      if (!check) {
        const div = document.createElement("div");
        div.classList.add("modal-backdrop");
        dom.appendChild(div);
      }
    },
    backdropRemove: (dom) => {
      const div = document.querySelector(".modal-backdrop");
      if (div) {
        div.remove();
      }
    },
    show: (dom) => {
      dom.classList.add("modal-show");
    },
    hide: (dom) => {
      dom.classList.remove("modal-show");
    },
    messageInit: (dom) => {
      dom.textContent = "";
    },
    message: (dom, message) => {
      dom.textContent = message;
    },
  };
  let controller = {
    showModal: (elDom, messageDom) => {
      const bodyDom = document.querySelector("body");
      view.messageInit(messageDom);
      view.backdrop(bodyDom);
      view.show(elDom);
      controller.clickHide("modal-backdrop", elDom);
    },
    hideModal: (elDom) => {
      const bodyDom = document.querySelector("body");
      view.backdropRemove(bodyDom);
      view.hide(elDom);
    },
    formDataHandle: async (mode, formDom, messageDom, loadingDom) => {
      view.messageInit(messageDom);
      loading.show(loadingDom);
      modal.getFormData(formDom);
      let check = modal.formDataVilidation(mode);

      // 使loading平滑顯示/隱藏
      const minLoading = 200;
      const delay = (time) =>
        // 使用Promise包裝setTimeout
        new Promise((resolve) => setTimeout(resolve, time));
      const start = Date.now();

      try {
        if (mode === "signin") {
          if (check) {
            let result = await modal.putData("/api/user/auth", modal.formData);
          } else {
            view.message(messageDom, "信箱或密碼輸入錯誤");
          }
        } else if (mode === "signup") {
          if (check) {
            let result = await modal.postData("/api/user", modal.formData);
            view.message(messageDom, "註冊成功");
          } else {
            view.message(messageDom, "姓名或信箱或密碼格式錯誤");
          }
        }
      } catch (error) {
        console.error(error);
        view.message(messageDom, error.message);
      } finally {
        // 使loading平滑顯示/隱藏
        let apiUseTime = Date.now() - start;
        // Math.max()確保不會是負值
        let waitTime = Math.max(0, minLoading - apiUseTime);
        await delay(waitTime);
        loading.hide(loadingDom);
      }
    },
    clickHide: (className, elDom) => {
      let dom = document.querySelector(`.${className}`);
      dom.addEventListener("click", (e) => {
        controller.hideModal(elDom);
      });
    },
  };

  return controller;
}

export default memberModal();
