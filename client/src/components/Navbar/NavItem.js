import React from 'react'
import './style.css';
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import { useState, useEffect } from "react";
function NavItem(props) {
    const [open, setOpen] = useState(false);
    return (
      <li className="nav-item">
        {
          props.icon && (
            <>
              <a className="icon-button" onClick={() => setOpen(!open)}>
                {props.icon}
              </a>
            </>
          )
        }
        {
          props.logo && (
            <>
              <Link to={'/'}><img src={props.logo} className="logo" alt=""/></Link> 
            </>
          )
        }
        {open && props.children}
      </li>
    );
  }

export default NavItem;