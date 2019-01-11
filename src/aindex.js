import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Link, NavLink } from 'react-router-dom'

function BE () {
  return (
    <Router>
      <div>
        <Links />
        <Route exact path="/" component={Home}></Route>
        <Route path="/about" component={About}></Route>
        <Route path="/topics" component={Topics}></Route>
      </div>
    </Router>
  )
}

function Links () {
  const links = ['home', 'about', 'topics']
  const lis = links.map((link, index) => {
    return (
      <li key={index}>
        <NavLink
        to={link === 'home' ? '/' : `/${link}`}
        activeStyle={{
          color: '#00f',
          textDecoration: 'none'
        }}
        >{link.toUpperCase()}</NavLink>
      </li>
    )
  })
  return (
    <div>
      <ul>
        {lis}
      </ul>
    </div>
  )
}

function Home (props) {
  console.log(props)
  return (
    <div>
      <h2>
        Home
      </h2>
    </div>
  )
}

function About () {
  return (
    <div>
      <h2>
        About
      </h2>
    </div>
  )
}
function Topics ({ match }) {
  console.log(match)
  return (
    <div>
      <h2>
        Topics
      </h2>
      <ul>
        <li>
          <Link to={`${match.url}/rendering`}>R</Link>
        </li>
        <li>
          <Link to={`${match.url}/components`}>C</Link>
        </li>
        <li>
          <Link to={`${match.url}/props`}>P</Link>
        </li>
      </ul>

      <Route path={`${match.url}/:topicId`} component={Topic}></Route>
      <Route
        exact
        path={`${match.url}`}
        render={() => <h3>Select a topic</h3>}
      ></Route>
    </div>
  )
}

function Topic({match}) {
  console.log(match)
  return (
    <div>
      <h3>
        { match.params.topicId }
      </h3>
    </div>
  )
}
ReactDOM.render(
  <BE />,
  document.getElementById('root')
)
