import { useFormik } from 'formik';
import { useNavigate } from 'react-router';
import * as Yup from 'yup';
import useAuth from '../Hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const validationSchema = Yup.object({
    email: Yup.string()
      .required('Username is required'),
    password: Yup.string()
      .required('Password is required'),
    remember: Yup.boolean()
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',    },
    validationSchema,
    onSubmit: async (values) => {
        const resp = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values)
        });

        if(resp.ok){
          const data = await resp.json();
          const { user } = data;
          sessionStorage.setItem('Authorization', user.accessToken);
          auth.setAccessToken(user.accessToken);
          navigate('/upload')
        }

    }
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Or <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">create a new account</a>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="text"
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
                  type="password"
                  autoComplete="current-password"
                  {...formik.getFieldProps('password')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {formik.touched.password && formik.errors.password ? (
                  <div className="mt-1 text-sm text-red-600">{formik.errors.password}</div>
                ) : null}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  {...formik.getFieldProps('remember')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remember" className="block ml-2 text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;