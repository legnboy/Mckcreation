import './App.css'
import { 
  Route, 
  createBrowserRouter, 
  createRoutesFromElements, 
  RouterProvider 
} from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import ShoppingPage from './pages/ShoppingPage'
import ContactPage from './pages/ContactPage'
import AccountPage from './pages/AccountPage'
import AccountLayout from './layouts/AccountLayout'
import AccountSettingsPage from './pages/AccountSettingsPage'
import NotFoundPage from './pages/NotFoundPage'
import PaymentHistoryPage from './pages/PaymentHistoryPage'
import ShoppingCartPage from './pages/ShoppingCartPage'
import { useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import ItemFormPage from './pages/ItemFormPage'
import UpdateItemForm from './components/forms/UpdateItemForm'
import PortfolioPage from './pages/PortfolioPage'
import RegisterUserPage from './pages/RegisterUserPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import CreateOrderFormPage from './pages/CreateOrderFormPage'
import CheckoutPage from './pages/CheckoutPage'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import ForbiddenPage from './pages/ForbiddenPage'
import AdminPage from './pages/AdminPage'
import SalesSummaryPage from './pages/SalesSummaryPage'

function App() {

  const jwt = localStorage.getItem('jwt')
  const stripeKey = loadStripe("pk_test_51NcYrsEiypvGVayro5rvWMvgPNeOEAOIvxYRx5hfksFXJeV2pPUcDZtlrCeHT6Ds4CW5bDc5azrj8CCvPF2yxHd600ETzXz5Oh")

  useEffect(() => {
    if(!jwt) {
      return
    }

    const decodedToken = jwtDecode(jwt)
    const currentTime = Date.now() / 1000;

    if(decodedToken.exp < currentTime) {
      localStorage.removeItem('jwt')
      window.location.reload()
    }
  }, [])

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<MainLayout />}>
        <Route path='*' element={<NotFoundPage />} />
        <Route path='/forbidden' element={<ForbiddenPage />} />
        <Route index element={<HomePage />} />
        <Route path='/shop' element={<ShoppingPage />} />
        <Route path='/shop/item/form' element={<ItemFormPage />} /> {/* ADMIN */ }
        <Route path='/shop/custom-form' element={<CreateOrderFormPage />} />
        <Route path='/shop/item/update-form' element={<UpdateItemForm />} /> {/* ADMIN */ }
        <Route path='/contact' element={<ContactPage />} />
        <Route path='/account/login' element={<AccountPage />} />
        <Route path='/account/register' element={<RegisterUserPage />} />
        <Route path='/account/reset' element={<ResetPasswordPage /> } />
        <Route path='/account/cart' element={<ShoppingCartPage />} />
        <Route path='/account/cart/checkout' element={<CheckoutPage />} />
        <Route path='/portfolio' element={<PortfolioPage />} />

        <Route path="/account" element={<AccountLayout />}>
          <Route path='/account/settings' element={<AccountSettingsPage />} />
          <Route path='/account/payment-history' element={<PaymentHistoryPage />} />
          <Route path='/account/admin' element={<AdminPage />} />
          <Route path='/account/sales' element={<SalesSummaryPage />} />
        </Route>
      </Route>
    )
  )

  return (
    <Elements stripe={stripeKey}>
      <RouterProvider router={router} />
    </Elements>
  )
}

export default App;