import { users } from "./10_array_methods_project_3_data.js";

const activeUsers = users
  .filter((user) => user.isActive)
  .map((user) => ({
    uid: user.id,
    userName: user.name.toUpperCase(),
  }));

console.log(activeUsers);

const totalRevenue = users.reduce((total, user) => {
  const userTotal = user.purchases.reduce((sum, price) => sum + price, 0);
  return total + userTotal;
}, 0);

console.log(`Total Revenue: ${totalRevenue}`);

const spendingSummary = users.map((user) => {
  const totalSpent = user.purchases.reduce((sum, price) => sum + price, 0);
  return {
    id: user.id,
    name: user.name.toUpperCase(),
    totalSpent,
  };
});

console.log(spendingSummary);

const highValueCustomers = users
  .map((user) => {
    const totalSum = user.purchases.reduce((sum, price) => sum + price, 0);
    return {
      uid: user.id,
      username: user.name.toLowerCase(),
      totalSum,
    };
  })
  .filter((user) => user.totalSum >= 300);

console.log(highValueCustomers);
