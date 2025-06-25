const getPlatformStatsQuery = `
  SELECT 
    (SELECT COUNT(*) FROM product WHERE isapproved = TRUE) AS total_products,
    (SELECT COUNT(*) FROM purchase) AS total_deals,
    (SELECT COUNT(*) FROM "User") AS total_users;
`;
//export
module.exports = { getPlatformStatsQuery };
