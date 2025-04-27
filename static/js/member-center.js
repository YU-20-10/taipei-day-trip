import Time from "./classes/time.js";

function memberCenter() {
  const model = {
    getFormData: (dom) => {
      const rowFormData = new FormData(dom);
      const formData = Object.fromEntries(rowFormData);
      return formData;
    },
    userDataVilidation: (formData) => {
      const phoneReg = /^09[0-9]{8}/;
      const mailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
      let emptyCheck = false;
      let mailCheck = mailRegex.test(formData.memberCenterEmail);
      let phoneCheck = phoneReg.test(formData.memberCenterPhone);

      let valueArr = Object.values(formData);
      for (let i = 0; i < valueArr.length; i++) {
        if (!valueArr[i]) {
          emptyCheck = false;
          break;
        }
        emptyCheck = true;
      }
      if (emptyCheck && mailCheck && phoneCheck) {
        return { ok: true };
      } else if (!mailCheck) {
        return { ok: false, message: "信箱格式有誤" };
      } else if (!phoneCheck) {
        return { ok: false, message: "電話格式有誤" };
      } else if (!emptyCheck) {
        return { ok: false, message: "有欄位未填寫" };
      }
    },
    putUserFormData: async (formData) => {
      try {
        const token = localStorage.getItem("taipei_day_trip");
        const response = await fetch("/api/user/edit", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        return response.json();
      } catch (error) {
        throw error;
      }
    },
    orderDateCheck: (date) => {
      const time = new Time();
      const check = time.dateLaterThanNow(date);
      return check;
    },
  };
  const view = {
    renderUserData: (userData, domList) => {
      domList.memberCenterName.value = userData?.name;
      domList.memberCenterEmail.value = userData?.email;
      domList.memberCenterPhone.value = userData?.phone;
    },
    changeUserDataInputEnable: (domList) => {
      domList.memberCenterName.disabled = false;
      domList.memberCenterName.classList.remove(
        "member-center-form-input-disable"
      );
      domList.memberCenterEmail.disabled = false;
      domList.memberCenterEmail.classList.remove(
        "member-center-form-input-disable"
      );
      domList.memberCenterPhone.disabled = false;
      domList.memberCenterPhone.classList.remove(
        "member-center-form-input-disable"
      );
      domList.memberCenterBtn.textContent = "送出";
    },
    changeUserDataInputDisable: (domList) => {
      domList.memberCenterName.disabled = true;
      domList.memberCenterName.classList.add(
        "member-center-form-input-disable"
      );
      domList.memberCenterEmail.disabled = true;
      domList.memberCenterEmail.classList.add(
        "member-center-form-input-disable"
      );
      domList.memberCenterPhone.disabled = true;
      domList.memberCenterPhone.classList.add(
        "member-center-form-input-disable"
      );
      domList.memberCenterBtn.textContent = "編輯";
    },
    renderOrderData: (orderData) => {
      const classList = {
        card: ["card", "margin-b-lg"],
        "card-header": ["card-header"],
        "card-body": ["card-body"],
        "card-footer": ["card-footer"],
        "member-center-order-card-body-header": [
          "member-center-order-card-body-header",
        ],
        "member-center-order-card-content": [
          "member-center-order-card-content",
        ],
        "member-center-order-card-repay-link": [
          "member-center-order-card-repay-link",
        ],
        "member-center-order-card-repay-outer": [
          "member-center-order-card-repay-outer",
        ],
      };
      const li = document.createElement("li");
      const cardHeaderDiv = document.createElement("div");
      const cardHeaderP = document.createElement("p");
      const cardHeaderPText = document.createTextNode("訂單編號：");
      const cardHeaderSpan = document.createElement("span");
      const cardHeaderSpanText = document.createTextNode(
        `${orderData?.number}`
      );
      const cardHeaderPayP = document.createElement("p");
      const cardHeaderPayText = document.createTextNode(
        `${orderData?.status === 0 ? "付款成功" : "付款失敗"}`
      );
      const cardBodyDiv = document.createElement("div");
      const cardBodyP = document.createElement("p");
      const cardBodyPText = document.createTextNode("購買資訊");
      const cardBodyContentDiv = document.createElement("div");
      const cardBodyContentInnderDiv = document.createElement("div");
      const cardBodyContentProductP = document.createElement("p");
      const cardBodyContentProductPText =
        document.createTextNode("台北一日導覽");
      const cardBodyContentPlaceP = document.createElement("p");
      const cardBodyContentPlacePText = document.createTextNode("地點：");
      const cardBodyContentPlaceSpan = document.createElement("span");
      const cardBodyContentPlaceSpanText = document.createTextNode(
        `${orderData?.trip?.name}`
      );
      const cardBodyContentTimeP = document.createElement("p");
      const cardBodyContentTimePText = document.createTextNode("時間：");
      const cardBodyContentTimeSpan = document.createElement("span");
      const cardBodyContentTimeSpanText = document.createTextNode(
        `${orderData?.date} ${
          orderData?.time === "morning" ? "09:00-16:00" : "14:00-21:00"
        }`
      );
      const cardFooterDiv = document.createElement("div");
      const cardFooterP = document.createElement("p");
      const cardFooterPText = document.createTextNode("訂單金額：");
      const cardFooterSpan = document.createElement("span");
      const cardFooterSpanText = document.createTextNode(`${orderData?.price}`);
      const cardFooterRepayDiv = document.createElement("div");
      const cardFoorerA = document.createElement("a");
      let cardFoorerAText = document.createTextNode("重新付款");

      li.classList.add(...classList["card"]);
      cardHeaderDiv.classList.add(...classList["card-header"]);
      cardHeaderP.classList.add("fw-bold");
      cardHeaderSpan.classList.add("fw-regular");
      cardHeaderPayP.classList.add("fw-bold");
      cardHeaderPayP.classList.add(
        `${orderData?.status === 0 ? "c-cyan-70" : "c-red"}`
      );
      cardBodyDiv.classList.add(...classList["card-body"]);
      cardBodyP.classList.add(
        ...classList["member-center-order-card-body-header"]
      );
      cardBodyContentDiv.classList.add(
        ...classList["member-center-order-card-content"]
      );
      cardBodyContentProductP.classList.add("fw-medium");
      cardBodyContentPlaceP.classList.add("fw-medium");
      cardBodyContentTimeP.classList.add("fw-medium");
      cardBodyContentPlaceSpan.classList.add("fw-regular");
      cardBodyContentTimeSpan.classList.add("fw-regular");
      cardFooterDiv.classList.add(...classList["card-footer"]);
      cardFooterP.classList.add("fw-medium");
      cardFooterSpan.classList.add("fw-regular");
      cardFoorerA.classList.add(
        ...classList["member-center-order-card-repay-link"]
      );
      cardFooterRepayDiv.classList.add(
        ...classList["member-center-order-card-repay-outer"]
      );

      cardHeaderP.appendChild(cardHeaderPText);
      cardHeaderSpan.appendChild(cardHeaderSpanText);
      cardHeaderP.appendChild(cardHeaderSpan);
      cardHeaderPayP.appendChild(cardHeaderPayText);
      cardHeaderDiv.appendChild(cardHeaderP);
      cardHeaderDiv.appendChild(cardHeaderPayP);

      cardBodyContentProductP.appendChild(cardBodyContentProductPText);

      cardBodyContentPlaceP.appendChild(cardBodyContentPlacePText);
      cardBodyContentPlaceSpan.appendChild(cardBodyContentPlaceSpanText);
      cardBodyContentPlaceP.appendChild(cardBodyContentPlaceSpan);

      cardBodyContentTimeP.appendChild(cardBodyContentTimePText);
      cardBodyContentTimeSpan.appendChild(cardBodyContentTimeSpanText);
      cardBodyContentTimeP.appendChild(cardBodyContentTimeSpan);

      cardBodyContentInnderDiv.appendChild(cardBodyContentProductP);
      cardBodyContentInnderDiv.appendChild(cardBodyContentPlaceP);
      cardBodyContentInnderDiv.appendChild(cardBodyContentTimeP);
      cardBodyContentDiv.appendChild(cardBodyContentInnderDiv);
      cardBodyP.appendChild(cardBodyPText);

      cardBodyDiv.appendChild(cardBodyP);
      cardBodyDiv.appendChild(cardBodyContentDiv);

      cardFooterP.appendChild(cardFooterPText);
      cardFooterSpan.appendChild(cardFooterSpanText);
      cardFooterP.appendChild(cardFooterSpan);
      cardFooterDiv.appendChild(cardFooterP);

      const dateCheck = model.orderDateCheck(orderData?.date);
      if (orderData?.status !== 0) {
        console.log(dateCheck);
        if (!dateCheck) {
          cardFoorerAText = document.createTextNode("超過付款期限");
          cardFoorerA.classList.add(
            "member-center-order-card-repay-link-not-allow"
          );
          cardFooterRepayDiv.classList.add(
            "member-center-order-card-repay-no-hover"
          );
          cardFoorerA.appendChild(cardFoorerAText);
          cardFooterRepayDiv.appendChild(cardFoorerA);
          cardFooterDiv.appendChild(cardFooterRepayDiv);
        } else {
          cardFoorerA.appendChild(cardFoorerAText);
          cardFoorerA.href = `/booking?number=${orderData?.number}`;
          cardFooterRepayDiv.appendChild(cardFoorerA);
          cardFooterDiv.appendChild(cardFooterRepayDiv);
        }
      }

      li.appendChild(cardHeaderDiv);
      li.appendChild(cardBodyDiv);
      li.appendChild(cardFooterDiv);
      return li;
    },
  };
  const controller = {
    render: (userData, userDomList, allOrderData, orderDomList) => {
      view.renderUserData(userData, userDomList);
      if (allOrderData.length > 0) {
        orderDomList.memberCenterOrderDataListDefault.remove();
        allOrderData.forEach((order) => {
          const node = view.renderOrderData(order);
          orderDomList.memberCenterOrderDataList.appendChild(node);
        });
      }
    },
    userDataBtnHandle: async (userData, userDomList) => {
      userDomList.memberCenterUserDataMessage.textContent = "";
      if (userDomList.memberCenterName.disabled) {
        view.changeUserDataInputEnable(userDomList);
        return;
      }
      const formData = model.getFormData(userDomList.memberCenterUserDataForm);
      if (
        formData.memberCenterName === userData.name &&
        formData.memberCenterEmail === userData.email &&
        formData.memberCenterPhone === userData.phone
      ) {
        userDomList.memberCenterUserDataMessage.textContent = "資料未修改";
        setTimeout(() => {
          userDomList.memberCenterUserDataMessage.textContent = "";
        }, 1000);
        view.changeUserDataInputDisable(userDomList);
        return;
      }
      let checkResult = model.userDataVilidation(formData);
      if (checkResult["ok"]) {
        view.changeUserDataInputDisable(userDomList);
        const result = await model.putUserFormData(formData);
        if (result["data"]?.["ok"]) {
          userDomList.memberCenterUserDataMessage.textContent = "資料修改完成";
          setTimeout(() => {
            userDomList.memberCenterUserDataMessage.textContent = "";
          }, 1000);
        }
      } else {
        userDomList.memberCenterUserDataMessage.textContent =
          checkResult?.["message"];
      }
    },
  };
  return controller;
}

export default memberCenter();
