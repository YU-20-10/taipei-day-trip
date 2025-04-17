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
    postOrderData: async function (data) {
      try {
        const token = localStorage.getItem("taipei_day_trip");
        const response = await fetch("/api/orders", {
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
    confirmClickHandle: async (e) => {
      view.hideErrorMsg();
      const bookingContactForm = document.querySelector(
        ".booking-contact-form"
      );
      const contactData = model.getFormData(bookingContactForm);
      let formCheck = model.formDataVilidation(contactData);

      if (!formCheck) {
        view.showErrorMsg("聯絡電話未輸入或輸入錯誤");
      }
      if (!model.cardDataCheck) {
        view.showErrorMsg("卡片資訊有誤，請確認後再送出");
      }
      if (formCheck && model.cardDataCheck) {
        TPDirect.card.getPrime(async (result) => {
          const data = {
            prime: result["card"]["prime"],
            order: {
              price: model.userData.booking.price,
              trip: {
                attraction: model.userData.booking.attraction,
                date: model.userData.booking.date,
                time: model.userData.booking.time,
              },
            },
            contact: contactData,
          };
          const res = await model.postOrderData(data);
          if (res?.data?.payment?.status === 0) {
            window.location.href = `/thankyou?number=${res?.data?.number}`;
          } else {
            alert("付款失敗", res?.data?.payment?.message);
          }
        });
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
