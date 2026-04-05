import { StrictMode, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import './index.css';
import SideBar from './components/SideBar.jsx';
import Header from './components/Header.jsx';
import { useSelector } from "react-redux";
import { store, persistor } from './store/store.js';
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

// Pages
import Login from './Pages/Login.jsx';
import Dashboard from './Pages/Dashboard.jsx';
import Users from './Pages/Users.jsx';
import UserDetail from './Pages/UserDetail.jsx';
import Products from './Pages/Products.jsx';
import AddEditProduct from './Pages/AddEditProduct.jsx';
import Categories from './Pages/Categories.jsx';
import Orders from './Pages/Orders.jsx';
import Blogs from './Pages/Blogs.jsx';
import Transactions from './Pages/Transactions.jsx';
import OrderDetail from './Pages/OrderDetail.jsx';
import ContactUs from './Pages/ContactUs.jsx';

const PrivateRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.token);
  return token ? children : <Navigate to="/login" replace />;
};

function Root() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const hideLayout = [
    '/login',
    '/signup',
  ].some(path => location.pathname.toLowerCase().startsWith(path));

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      {!hideLayout && (
        <SideBar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        {!hideLayout && (
          <Header
            onMenuClick={() => {
              if (window.innerWidth < 768) {
                setMobileOpen(!mobileOpen);
              } else {
                setCollapsed(!collapsed);
              }
            }}
          />
        )}

        <div className="flex-1 overflow-auto p-0">
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
            <Route path="/users/:id" element={<PrivateRoute><UserDetail /></PrivateRoute>} />
            <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
            <Route path="/products/add" element={<PrivateRoute><AddEditProduct /></PrivateRoute>} />
            <Route path="/products/edit/:slug" element={<PrivateRoute><AddEditProduct /></PrivateRoute>} />
            <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
            <Route path="/orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
            <Route path="/blogs" element={<PrivateRoute><Blogs /></PrivateRoute>} />
            <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
            <Route path="/contact-us" element={<PrivateRoute><ContactUs /></PrivateRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <Root />
        <ToastContainer position="top-right" autoClose={2500} />
      </BrowserRouter>
    </PersistGate>
  </Provider>
);
