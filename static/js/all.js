import User from "./classes/user.js";
import header from "./components/header.js";
import memberModal from "./components/member-modal.js";
import attractionPage from "./attraction-page.js";
import bookingSystem from "./booking-system.js";
import orderSyetem from "./order-system.js";
import memberCenter from "./member-center.js";

const indexContentMrtList = document.querySelector(".index-content-mrt-list");
const indexContentMrtLeft = document.querySelector(
  ".index-content-mrt-left-arrow"
);
const indexContentMrtRight = document.querySelector(
  ".index-content-mrt-right-arrow"
);
const indexContentList = document.querySelector(".index-content-list");
const indexBannerSearch = document.querySelector(".index-banner-search");
const indexBannerSearchBtn = document.querySelector(".index-banner-search-btn");
const menuItemMember = document.querySelector(".menu-item-member");
const menuItemMemberCenter = document.querySelector(".menu-item-member-center");
const headerMenuBtn = document.querySelector(".header-menu-btn");
const attractionContentFormRadio = document.querySelectorAll(
  ".attraction-content-form-radio"
);
const attractionContentFormPrice = document.querySelector(
  ".attraction-content-form-price"
);
const attractionContentSwiperLeftBtn = document.querySelector(
  ".attraction-content-swiper-left-btn"
);
const attractionContentSwiperRightBtn = document.querySelector(
  ".attraction-content-swiper-right-btn"
);
const attractionContentSwiperPagination = document.querySelector(
  ".attraction-content-swiper-pagination"
);
const attractionContentSelectBtn = document.querySelector(
  ".attraction-content-select-btn"
);
const attractionContentForm = document.querySelector(
  ".attraction-content-form"
);
const menuItemBooking = document.querySelector(".menu-item-booking");

const bookingConfirmBtn = document.querySelector(".booking-confirm-btn");
// 待節點插入後，node再綁定此變數

let nextPage = 0;
let timeout = 0;
// 監控是否有正在讀取中的fetch，預設為false非讀取中，滾動發送fetch會變更為true，資料完全載入時變更為false
let isLoading = false;
let currentUrl = window.location.pathname;
// slide當前的index
let slideIndex = 0;
const urlParms = new URLSearchParams(window.location.search);

async function getApiData(url) {
  try {
    const response = await fetch(url);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error.message);
    throw new Error(error.message);
  }
}

function createMrtLiEl(mrt) {
  const classList = ["index-content-mrt-link"];
  let li = document.createElement("li");
  let a = document.createElement("a");
  let content = document.createTextNode(mrt);
  a.appendChild(content);
  a.dataset.mrt = mrt;
  a.href = "#";
  a.classList.add(...classList);
  li.appendChild(a);
  indexContentMrtList.appendChild(li);
  // 監聽mrt列表是否被點擊
  li.addEventListener("click", async (e) => {
    e.preventDefault();
    const targetAttraction = await getApiData(
      `/api/attractions?page=0&keyword=${mrt}`
    );
    if (targetAttraction) {
      // nextPage變更
      nextPage = targetAttraction["nextPage"];
      // 畫面渲染
      createAttractionEl(targetAttraction["data"], true);
    }
    // 監聽最後一個node
    const indexContentAttraction = document.querySelectorAll(
      ".index-content-attraction"
    );
    if (indexContentAttraction) {
      const dom = indexContentAttraction[indexContentAttraction.length - 1];
      if (dom) {
        addObserver(dom, mrt);
      }
    }
  });
}

