function bookingSystem() {
  let model = {
    getBookingData: async function () {
      let token = localStorage.getItem("taipei_day_trip");
      try {
        let response = await fetch("/api/booking", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.json();
      } catch (error) {
        throw error;
      }
    },
    deleteBookingData: async function () {
      let token = localStorage.getItem("taipei_day_trip");
      try {
        let response = await fetch("/api/booking", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        let result = await response.json();
        if (!result.ok) {
          alert("請重新登入後再試一次");
          window.location.replace("/");
        }
        return result;
      } catch (error) {
        throw error;
      }
    },
  };
  let view = {
    renderBookingCard: (data, userData, dom) => {
      const classList = {
        "booking-info-header": ["booking-info-header", "fz-4"],
        "booking-info-card": ["booking-info-card"],
        "booking-info-card-img": ["booking-info-card-img"],
        "booking-info-card-content": ["booking-info-card-content"],
        "booking-info-card-list": ["booking-info-card-list"],
        "booking-info-card-header": [
          "booking-info-card-header",
          "fw-bold",
          "c-cyan-70",
        ],
        "booking-info-card-list-item": ["booking-info-card-list-item"],
        "booking-info-del-btn": ["booking-info-del-btn"],
      };
      const h2 = document.createElement("h2");
      const cardDiv = document.createElement("div");
      const imgDiv = document.createElement("div");
      const cardContent = document.createElement("div");
      const cardContentUl = document.createElement("ul");
      const cardDelBtn = document.createElement("button");
      const cardHeaderLi = document.createElement("li");
      const cardDateLi = document.createElement("li");
      const cardDateSpan = document.createElement("span");
      const cardTimeLi = document.createElement("li");
      const cardTimeSpan = document.createElement("span");
      const cardPriceLi = document.createElement("li");
      const cardPriceSpan = document.createElement("span");
      const cardAddressLi = document.createElement("li");
      const cardAddressSpan = document.createElement("span");
      const delBtnImg = document.createElement("img");
      const h2Text = document.createTextNode(
        `您好，${userData["name"]}，待預訂的行程如下：`
      );
      const cardHeaderText = document.createTextNode(
        `台北一日遊：${data["attraction"]["name"]}`
      );
      const cardDate = document.createTextNode("日期：");
      const cardDateText = document.createTextNode(`${data["date"]}`);
      const cardTime = document.createTextNode("時間：");
      const cardTimeText = document.createTextNode(
        `${
          data["time"] === "morning"
            ? "早上 9 點到下午 4 點"
            : "下午 2 點到晚上 9 點"
        }`
      );
      const cardPrice = document.createTextNode("費用：");
      const cardPriceText = document.createTextNode(`${data["price"]}`);
      const cardAddress = document.createTextNode("地點：");
      const cardAddressText = document.createTextNode(
        `${data["attraction"]["address"]}`
      );
      h2.appendChild(h2Text);
      h2.classList.add(...classList["booking-info-header"]);
      cardDiv.classList.add(...classList["booking-info-card"]);
      imgDiv.classList.add(...classList["booking-info-card-img"]);
      imgDiv.style.background = `no-repeat center/cover url(${data["attraction"]["image"]})`;
      delBtnImg.src = "/static/img/delete-icon.svg";
      cardContent.classList.add(...classList["booking-info-card-content"]);
      cardContentUl.classList.add(...classList["booking-info-card-list"]);
      cardHeaderLi.classList.add(...classList["booking-info-card-header"]);
      cardDateLi.classList.add(...classList["booking-info-card-list-item"]);
      cardTimeLi.classList.add(...classList["booking-info-card-list-item"]);
      cardPriceLi.classList.add(...classList["booking-info-card-list-item"]);
      cardAddressLi.classList.add(...classList["booking-info-card-list-item"]);
      cardDelBtn.classList.add(...classList["booking-info-del-btn"]);
      cardHeaderLi.appendChild(cardHeaderText);

      cardDateSpan.appendChild(cardDateText);
      cardDateLi.appendChild(cardDate);
      cardDateLi.appendChild(cardDateSpan);

      cardTimeSpan.appendChild(cardTimeText);
      cardTimeLi.appendChild(cardTime);
      cardTimeLi.appendChild(cardTimeSpan);

      cardPriceSpan.appendChild(cardPriceText);
      cardPriceLi.appendChild(cardPrice);
      cardPriceLi.appendChild(cardPriceSpan);

      cardAddressSpan.appendChild(cardAddressText);
      cardAddressLi.appendChild(cardAddress);
      cardAddressLi.appendChild(cardAddressSpan);

      cardContentUl.appendChild(cardHeaderLi);
      cardContentUl.appendChild(cardDateLi);
      cardContentUl.appendChild(cardTimeLi);
      cardContentUl.appendChild(cardPriceLi);
      cardContentUl.appendChild(cardAddressLi);
      cardDelBtn.appendChild(delBtnImg);

      cardContent.appendChild(cardContentUl);
      cardContent.appendChild(cardDelBtn);

      cardDiv.appendChild(imgDiv);
      cardDiv.appendChild(cardContent);

      dom.appendChild(h2);
      dom.appendChild(cardDiv);
    },
    renderBookingText: (userData, dom) => {
      const classList = {
        "booking-info-header": ["booking-info-header", "fz-4"],
      };
      const h2 = document.createElement("h2");
      const p = document.createElement("p");
      const h2Text = document.createTextNode(
        `您好，${userData["name"]}，待預訂的行程如下：`
      );
      const pText = document.createTextNode("目前沒有任何待預定的行程");
      h2.appendChild(h2Text);
      p.appendChild(pText);
      h2.classList.add(...classList["booking-info-header"]);
      dom.appendChild(h2);
      dom.appendChild(p);
    },
  };
  let controller = {
    showBooking: async (domList, userData) => {
      try {
        let bookingData = await model.getBookingData();
        if (bookingData["data"]) {
          view.renderBookingCard(
            bookingData["data"],
            userData["data"],
            domList.bookingInfoContainer
          );
          domList.bookingContact.classList.remove("booking-hide");
          domList.bookingPayment.classList.remove("booking-hide");
          domList.bookingConfirm.classList.remove("booking-hide");
          domList.bookingConfirmTotal.textContent =
            bookingData["data"]["price"];
          controller.addClickListener("booking-info-del-btn");
        } else {
          view.renderBookingText(
            userData["data"],
            domList.bookingInfoContainer
          );

          domList.bookingInfoContainer.style.height = `${
            window.innerHeight - 63.2 - 113.2
          }px`;
        }
      } catch (error) {
        console.log(error);
      }
    },
    addClickListener: (className) => {
      let listener = document.querySelector(`.${className}`);
      listener.addEventListener("click", async (e) => {
        try {
          let result = await model.deleteBookingData();
          if (result["ok"]) {
            window.location.replace(window.location.href);
          }
        } catch (error) {
          console.log(error);
        }
      });
    },
  };
  return controller;
}

export default bookingSystem();
