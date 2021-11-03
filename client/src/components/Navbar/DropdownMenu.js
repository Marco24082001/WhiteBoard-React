import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import './style.css';
import { AuthContext } from "../../helpers/AuthContext";
import { ReactComponent as LogIcon } from '../../icons/logout.svg';
function DropdownMenu() {
    let history = useHistory();
    const { setAuthState } = useContext(AuthContext);
    const logout = () => {
        localStorage.removeItem("accessToken")
        history.push("/login")
        setAuthState(false)
    }
    function DropdownItem(props) {
      return (
        <a onClick={props.func} className="menu-item">
          <span className="icon-button">{props.leftIcon}</span>
          {props.children}
          <span className="icon-right">{props.rightIcon}</span>
        </a>
      );
    }
  
    return (
      <div className="dropdown">
        <DropdownItem>My Profile</DropdownItem>
        <DropdownItem
            func = {logout}
            leftIcon={<LogIcon/>}>
            Log out
        </DropdownItem>
      </div>
    )
  }
  
  export default DropdownMenu;