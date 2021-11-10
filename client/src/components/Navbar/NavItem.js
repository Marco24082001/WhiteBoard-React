// import React from 'react'
// import './style.css';
// import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
// import { useState, useEffect, useContext } from "react";
// import { useHistory } from "react-router-dom";
// import { AuthContext } from "../../helpers/AuthContext";
// import {io} from 'socket.io-client';


// function NavItem(props) {
//     const [open, setOpen] = useState(false);
//     let history = useHistory();
//     const { authState, setAuthState } = useContext(AuthContext);

//     const returnHome = () => {
//       authState.socket.disconnect();
//       setAuthState((previousState) => {
//         return {...previousState, socket: io("http://localhost:8080")}
//       })
//       history.push('/');
//     }
//     return (
//       <li className="nav-item">
//         {
//           props.icon && (
//             <>
//               <a className="icon-button" onClick={() => setOpen(!open)}>
//                 {props.icon}
//               </a>
//             </>
//           )
//         }
//         {
//           props.logo && (
//             <>
//               <img onClick={returnHome} src={props.logo} className="logo" alt=""/>
//             </>
//           )
//         }
//         {open && props.children}
//       </li>
//     );
//   }

// export default NavItem;