function createAttractionEl(attractionAllData, replaceOrNot) {
  // 存放要插入或取代的node
  let insertNode = [];
  const classObj = {
    "card-img": ["card-img"],
    "card-title": ["card-title", "c-white"],
    "card-text": ["card-text", "c-gray-50"],
    card: ["card", "index-content-attraction"],
  };
  attractionAllData.forEach((attractionData) => {
    let li = document.createElement("li");
    let a = document.createElement("a");
    let imgDiv = document.createElement("div");
    let imgTextDiv = document.createElement("div");
    let textDiv = document.createElement("div");
    let mrtP = document.createElement("p");
    let categoryP = document.createElement("p");
    let imgDivText = document.createTextNode(attractionData["name"]);
    let mrtPText;
    if (attractionData["mrt"]) {
      mrtPText = document.createTextNode(attractionData["mrt"]);
    } else {
      mrtPText = document.createTextNode("N/A");
    }
    let categoryPText = document.createTextNode(attractionData["category"]);
    imgTextDiv.appendChild(imgDivText);
    imgTextDiv.classList.add(...classObj["card-title"]);
    imgDiv.appendChild(imgTextDiv);
    imgDiv.classList.add(...classObj["card-img"]);
    imgDiv.style.background = `no-repeat center/cover url(${attractionData["images"][0]})`;
    mrtP.appendChild(mrtPText);
    categoryP.appendChild(categoryPText);
    textDiv.appendChild(mrtP);
    textDiv.appendChild(categoryP);
    textDiv.classList.add(...classObj["card-text"]);
    a.appendChild(imgDiv);
    a.appendChild(textDiv);
    a.classList.add(...classObj["card"]);
    a.dataset.id = attractionData["id"];
    a.href = `/attraction/${attractionData["id"]}`;
    li.appendChild(a);
    insertNode.push(li);
  });

  // insert element or replace element
  if (replaceOrNot) {
    indexContentList.replaceChildren(...insertNode);
  } else {
    indexContentList.append(...insertNode);
  }
}

async function signinCheck() {
  let token = localStorage.getItem("taipei_day_trip");
  try {
    let response = await fetch("/api/user/auth", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  } catch (error) {
    throw error;
  }
}

// 畫面滾動時觸發
async function scrollFn(keyword, id) {
  // 確定settimeout是否已經跑完，如果還沒return
  // 確認資料是否為載入中，如果載入中則拒絕下一次請求
  if (timeout || isLoading) return;
  let nextData;
  isLoading = true;
  if ((nextPage && nextPage * 12 == id) || (nextPage && keyword)) {
    if (keyword) {
      nextData = await getApiData(
        `/api/attractions?page=${nextPage}&keyword=${keyword}`
      );
    } else {
      nextData = await getApiData(`/api/attractions?page=${nextPage}`);
    }
    // nextPage變更
    nextPage = nextData["nextPage"];
  }
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (nextData) {
      // 畫面渲染
      createAttractionEl(nextData["data"], false);
      // 如果有再插入，監聽最後一個元件
      let indexContentAttraction = document.querySelectorAll(
        ".index-content-attraction"
      );
      if (indexContentAttraction) {
        let dom = indexContentAttraction[indexContentAttraction.length - 1];
        if (dom) {
          if (keyword) {
            addObserver(dom, keyword);
          } else {
            addObserver(dom, null);
          }
        }
      }
    }
    timeout = 0;
    isLoading = false;
  }, 100);
}

// 偵測指定dom元素
function addObserver(dom, keyword) {
  let id = dom.dataset.id;
  function listenerFn() {
    scrollFn(keyword, id);
  }
  const observerObj = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0) {
        window.addEventListener("scroll", listenerFn);
      } else {
        window.removeEventListener("scroll", listenerFn);
      }
    });
  });
  observerObj.observe(dom);
}

