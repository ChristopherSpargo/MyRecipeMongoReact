import * as React from 'react';
import { observer } from 'mobx-react';
import HomeComponent from './home/HomeComponent';

@observer
class App extends React.Component {
  render() {
    return (
      <div>
        <HomeComponent/>
      </div>
    );
  }
}

export default App;
