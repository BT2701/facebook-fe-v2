import {
  format,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInSeconds,
} from "date-fns";

export default function formatTimeFromDatabase(dateString) {
  const dbDate = new Date(dateString);
  const now = new Date();
  const diffInSeconds = differenceInSeconds(now, dbDate);
  const diffInMinutes = differenceInMinutes(now, dbDate);
  const diffInHours = differenceInHours(now, dbDate);
  const diffInDays = differenceInDays(now, dbDate);
  if (diffInSeconds < 60) {
    return diffInSeconds === 1
      ? "a second ago"
      : `${diffInSeconds} seconds ago`;
  } else if (diffInMinutes < 60) {
    return diffInMinutes === 1
      ? "a minute ago"
      : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? "an hour ago" : `${diffInHours} hours ago`;
  } else if (diffInDays < 7) {
    return diffInDays === 1 ? "a day ago" : `${diffInDays} days ago`;
  } else {
    return format(dbDate, "dd-MM-yyyy HH:mm:ss");
  }
}