document.addEventListener("DOMContentLoaded", async (e) => {
  try {
    const user = await new User().init();
    header.init(user, menuItemMember, menuItemMemberCenter);

    // 確定網址是否符合/attraction/:id
    // (id必須為數字)(網址列後方可以是/結尾或是不加其他東西結尾)
    // window.location.href取得的網址不包含查詢字串
    const attractionRegex = /^\/attraction\/(\d+)(?:\/|$)/;

    if (currentUrl === "/") {
      // 如果載入的是首頁
      let mrtData = {};
      let attractionData = {};
      const domList = {
        indexContentMrtListComponentLoadingPlaceholderList:
          document.querySelectorAll(
            ".index-content-mrt-list-component-loading-placeholder"
          ),
        indexContentListComponentLoadingPlaceholder: document.querySelectorAll(
          ".index-content-list-component-loading-placeholder"
        ),
      };
      const data = await Promise.all([
        getApiData("/api/mrts"),
        getApiData("/api/attractions?page=0"),
      ]);
      mrtData = data?.[0];
      attractionData = data?.[1];
      if (Object.keys(mrtData).length > 0) {
        // 取得mrt資料並渲染+監聽
        mrtData.data.forEach((mrt) => {
          createMrtLiEl(mrt);
        });
        domList.indexContentMrtListComponentLoadingPlaceholderList.forEach(
          (el) => {
            el.remove();
          }
        );
      }
      if (Object.keys(attractionData).length > 0) {
        // nextPage變更
        nextPage = attractionData["nextPage"];
        // 畫面渲染
        createAttractionEl(attractionData["data"], false);
        domList.indexContentListComponentLoadingPlaceholder.forEach((el) => {
          el.remove();
        });
      }
      // 監聽最後一個node
      const indexContentAttraction = document.querySelectorAll(
        ".index-content-attraction"
      );
      if (indexContentAttraction) {
        const dom = indexContentAttraction[indexContentAttraction.length - 1];
        if (dom) {
          addObserver(dom, null);
        }
      }
    } else if (attractionRegex.test(currentUrl)) {
      // 如果載入的是單一景點頁面
      let id = currentUrl.match(attractionRegex)?.[1];
      let attractionData = await getApiData(`/api/attraction/${id}`);
      const attractionDomList = {
        attractionContentTitleOuter: document.querySelector(
          ".attraction-content-title-outer"
        ),
        attractionContentImg: document.querySelector(".attraction-content-img"),
        attractionContentBottom: document.querySelector(
          ".attraction-content-bottom"
        ),
        attractionContentSwiperPagination: document.querySelector(
          ".attraction-content-swiper-pagination"
        ),
        attractionContentSelectBtn: document.querySelector(
          ".attraction-content-select-btn"
        ),
        attractionContentPlaceholderImg: document.querySelector(
          ".attraction-content-placeholder-img"
        ),
      };
      attractionPage.init(attractionData?.["data"], attractionDomList);
      // createAttractionPageEl(attractionData?.["data"]);
      attractionContentSwiperPagination.firstChild.classList.add(
        "attraction-content-pagination-element-active"
      );
    } else if (currentUrl === "/booking") {
      if (!user.id) {
        window.location.href = "/";
      }
      const num = urlParms.get("number");
      const domList = {
        bookingInfoContainer: document.querySelector(".booking-info-container"),
        bookingConfirmTotal: document.querySelector(".booking-confirm-total"),
        bookingContact: document.querySelector(".booking-contact"),
        bookingPayment: document.querySelector(".booking-payment"),
        bookingConfirm: document.querySelector(".booking-confirm"),
        bookingContactName: document.querySelector(".booking-contact-name"),
        bookingContactEmail: document.querySelector(".booking-contact-email"),
        bookingContactPhonenum: document.querySelector(
          ".booking-contact-phonenum"
        ),
      };
      if (num) {
        await user.getOrderData(num);
        bookingSystem.showBooking("repay", domList, user);
      } else {
        await user.getBookingData();
        bookingSystem.showBooking(null, domList, user);
      }

      orderSyetem.init(user);
    } else if (currentUrl === "/thankyou") {
      const urlParms = new URLSearchParams(window.location.search);
      const num = urlParms.get("number");
      if (!num) {
        window.location.href = "/";
      }
      await user.getOrderData(num);
      if (Object.keys(user.order).length) {
        orderSyetem.renderThankYouPage(user.order);
      } else {
        window.location.href = "/";
      }
    } else if ((currentUrl = "/membercenter")) {
      if (!user.id) {
        window.location.href = "/";
      }
      await user.getAllOrderData();
      const userDomList = {
        memberCenterUserDataForm: document.querySelector(
          ".member-center-user-data-form"
        ),
        memberCenterUserDataMessage: document.querySelector(
          ".member-center-user-data-message"
        ),
        memberCenterBtn: document.querySelector(".member-center-btn"),
        memberCenterName: document.getElementById("memberCenterName"),
        memberCenterEmail: document.getElementById("memberCenterEmail"),
        memberCenterPhone: document.getElementById("memberCenterPhone"),
      };
      const orderDomList = {
        memberCenterOrderDataList: document.querySelector(
          ".member-center-order-data-list"
        ),
        memberCenterOrderDataListDefault: document.querySelector(
          ".member-center-order-data-list-default"
        ),
      };
      memberCenter.render(user, userDomList, user.order, orderDomList);

      userDomList.memberCenterBtn.addEventListener("click", (e) => {
        memberCenter.userDataBtnHandle(user, userDomList);
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

if (menuItemBooking) {
  menuItemBooking.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      let status = await new User().init();
      if (status?.id) {
        window.location.href = "/booking";
      } else {
        menuItemMember.click();
      }
    } catch (error) {
      console.log(error);
    }
  });
}

// 登入註冊按鈕
if (menuItemMember) {
  menuItemMember.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      let status = await signinCheck();
      if (status) {
        localStorage.removeItem("taipei_day_trip");
        window.location.replace(window.location.href);
      } else {
        const signinDom = document.querySelector(".member-signin");
        const signupDom = document.querySelector(".member-signup");
        const memberSigninCloseBtn = document.querySelector(
          ".member-signin-close-btn"
        );
        const memberSignupCloseBtn = document.querySelector(
          ".member-signup-close-btn"
        );
        const memberSignupGoBtn = document.querySelector(
          ".member-signup-go-btn"
        );
        const memberSigninGoBtn = document.querySelector(
          ".member-signin-go-btn"
        );
        const memberSigninSubmitBtn = document.querySelector(
          ".member-signin-submit-btn"
        );
        const memberSignupSubmitBtn = document.querySelector(
          ".member-signup-submit-btn"
        );
        const memberSigninForm = document.querySelector(".member-signin-form");
        const memberSignupForm = document.querySelector(".member-signup-form");
        const memberSigninMessage = document.querySelector(
          ".member-signin-message"
        );
        const memberSignupMessage = document.querySelector(
          ".member-signup-message"
        );
        memberModal.showModal(signinDom, memberSigninMessage);

        if (memberSignupGoBtn) {
          memberSignupGoBtn.addEventListener("click", (e) => {
            e.preventDefault();
            memberModal.hideModal(signinDom);
            memberModal.showModal(signupDom, memberSignupMessage);
          });
        }

        if (memberSigninGoBtn) {
          memberSigninGoBtn.addEventListener("click", (e) => {
            e.preventDefault();
            memberModal.hideModal(signupDom);
            memberModal.showModal(signinDom, memberSigninMessage);
          });
        }

        if (memberSigninCloseBtn) {
          memberSigninCloseBtn.addEventListener("click", (e) => {
            e.preventDefault();
            memberModal.hideModal(signinDom);
          });
        }

        if (memberSignupCloseBtn) {
          memberSignupCloseBtn.addEventListener("click", (e) => {
            e.preventDefault();
            memberModal.hideModal(signupDom);
          });
        }

        if (memberSigninSubmitBtn) {
          memberSigninSubmitBtn.addEventListener("click", async (e) => {
            const loadingDom =
              e.currentTarget.querySelector(".component-loading");
            await memberModal.formDataHandle(
              "signin",
              memberSigninForm,
              memberSigninMessage,
              loadingDom
            );
          });
        }

        if (memberSignupSubmitBtn) {
          memberSignupSubmitBtn.addEventListener("click", async (e) => {
            const loadingDom =
              e.currentTarget.querySelector(".component-loading");
            await memberModal.formDataHandle(
              "signup",
              memberSignupForm,
              memberSignupMessage,
              loadingDom
            );
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  });
}

if (menuItemMemberCenter) {
  menuItemMemberCenter.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      let status = await new User().init();
      if (status?.id) {
        window.location.href = "/membercenter";
      }
    } catch (error) {
      console.log(error);
    }
  });
}

if (headerMenuBtn) {
  headerMenuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    header.menu(headerMenuBtn);
  });
}

