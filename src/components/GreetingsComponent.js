import React from 'react';
import { withAuthorization, Name } from '@inrupt/solid-react-components';
 function getName() {
  // Declare a new state variable, which we'll call "count"
  return (
    <div>
      <Name src="[https://ruben.verborgh.org/profile/#me]"/>
    </div>
  );
}

export default withAuthorization(getName)