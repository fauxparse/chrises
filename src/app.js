import React, { Component } from 'react'
import Configuration from './configuration'
import Visualisation from './visualisation'
import './app.css'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      configuration: {
        statistic: 'count',
        group: 'gender'
      }
    }
  }

  render() {
    const { configuration } = this.state

    return (
      <div className="application">
        <Visualisation configuration={configuration} />
        <Configuration
          configuration={configuration}
          onChange={configuration => this.setState({ configuration })}
        />
        <footer />
      </div>
    )
  }
}

export default App
