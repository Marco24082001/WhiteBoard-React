import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useHistory, useParams } from 'react-router-dom';
import { AuthContext } from '../../helpers/AuthContext';
import isEmpty from 'validator/lib/isEmpty';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API}/users/`,
})

function Newpassword() {
  const [password, setPassword] = useState('');
  const [repeat_password, setRepeat_password] = useState('');
  const [validationMsg, setValidationMsg] = useState('');
  const { setAuthState } = useContext(AuthContext);
  const {token} = useParams();
  let history = useHistory();
  const validatePw = () => {
    const msg = {};
    if(password !== repeat_password){
      msg.repeat_password = 'Please re-enter a correct new password';
    }

    if(isEmpty(password)) {
      msg.password = 'Please input your new password';
    }

    if(isEmpty(repeat_password)){
      msg.repeat_password = 'Please input your repeat password';
    }

    setValidationMsg(msg);
    if(Object.keys(msg).length > 0) return false;
    return true;
  }

  const renew_password = () => {
    const isValid = validatePw();
    if(!isValid) return;
    const data = { password: password, token:token };
    api.post('new-password', data).then((res) => {
      if (res.data.error) {
        alert(res.data.error);
      } else {
        localStorage.setItem('accessToken', res.data);
        setAuthState(true);
        history.push('/');
      }
    });
  };

  return (
    <div className='login-container'>
      <div className='login-wrap'>
        <div className='login-html'>
          <input id='tab-1' type='radio' name='tab' className='sign-in' checked /><label for='tab-1' className='tab'>Forgot Password</label>
          <input id='tab-2' type='radio' name='tab' className='sign-up'/><label for='tab-2' className='tab'></label>
          <div className='login-form'>
            <div className='sign-in-htm'>
              <div className='group'>
                <label for='pass' className='label'>New password</label>
                <input id='pass' type='password' className='input' placeholder='Enter a new password' onChange={(event) => {setPassword(event.target.value)}}/>
                <p className='error-text'>{validationMsg.password}</p>
              </div>
              <div className='group'>
                <label for='pass' className='label'>Repeat new password</label>
                <input id='pass' type='password' className='input' onChange={(event) => {setRepeat_password(event.target.value)}}/>
                <p className='error-text'>{validationMsg.repeat_password}</p>
              </div>
              <div className='group'>
                <input type='submit' className='button' value='Renew password' onClick={renew_password}/>
              </div>
              <div className='hr'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Newpassword;

