function attractionPage() {
  let model = {
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
      const inputDate = new Date(date);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      inputDate.setHours(0, 0, 0, 0);
      if (now > inputDate) {
        return "請選取今天或之後的日期";
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
  let controller = {
    formDataHandle: async (url, dom) => {
      try {
        let formData = model.getFormData(url, dom);
        let check = model.dateCheck(formData.date);
        if (check) {
          alert(check);
          return;
        }
        let postResult = await model.postFormData(formData);
        return postResult;
      } catch (error) {
        console.log(error);
      }
    },
  };
  return controller;
}

export default attractionPage();
