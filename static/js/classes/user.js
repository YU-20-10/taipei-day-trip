class User {
  constructor() {
    this.id = null;
    this.name = null;
    this.email = null;
    this.phone = null;
    this.booking = {};
    this.order = {};
  }

  async init() {
    const userData = await this.fetchToGetData("getUserData", null);
    if (userData?.data) {
      this.id = userData.data.id;
      this.name = userData.data.name;
      this.email = userData.data.email;
      this.phone = userData.data.phone;
    }
    return this;
  }

  async getBookingData() {
    const bookingData = await this.fetchToGetData("getBookingData", null);
    this.booking = bookingData?.data || {};
  }

  async getOrderData(num) {
    const orderData = await this.fetchToGetData("getOrderData", num);
    this.order = orderData?.data || {};
    this.phone = orderData?.data?.contact?.phone || null;
  }

  async getAllOrderData() {
    const allOrderData = await this.fetchToGetData("getAllOrder", null);
    this.order = allOrderData?.data || {};
  }

  async fetchToGetData(mode, order_num) {
    let token = localStorage.getItem("taipei_day_trip");
    let url = "";
    switch (mode) {
      case "getUserData":
        url = "/api/user/auth";
        break;
      case "getBookingData":
        url = "/api/booking";
        break;
      case "getOrderData":
        url = `/api/orders/${order_num}`;
        break;
      case "getAllOrder":
        url = `/api/orders/all`;
        break;
    }
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export default User;
