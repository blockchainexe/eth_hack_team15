import React, { Component } from 'react'

class Dashboard extends Component {
  constructor(props, { authData }) {
    super(props)
    authData = this.props
    console.log(authData)
  }

  render() {
    const student = this.props.authData.balance > 0 ? <p>あなたは学生プランです</p> : <p>あなたは一般プランです</p>
    return(
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Dashboard</h1>
            <p><strong>ようこそ{this.props.authData.name}!</strong></p>
            {student}
          </div>
        </div>
      </main>
    )
  }
}

export default Dashboard
