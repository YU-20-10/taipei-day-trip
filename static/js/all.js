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

let nextPage = 0;
let timeout = 0;
let isLoading = false;

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
}

function createAttractionEl(attractionData) {
  const classObj = {
    "card-img": ["card-img"],
    "card-title": ["card-title", "c-white"],
    "card-text": ["card-text", "c-gray-50"],
    card: ["card", "index-content-attraction"],
  };
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
  li.appendChild(a);
  return li;
}

// 畫面滾動時觸發
async function scrollFn(keyword, id) {
  // 確定settimeout是否已經跑完，如果還沒return
  // 確認資料是否為載入中，如果載入中則拒絕下一次請求
  if (timeout ||  isLoading) return;
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
    nextPage = nextData["nextPage"];
  }
  timeout = setTimeout(() => {
    if (nextData) {
      nextData["data"].forEach((attraction) => {
        let insertNode = createAttractionEl(attraction);
        indexContentList.append(insertNode);
      });
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
    clearTimeout(timeout);
    timeout = 0;
    isLoading = false;
  }, 200);
}

// 偵測指定dom元素
function addObserver(dom, keyword) {
  let id = dom.dataset.id;
  function listenerFn() {
    return scrollFn(keyword, id)
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
    const mrtData = await getApiData("/api/mrts");
    const attractionData = await getApiData("/api/attractions?page=0");
    if (mrtData) {
      // 取得mrt資料並渲染
      mrtData.data.forEach((mrt) => {
        createMrtLiEl(mrt);
      });
      const indexContentMrtLink = document.querySelectorAll(
        ".index-content-mrt-link"
      );
      if (indexContentMrtLink) {
        indexContentMrtLink.forEach((link) => {
          // 監聽mrt列表是否被點擊
          link.addEventListener("click", async (e) => {
            e.preventDefault();
            let insertNode = [];
            indexBannerSearch.value = link.dataset.mrt;
            const targetAttraction = await getApiData(
              `/api/attractions?page=0&keyword=${link.dataset.mrt}`
            );
            if (targetAttraction) {
              // nextPage變更
              nextPage = targetAttraction["nextPage"];
              // 畫面渲染
              targetAttraction["data"].forEach((el) => {
                let node = createAttractionEl(el);
                insertNode.push(node);
              });
              indexContentList.replaceChildren(...insertNode);
            }
            // 監聽最後一個node
            const indexContentAttraction = document.querySelectorAll(
              ".index-content-attraction"
            );
            if (indexContentAttraction) {
              const dom =
                indexContentAttraction[indexContentAttraction.length - 1];
              if (dom) {
                addObserver(dom, link.dataset.mrt);
              }
            }
          });
        });
      }
    }
    if (attractionData) {
      // nextPage變更
      nextPage = attractionData["nextPage"];
      attractionData["data"].forEach((attraction) => {
        // 取得attraction資料並渲染
        let insertNode = createAttractionEl(attraction);
        indexContentList.append(insertNode);
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
  } catch (error) {
    throw new Error(error.message);
  }
});

//

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
    let insertNode = [];
    try {
      const result = await getApiData(
        `/api/attractions?page=0&keyword=${searchText}`
      );
      if (result) {
        // nextPage變更
        nextPage = result["nextPage"];
        result["data"].forEach((attraction) => {
          let node = createAttractionEl(attraction);
          insertNode.push(node);
        });
        indexContentList.replaceChildren(...insertNode);
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
