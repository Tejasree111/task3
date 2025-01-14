const productQueries = require('./product.queries');

// Fetch all products
const getProducts = async (req, res) => {
  try {
    const products = await productQueries.getAllProducts();
    console.log(products);
    res.status(200).json(products); // Send the products as a response
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error retrieving products', error });
  }
};

module.exports = {
  getProducts,
};