//mrt列往左按鈕
if (indexContentMrtLeft) {
  indexContentMrtLeft.addEventListener("click", (e) => {
    indexContentMrtList.scrollBy({
      left: -100,
      behavior: "smooth",
    });
  });
}

// mrt列往右按鈕
if (indexContentMrtRight) {
  indexContentMrtRight.addEventListener("click", (e) => {
    indexContentMrtList.scrollBy({
      left: 100,
      behavior: "smooth",
    });
  });
}

//banner搜尋按鈕
if (indexBannerSearchBtn) {
  indexBannerSearchBtn.addEventListener("click", async (e) => {
    let searchText = indexBannerSearch.value;
    if (!searchText) return;
    try {
      const result = await getApiData(
        `/api/attractions?page=0&keyword=${searchText}`
      );
      if (result) {
        // nextPage變更
        nextPage = result["nextPage"];
        // 畫面渲染
        createAttractionEl(result["data"], true);
      }
      // 監聽最後一個node
      const indexContentAttraction = document.querySelectorAll(
        ".index-content-attraction"
      );
      if (indexContentAttraction) {
        const dom = indexContentAttraction[indexContentAttraction.length - 1];
        if (dom) {
          addObserver(dom, searchText);
        }
      }
    } catch (error) {
      throw new Error(error.message);
    }
  });
}

