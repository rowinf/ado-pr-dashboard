// Simple function that accepts two parameters and calculates
// the number of hours worked within that range
export function workingHoursBetweenDates(
  startDate: Date,
  endDate: Date,
  dayStart = 9,
  dayEnd = 18,
  includeWeekends = false,
): string {
  // Store minutes worked
  var minutesWorked = 0;

  // Validate input
  if (endDate < startDate) {
    return "0";
  }

  // Loop from your Start to End dates (by hour)
  var current = startDate;

  // Define work range
  var workHoursStart = dayStart;
  var workHoursEnd = dayEnd;

  // Loop while currentDate is less than end Date (by minutes)
  while (current <= endDate) {
    // Store the current time (with minutes adjusted)
    var currentTime = current.getHours() + current.getMinutes() / 60;

    // Is the current time within a work day (and if it
    // occurs on a weekend or not)
    if (
      currentTime >= workHoursStart &&
      currentTime < workHoursEnd &&
      (includeWeekends ? current.getDay() !== 0 && current.getDay() !== 6 : true)
    ) {
      minutesWorked++;
    }

    // Increment current time
    current.setTime(current.getTime() + 1000 * 60);
  }

  // Return the number of hours
  return (minutesWorked / 60).toFixed(2);
}

export const calculateWorkingHours = (startDate?: string, endDate?: string) => {
  if (startDate && endDate) {
    return Number(workingHoursBetweenDates(new Date(startDate), new Date(endDate)));
  }
  return 0;
};
