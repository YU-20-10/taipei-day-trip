class Time {
  dateLaterThanNow(date) {
    const inputDate = new Date(date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);
    return inputDate > now ? true : false;
  }
}

export default Time;
