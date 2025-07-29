// queries/categoryQueries.js
const fetchAllCategories = `
  SELECT * FROM productcategory ORDER BY category_id;
`;

module.exports = {
  fetchAllCategories
};
