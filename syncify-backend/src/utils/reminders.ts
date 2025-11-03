export interface Reminder {
  id: string;
  when: string; // ISO datetime
  message: string;
}

export async function scheduleReminder(reminder: Reminder) {
  // Replace with real scheduler
  console.log('Scheduling reminder', reminder);
}


