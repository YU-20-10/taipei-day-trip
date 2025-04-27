import loading from "./components/loading.js";

function orderSyetem() {
  let model = {
    sdkData: {
      id: 159827,
      key: "app_y49qBGz7d626KK5zAKsSvVHwXVyrzyLfOJkSbvv7c298EYEb15XwoCXKTv29",
    },
    cardDataCheck: false,
    userData: {},
    getFormData: function (dom) {
      let rowFormData = new FormData(dom);
      let formData = Object.fromEntries(rowFormData);
      return formData;
    },
    formDataVilidation: function (formData) {
      const phoneReg = /^09[0-9]{8}/;
      let phoneCheck = phoneReg.test(formData?.["phone"]);
      return phoneCheck ? true : false;
    },
    getPostOrderData: (mode, data) => {
      let orderData = {};
      if (mode === "repay") {
        orderData = {
          price: data.price,
          trip: {
            attraction: {
              id: data.trip.id,
              name: data.trip.name,
              address: data.trip.address,
              image: data.trip.image,
            },
            date: data.trip.date,
            time: data.trip.time,
          },
        };
      } else {
        orderData = {
          price: data.price,
          trip: {
            attraction: data.attraction,
            date: data.date,
            time: data.time,
          },
        };
      }
      return orderData;
    },
    postOrderData: async function (number, data) {
      let url = "/api/orders";
      if (number) {
        url = `/api/orders/${number}`;
      }
      try {
        const token = localStorage.getItem("taipei_day_trip");
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return response.json();
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    postRepayOrderData: async function (number, data) {
      try {
        const token = localStorage.getItem("taipei_day_trip");
        const response = await fetch(`/api/orders/${number}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return response.json();
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  };
  let view = {
    showErrorMsg: (message) => {
      const bookingConfirmErrorMsg = document.querySelector(
        ".booking-confirm-error-msg"
      );
      const p = document.createElement("p");
      const text = document.createTextNode(message);
      p.appendChild(text);
      bookingConfirmErrorMsg.appendChild(p);
    },
    hideErrorMsg: () => {
      const bookingConfirmErrorMsg = document.querySelector(
        ".booking-confirm-error-msg"
      );
      bookingConfirmErrorMsg.textContent = "";
    },
    renderOrder: (orderData, domList) => {
      domList.orderNumber.textContent = orderData.number;
      domList.orderPrice.textContent = orderData.price;
      domList.orderImg.style.background = `no-repeat center/cover url(${orderData.trip.image})`;
      domList.orderPlace.textContent = orderData.trip.name;
      domList.orderTime.textContent = `${orderData.trip.date} ${
        orderData.trip.time === "morning" ? "09:00-16:00" : "14:00-21:00"
      }`;
    },
  };
  let controller = {
    init: (userData) => {
      TPDirect.setupSDK(model.sdkData.id, model.sdkData.key, "sandbox");
      let fields = {
        number: {
          element: "#card-number",
          placeholder: "**** **** **** ****",
        },
        expirationDate: {
          element: "#card-expiration-date",
          placeholder: "MM / YY",
        },
        ccv: {
          element: "#card-ccv",
          placeholder: "ccv",
        },
      };
      TPDirect.card.setup({
        fields: fields,
        styles: {
          input: {
            color: "gray",
          },
          "input.ccv": {
            "font-size": "16px",
          },
          "input.expiration-date": {
            "font-size": "16px",
          },
          "input.card-number": {
            "font-size": "16px",
          },
          ":focus": {
            color: "black",
          },
          ".valid": {
            color: "green",
          },
          ".invalid": {
            color: "red",
          },
          "@media screen and (max-width: 400px)": {
            input: {
              color: "orange",
            },
          },
        },
      });
      TPDirect.card.onUpdate(controller.cardUpdateHandle);
      model.userData = userData;
    },
    cardUpdateHandle: (e) => {
      if (e.canGetPrime && !e.hasError && !e.status.number) {
        model.cardDataCheck = true;
      } else {
        model.cardDataCheck = false;
      }
    },
    confirmClickHandle: async (loadingDom, num) => {
      view.hideErrorMsg();
      const bookingContactForm = document.querySelector(
        ".booking-contact-form"
      );

      const contactData = model.getFormData(bookingContactForm);
      let formCheck = model.formDataVilidation(contactData);
      loading.show(loadingDom);
      const minLoading = 300;
      const delay = (time) =>
        new Promise((resolve) => setTimeout(resolve, time));
      const start = Date.now();
      try {
        if (!formCheck) {
          view.showErrorMsg("聯絡電話未輸入或輸入錯誤");
          return;
        }
        if (!model.cardDataCheck) {
          view.showErrorMsg("卡片資訊有誤，請確認後再送出");
          return;
        }
        if (formCheck && model.cardDataCheck) {
          let orderData = {};
          if (num) {
            orderData = model.getPostOrderData("repay", model.userData.order);
          } else {
            orderData = model.getPostOrderData("pay", model.userData.booking);
          }

          TPDirect.card.getPrime(async (result) => {
            const data = {
              prime: result["card"]["prime"],
              order: orderData,
              contact: contactData,
            };

            const res = await model.postOrderData(num, data);

            if (res?.data?.payment?.status === 0) {
              let apiUseTime = Date.now() - start;
              let waitTime = Math.max(0, minLoading - apiUseTime);
              await delay(waitTime);
              loading.hide(loadingDom);
              window.location.href = `/thankyou?number=${res?.data?.number}`;
            } else {
              alert("付款失敗,請確認信用卡號碼或卡片是否為可使用狀態");
            }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        let apiUseTime = Date.now() - start;
        let waitTime = Math.max(0, minLoading - apiUseTime);
        await delay(waitTime);
        loading.hide(loadingDom);
      }
    },
    renderThankYouPage: (orderData) => {
      const domList = {
        orderNumber: document.querySelector(".order-number"),
        orderPrice: document.querySelector(".order-price"),
        orderImg: document.querySelector(".order-img"),
        orderPlace: document.querySelector(".order-place"),
        orderTime: document.querySelector(".order-time"),
        thankyouContainer: document.querySelector(".thankyou-container"),
      };
      view.renderOrder(orderData, domList);
      domList.thankyouContainer.style.height = `${
        window.innerHeight - 63.2 - 113.2 - 40
      }px`;
      domList.thankyouContainer.classList.remove("thankyou-hide");
    },
  };
  return controller;
}

export default orderSyetem();
