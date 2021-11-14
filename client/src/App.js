import './App.css';
// import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Switch, Link, useHistory } from 'react-router-dom';
// import Navbar from './components/Navbar';
import Home from './pages/home/Home';
import Login from './pages/login/Login';
import Forgot from './pages/forgot/Forgot';
import Newpassword from './pages/newpassword/Newpassword';
import Whiteboard from './pages/whiteboard/Whiteboard';
import PageNotFound from './pages/error/PageNotFound';
import OverloadPage from './pages/error/OverloadPage';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {io} from 'socket.io-client';
import { AuthContext } from './helpers/AuthContext';
import { useState, useEffect } from 'react';
const socket = io(`${process.env.REACT_APP_API}`);
function App() {
  const [authState, setAuthState] = useState({status: false, socket: socket});
  return (
    <div className='App'>
      <ToastContainer />
      <AuthContext.Provider value={{ authState, setAuthState }}>
        <Router>
          <Switch>
            <Route path='/' exact component={Home} />
            <Route path='/login' exact component={Login} />
            <Route path='/login/:id' exact component={Login} />
            <Route path='/board/:id' exact component={Whiteboard} />
            <Route path='/reset/' exact component={Forgot} />
            <Route path='/reset/:token' exact component={Newpassword} />
            <Route path='/overload' exact component={OverloadPage} />
            <Route path='*' exact component={PageNotFound}/>
          </Switch>
        </Router>
      </AuthContext.Provider>
    </div>
  );
}
export default App;
