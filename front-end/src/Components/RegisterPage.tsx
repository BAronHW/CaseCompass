import { useFormik } from 'formik';
import { useNavigate } from 'react-router';
import * as Yup from 'yup';

export default function RegisterPage() {
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
  });

  const navigate = useNavigate();

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const resp = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
      }) 

      if(resp.ok){
        navigate('/login')
      }
    }
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account? <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Sign in</a>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  {...formik.getFieldProps('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {formik.touched.name && formik.errors.name ? (
                  <div className="mt-1 text-sm text-red-600">{formik.errors.name}</div>
                ) : null}
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  {...formik.getFieldProps('email')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="mt-1 text-sm text-red-600">{formik.errors.email}</div>
                ) : null}
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  {...formik.getFieldProps('password')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {formik.touched.password && formik.errors.password ? (
                  <div className="mt-1 text-sm text-red-600">{formik.errors.password}</div>
                ) : null}
              </div>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}