'use strict';
import * as React from 'react';

class AboutContactUs extends React.Component {

  render() {
    return (
      <div className="mt-3">
        <p>
          &nbsp;&nbsp;Please contact us by email.
        </p>
        <p>
          &nbsp;&nbsp;Email: 
            <a href="mailto:myrecipemongo@gmail.com?Subject=MyRecipeMongo%20website">myrecipemongo@gmail.com</a>
        </p>
      </div>
    )
  }
}

export default AboutContactUs;
