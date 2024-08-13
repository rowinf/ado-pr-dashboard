export function getBusinessHours(startDateUTC: Date, endDateUTC: Date) {
  const startHour = 9;
  const endHour = 17; // 5 PM
  const hoursPerDay = 8;

  // Convert UTC to Auckland time zone
  function convertToAucklandTime(date: Date) {
    return new Date(
      date.toLocaleString("en-US", { timeZone: "Pacific/Auckland" })
    );
  }

  // Helper functions
  function isBusinessDay(date: Date) {
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday to Friday
  }

  function getBusinessHoursInDay(date: Date) {
    const start = new Date(date);
    start.setHours(startHour, 0, 0, 0);
    const end = new Date(date);
    end.setHours(endHour, 0, 0, 0);

    if (date <= start) {
      return hoursPerDay; // Entire business day left
    }
    if (date >= end) {
      return 0; // No business hours left
    }

    return (end.valueOf() - date.valueOf()) / (1000 * 60 * 60); // Convert milliseconds to hours
  }

  function moveToNextBusinessDay(date: Date) {
    date.setHours(9, 0, 0, 0);
    date.setDate(date.getDate() + (date.getDay() === 5 ? 3 : 1)); // Skip to Monday if Friday
  }

  if (endDateUTC < startDateUTC) return 0;

  // Convert to Auckland time
  let startDate = convertToAucklandTime(startDateUTC);
  let endDate = convertToAucklandTime(endDateUTC);

  let totalBusinessHours = 0;
  let currentDate = new Date(startDate);

  // Traverse dates and sum business hours
  while (currentDate < endDate) {
    if (isBusinessDay(currentDate)) {
        // console.log(currentDate.toDateString(), startDate.toDateString())
      if (currentDate.toDateString() === startDate.toDateString()) {
        totalBusinessHours += getBusinessHoursInDay(currentDate);
      } else {
        totalBusinessHours += hoursPerDay;
      }
    }
    moveToNextBusinessDay(currentDate);
  }

  // Handle the last day separately if it's a business day
  if (isBusinessDay(endDate)) {
    const endOfDay = new Date(endDate);
    endOfDay.setHours(17, 0, 0, 0);
    if (endDate < endOfDay) {
      totalBusinessHours -= hoursPerDay - getBusinessHoursInDay(endDate);
    }
  }

  totalBusinessHours = Math.round(Math.min(totalBusinessHours, 40));

  return totalBusinessHours; // > 0 ? totalBusinessHours : 1;
}
