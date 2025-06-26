import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()

  const loginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().min(6, 'Min 6 characters').required('Required'),
  })

  const signupSchema = Yup.object().shape({
    name: Yup.string().min(2).required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().min(6).required('Required'),
  })

  const handleLogin = async (values) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', values)
      localStorage.setItem('token', res.data.token)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    }
  }

  const handleSignup = async (values) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', values)
      toast.success('Signup successful! You can now login')
      setIsLogin(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <motion.div
        className="bg-surface p-8 rounded-2xl shadow-xl w-full max-w-md text-white"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 rounded-l-xl ${isLogin ? 'bg-primary text-white' : 'bg-background text-gray-400'}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 rounded-r-xl ${!isLogin ? 'bg-primary text-white' : 'bg-background text-gray-400'}`}
            onClick={() => setIsLogin(false)}
          >
            Signup
          </button>
        </div>

        {isLogin ? (
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
          >
            {() => (
              <Form className="space-y-4">
                <div>
                  <label>Email</label>
                  <Field type="email" name="email" className="input" />
                  <ErrorMessage name="email" component="div" className="text-red-400 text-sm" />
                </div>
                <div>
                  <label>Password</label>
                  <Field type="password" name="password" className="input" />
                  <ErrorMessage name="password" component="div" className="text-red-400 text-sm" />
                </div>
                <button type="submit" className="bg-primary w-full py-2 rounded-xl mt-4 hover:bg-secondary transition">
                  Login
                </button>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={{ name: '', email: '', password: '' }}
            validationSchema={signupSchema}
            onSubmit={handleSignup}
          >
            {() => (
              <Form className="space-y-4">
                <div>
                  <label>Name</label>
                  <Field type="text" name="name" className="input" />
                  <ErrorMessage name="name" component="div" className="text-red-400 text-sm" />
                </div>
                <div>
                  <label>Email</label>
                  <Field type="email" name="email" className="input" />
                  <ErrorMessage name="email" component="div" className="text-red-400 text-sm" />
                </div>
                <div>
                  <label>Password</label>
                  <Field type="password" name="password" className="input" />
                  <ErrorMessage name="password" component="div" className="text-red-400 text-sm" />
                </div>
                <button type="submit" className="bg-primary w-full py-2 rounded-xl mt-4 hover:bg-secondary transition">
                  Sign Up
                </button>
              </Form>
            )}
          </Formik>
        )}
      </motion.div>
    </div>
  )
}
