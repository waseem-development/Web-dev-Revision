import { users } from "./10_array_methods_project_3_data.js";

const activeUsers = users.filter(user => user.isActive).map(user => {
    return {
        uid: user.id,
        userName: user.name.toUpperCase()
    }
});
console.log(activeUsers);

const totalRevenue = users.reduce((total, user) => {
    const userTotal = user.purchases.reduce((sum, price) => {
        return sum + price
    }, 0);
    return userTotal
}, 0);
console.log(`Total Revenue: ${totalRevenue}`);
