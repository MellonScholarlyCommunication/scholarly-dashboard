import React from 'react';
import '../../css/LoginComponent.css';

import { LoginButton } from '@solid/react';

function LoginComponent() {
  return (
    <div className="logincomponent">
      <div className="center">
        <LoginButton className="loginButton" popup="https://inrupt.net/common/popup.html">Login</LoginButton>
      </div>
    </div>
  );
}

export default LoginComponent;