if (attractionContentFormRadio) {
  attractionContentFormRadio.forEach((radio) => {
    radio.addEventListener("click", (e) => {
      if (e.target.value === "morning") {
        attractionContentFormPrice.textContent = "2000";
      } else {
        attractionContentFormPrice.textContent = "2500";
      }
    });
  });
}

if (attractionContentSwiperLeftBtn) {
  attractionContentSwiperLeftBtn.addEventListener("click", (e) => {
    const attractionContentSwiperOuter = document.querySelector(
      ".attraction-content-swiper-outer"
    );
    attractionContentSwiperOuter.scrollBy({
      left: -attractionContentSwiperOuter.offsetWidth,
      behavior: "smooth",
    });
    if (slideIndex > 0) {
      slideIndex--;
    }
    attractionContentSwiperPagination.childNodes.forEach((el, index) => {
      if (index === slideIndex) {
        el.classList.add("attraction-content-pagination-element-active");
      } else {
        el.classList.remove("attraction-content-pagination-element-active");
      }
    });
  });
}

if (attractionContentSwiperRightBtn) {
  attractionContentSwiperRightBtn.addEventListener("click", (e) => {
    const attractionContentSwiperOuter = document.querySelector(
      ".attraction-content-swiper-outer"
    );
    attractionContentSwiperOuter.scrollBy({
      left: attractionContentSwiperOuter.offsetWidth,
      behavior: "smooth",
    });
    if (attractionContentSwiperPagination.childNodes.length - 1 > slideIndex) {
      slideIndex++;
    }
    attractionContentSwiperPagination.childNodes.forEach((el, index) => {
      if (index === slideIndex) {
        el.classList.add("attraction-content-pagination-element-active");
      } else {
        el.classList.remove("attraction-content-pagination-element-active");
      }
    });
  });
}

if (attractionContentSelectBtn) {
  attractionContentSelectBtn.addEventListener("click", async (e) => {
    const loadingDom = e.currentTarget.querySelector(".component-loading");
    try {
      let status = await signinCheck();
      if (status) {
        let result = await attractionPage.formDataHandle(
          currentUrl,
          attractionContentForm,
          loadingDom
        );
        if (result?.["ok"]) {
          window.location.href = "/booking";
        }
      } else {
        menuItemMember.click();
      }
    } catch (error) {
      console.log(error);
    }
  });
}

if (bookingConfirmBtn) {
  bookingConfirmBtn.addEventListener("click", (e) => {
    const loadingDom = e.currentTarget.querySelector(".component-loading");
    const num = urlParms.get("number");
    orderSyetem.confirmClickHandle(loadingDom, num);
  });
}
