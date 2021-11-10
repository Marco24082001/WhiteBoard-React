import "./App.css";
// import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Switch, Link, useHistory } from "react-router-dom";
// import Navbar from './components/Navbar';
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Forgot from "./pages/forgot/Forgot";
import Newpassword from "./pages/newpassword/Newpassword";
import Whiteboard from "./pages/whiteboard/Whiteboard";
import PageNotFound from "./pages/error/PageNotFound";
import OverloadPage from "./pages/error/OverloadPage";
import {io} from 'socket.io-client';
import { AuthContext } from "./helpers/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";
import { ReactComponent as CaretIcon } from './icons/caret.svg';
import Logo from './images/coding.png';
import Navbar from './components/Navbar/Navbar';
import NavItem from "./components/Navbar/NavItem";
import DropdownMenu from './components/Navbar/DropdownMenu'
const socket = io("http://localhost:8080");
function App() {
  const [authState, setAuthState] = useState({status: false, socket: socket});
  return (
    <div className="App">
      <AuthContext.Provider value={{ authState, setAuthState }}>
        <Router>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/login" exact component={Login} />
            <Route path="/login/:id" exact component={Login} />
            <Route path="/board/:id" exact component={Whiteboard} />
            <Route path="/reset/" exact component={Forgot} />
            <Route path="/reset/:token" exact component={Newpassword} />
            <Route path="/overload" exact component={OverloadPage} />
            <Route path="*" exact component={PageNotFound}/>
          </Switch>
        </Router>
      </AuthContext.Provider>
    </div>
  );
}
export default App;
