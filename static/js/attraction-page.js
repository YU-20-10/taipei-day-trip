import loading from "./components/loading.js";
import Time from "./classes/time.js";

function attractionPage() {
  let model = {
    timeout: 0,
    slideIndex: 0,
    getFormData: function (url, dom) {
      try {
        const idReg = /^\/attraction\/([0-9]+)$/;
        let formData = Object.fromEntries(new FormData(dom));
        let id = parseInt(url.match(idReg)[1]);
        formData["attractionId"] = id;
        formData["price"] = formData["time"] === "morning" ? 2000 : 2500;
        return formData;
      } catch (error) {
        throw error;
      }
    },
    dateCheck: function (date) {
      if (!date) {
        return "日期未選取";
      }
      const time = new Time();
      const laterThanNow = time.dateLaterThanNow(date);
      if (!laterThanNow) {
        return "請選取明天或之後的日期";
      }
    },
    postFormData: async function (data) {
      try {
        let token = localStorage.getItem("taipei_day_trip");
        let response = await fetch("/api/booking", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return response.json();
      } catch (error) {
        throw error;
      }
    },
  };
  let view = {
    renderPageEl: (attractionData, domList) => {
      const classObj = {
        title: ["attraction-content-title", "fz-3", "fw-bold"],
        category: ["fw-medium"],
        swiperOuter: ["attraction-content-swiper-outer"],
        swiperEl: ["attraction-content-swiper-element"],
        swiperLeft: ["attraction-content-swiper-left-btn"],
        swiperright: ["attraction-content-swiper-right-btn"],
        pagination: ["attraction-content-pagination-element"],
      };

      let titleH2 = document.createElement("h2");
      let titleText = document.createTextNode(attractionData?.["name"]);
      let categoryP = document.createElement("p");
      let categoryText = document.createTextNode(
        `${attractionData?.["category"]} at ${attractionData?.["mrt"]}`
      );
      let descriptionP = document.createElement("p");
      let descriptionText = document.createTextNode(
        attractionData?.["description"]
      );
      let addressDiv = document.createElement("div");
      let addressTitleH3 = document.createElement("h3");
      let addressTitleText = document.createTextNode("景點地址：");
      let addressTextP = document.createElement("p");
      let addressTextText = document.createTextNode(
        attractionData?.["address"]
      );
      let transportDiv = document.createElement("div");
      let transportTitleH3 = document.createElement("h3");
      let transportTitleText = document.createTextNode("交通方式：");
      let transportTextP = document.createElement("p");
      let transportTextText = document.createTextNode(
        attractionData?.["transport"]
      );
      titleH2.appendChild(titleText);
      titleH2.classList.add(...classObj["title"]);
      categoryP.appendChild(categoryText);
      categoryP.classList.add(...classObj["category"]);
      domList.attractionContentTitleOuter.append(titleH2, categoryP);

      descriptionP.appendChild(descriptionText);
      addressTitleH3.appendChild(addressTitleText);
      addressTextP.appendChild(addressTextText);
      addressDiv.append(addressTitleH3, addressTextP);
      transportTitleH3.appendChild(transportTitleText);
      transportTextP.appendChild(transportTextText);
      transportDiv.append(transportTitleH3, transportTextP);
      domList.attractionContentBottom.append(
        descriptionP,
        addressDiv,
        transportDiv
      );
      let swiperOuterDiv = document.createElement("div");
      attractionData?.["images"]?.forEach((image, index) => {
        let swiperEl = document.createElement("div");
        let pagination = document.createElement("div");
        swiperEl.style.background = `no-repeat center/cover url(${image})`;
        swiperEl.classList.add(...classObj["swiperEl"]);
        swiperEl.dataset.index = index;
        pagination.classList.add(...classObj["pagination"]);
        pagination.dataset.img = index;
        swiperOuterDiv.appendChild(swiperEl);
        domList.attractionContentSwiperPagination.appendChild(pagination);
      });
      swiperOuterDiv.classList.add(...classObj["swiperOuter"]);
      domList.attractionContentImg.append(swiperOuterDiv);
      // domList.attractionContentSwiperOuter = swiperOuterDiv;
      swiperOuterDiv.addEventListener("scroll", (e) => {
        clearTimeout(model.timeout);
        model.timeout = 0;
        model.timeout = setTimeout(() => {
          // 當前位置/窗口寬度，四捨五入
          let currentIndex = Math.round(
            swiperOuterDiv.scrollLeft / swiperOuterDiv.offsetWidth
          );
          model.slideIndex = currentIndex;
          domList.attractionContentSwiperPagination.childNodes.forEach(
            (el, index) => {
              if (index === model.slideIndex) {
                el.classList.add(
                  "attraction-content-pagination-element-active"
                );
              } else {
                el.classList.remove(
                  "attraction-content-pagination-element-active"
                );
              }
            }
          );
        }, 200);
      });
    },
  };
  let controller = {
    init: (attractionData, domList) => {
      view.renderPageEl(attractionData, domList);
      domList.attractionContentPlaceholderImg.remove();
    },
    formDataHandle: async (url, formDom, loadingDom) => {
      let formData = model.getFormData(url, formDom);
      let check = model.dateCheck(formData.date);
      if (check) {
        alert(check);
        return;
      }
      loading.show(loadingDom);
      //使loading平滑顯示/隱藏
      const minLoading = 300;
      const delay = (time) =>
        new Promise((resolve) => setTimeout(resolve, time));
      const start = Date.now();
      try {
        let postResult = await model.postFormData(formData);
        return postResult;
      } catch (error) {
        console.log(error);
      } finally {
        //使loading平滑顯示/隱藏
        let apiUseTime = Date.now() - start;
        let waitTime = Math.max(0, minLoading - apiUseTime);
        await delay(waitTime);
        loading.hide(loadingDom);
      }
    },
  };
  return controller;
}

export default attractionPage();
