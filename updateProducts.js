import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // assuming default port
});

async function run() {
  try {
    const res = await api.get('/admin/products');
    const products = res.data.data.products || res.data.data;
    console.log(`Found ${products.length} products`);
    console.log(JSON.stringify(products.map(p => ({id: p._id, name: p.name})), null, 2));
  } catch (err) {
    console.error(err.message);
  }
}
run();
