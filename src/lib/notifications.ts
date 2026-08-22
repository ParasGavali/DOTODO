export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function sendNotification(title: string, body: string, icon?: string) {
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: icon || "/favicon.ico" });
  }
}

export function checkReminders(tasks: { title: string; reminderAt?: string; dueDate?: string; dueTime?: string }[]) {
  const now = new Date();
  tasks.forEach((task) => {
    if (task.reminderAt) {
      const reminderTime = new Date(task.reminderAt);
      const diff = Math.abs(reminderTime.getTime() - now.getTime());
      if (diff < 60000) {
        sendNotification("DOTODO Reminder", task.title);
      }
    }
  });
}
