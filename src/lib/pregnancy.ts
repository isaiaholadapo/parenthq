export function getPregnancyStats(dueDateStr: string = "2026-12-05") {
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  
  // Strip time for accurate day calculation
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  
  const totalPregnancyDays = 280; // 40 weeks
  const daysPregnant = totalPregnancyDays - daysRemaining;
  
  const weeks = Math.floor(daysPregnant / 7);
  const days = daysPregnant % 7;
  
  const progressPercent = Math.min(100, Math.max(0, (daysPregnant / totalPregnancyDays) * 100));

  return {
    daysRemaining,
    daysPregnant,
    weeks,
    days,
    progressPercent,
  };
}

export const babySizes: Record<number, string> = {
  // Rough size approximations
  4: "Size of a Poppy Seed",
  5: "Size of a Sesame Seed",
  6: "Size of a Lentil",
  7: "Size of a Blueberry",
  8: "Size of a Raspberry",
  9: "Size of a Green Olive",
  10: "Size of a Prune",
  11: "Size of a Lime",
  12: "Size of a Plum",
  13: "Size of a Peach",
  14: "Size of a Lemon",
  15: "Size of an Apple",
  16: "Size of an Avocado",
  17: "Size of a Turnip",
  18: "Size of a Bell Pepper",
  19: "Size of an Heirloom Tomato",
  20: "Size of a Banana",
  21: "Size of a Carrot",
  22: "Size of a Spaghetti Squash",
  23: "Size of a Large Mango",
  24: "Size of an Ear of Corn",
  25: "Size of a Rutabaga",
  26: "Size of a Scallion",
  27: "Size of a Cauliflower",
  28: "Size of a Large Eggplant",
  29: "Size of a Butternut Squash",
  30: "Size of a Large Cabbage",
  31: "Size of a Coconut",
  32: "Size of a Jicama",
  33: "Size of a Pineapple",
  34: "Size of a Cantaloupe",
  35: "Size of a Honeydew Melon",
  36: "Size of a Romaine Lettuce",
  37: "Size of a Swiss Chard",
  38: "Size of a Leek",
  39: "Size of a Mini Watermelon",
  40: "Size of a Small Pumpkin",
};

export function getBabySize(week: number) {
  if (week < 4) return "Too small to see!";
  if (week > 40) return "Ready to arrive!";
  return babySizes[week] || "Unknown";
}

export function calculateBabyAge(actualBirthDateVal: Date | string) {
  const birthDate = new Date(actualBirthDateVal);
  const today = new Date();
  
  birthDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - birthDate.getTime();
  const daysOld = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (daysOld < 0) return "Not born yet!";
  if (daysOld === 0) return "Born Today!";
  if (daysOld < 14) return `${daysOld} Days Old`;
  
  const weeksOld = Math.floor(daysOld / 7);
  if (weeksOld < 12) return `${weeksOld} Weeks Old`;
  
  const monthsOld = Math.floor(daysOld / 30.44);
  if (monthsOld < 24) return `${monthsOld} Months Old`;
  
  return Math.floor(monthsOld / 12) + " Years Old";
}
