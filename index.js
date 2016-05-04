import { createDevTools } from 'redux-devtools'
import LogMonitor from 'redux-devtools-log-monitor'
import DockMonitor from 'redux-devtools-dock-monitor'

import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

import { combineReducers, createStore, applyMiddleware, compose } from 'redux'
import { Provider, connect } from 'react-redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'

import { Link, Router, Route, IndexRoute, browserHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

import fetch from 'isomorphic-fetch'

import {
  PageHeader,
  Nav,
  NavItem,
  Button
} from 'react-bootstrap'

// styles
const Styles = {
  container: {
    border: 'solid black 1px',
    padding: '10px',
    margin: '10px'
  }
}

/* counter */
class Counter extends Component {
  render(){
    const { value, onIncreaseClick } = this.props;
    return (
      <div style={Styles.container}>
        <h3>Counter Component</h3>
        <div>{value}</div>
        <Button onClick={onIncreaseClick}>add 1</Button>
      </div>
    );
  }
}

// action(s)
const increaseAction = {type: 'increase'};

// reducer(s)
function counter(state={count: 0}, action) {
  let count = state.count;
  switch(action.type){
    case 'increase':
      return {count: count+1};
    default:
      return state;
  }
}

// map state to props
function mapStateToProps(state)  {
  return {
    value: state.count
  };
}

// map actions to props
function mapDispatchToProps(dispatch) {
  return {
    onIncreaseClick: () => dispatch(increaseAction)
  };
}

// container
let CounterContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Counter);

/* --- */

const OPENWEATHERMAP_API_KEY = '747bd17befc126e49cac06af7840760c'

const weatherURLForZip = (zip) => `http://api.openweathermap.org/data/2.5/weather?zip=${zip},us&units=imperial&APPID=${OPENWEATHERMAP_API_KEY}`

function weather(state = {}, action) {
  switch (action.type) {
    case 'REQUEST_WEATHER':
      return Object.assign({}, state, {
        isFetching: true,
      })
    case 'RECEIVE_WEATHER':
      return Object.assign({}, state, {
        isFetching: false,
        temperature: action.temperature
      })
    default:
      return state
  }
}

const requestWeather = (zip) => ({
  type: 'REQUEST_WEATHER',
  zip
})

const receiveWeather = (zip, json) => ({
  type: 'RECEIVE_WEATHER',
  zip,
  temperature: json.main.temp,
  receivedAt: Date.now()
})

const fetchWeather = (zip) => {
  return dispatch => {
    dispatch(requestWeather(zip))
    return fetch(weatherURLForZip(zip))
      .then(response => response.json())
      .then(json => dispatch(receiveWeather(zip, json)))
  }
}

class WeatherComponent extends Component {

  constructor(props) {
    super(props)
    //this.handleChange = this.handleChange.bind(this)
    this.handleRefreshClick = this.handleRefreshClick.bind(this)
  }

  componentDidMount() {
    const { zip, dispatch } = this.props
    dispatch(fetchWeather(zip))
  }

  handleRefreshClick(e) {
    e.preventDefault()
    const { dispatch, zip } = this.props
    dispatch(fetchWeather(zip))
  }

  render() {
    const {zip, temperature, isFetching} = this.props;
    return (
      <div style={Styles.container}>
        <h3>WeatherComponent</h3>
        <p style={{opacity: (isFetching ? '0.5' : '1.0')}}>
          current temperature for <em>{zip}</em> is {temperature}
        </p>
        <Button onClick={this.handleRefreshClick}>refresh</Button>
      </div>
    )
  }

}

WeatherComponent.propTypes = {
  zip: PropTypes.string.isRequired,
  temperature: PropTypes.number.isRequired,
  isFetching: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired
}

const WeatherContainer = connect(
  (state) => state.weather
)(WeatherComponent);

const Header = ({title}) => (
  <h1>{title}</h1>
)

const HomeComponent = () => (
  <p>Welcome to the <strong>react-redux-playground</strong></p>
)


class App extends Component {

  constructor(props) {
    super(props)
    this.selectSection = this.selectSection.bind(this);
  }

  selectSection(key) {
    browserHistory.push(key);
  }

  render() {
    const { children } = this.props;
    return (
      <div>
        <PageHeader>react-redux-playground</PageHeader>
        <Nav ref="nav" bsStyle="tabs" onSelect={this.selectSection}>
          <NavItem eventKey={'/'} title="Home">Home</NavItem>
          <NavItem eventKey={'/counter'} title="Counter">Counter</NavItem>
          <NavItem eventKey={'/weather'} title="Weather">Weather</NavItem>
        </Nav>
        <div style={{ marginTop: '1.5em' }}>{children}</div>
      </div>
    );
  }
}

// redux-devtools
const DevTools = createDevTools(
  <DockMonitor toggleVisibilityKey="ctrl-h" changePositionKey="ctrl-q">
    <LogMonitor theme="tomorrow" preserveScrollTop={false} />
  </DockMonitor>
)

const enhancer = compose(
  // Middleware you want to use in development:
  applyMiddleware(
    thunk,
    createLogger()
  ),
  // Required! Enable Redux DevTools with the monitors you chose
  DevTools.instrument()
);

// store
const INITIAL_STATE = {
  weather: {
    isFetching: false,
    zip: '19446',
    temperature: 0
  }
};

let store = createStore(
  combineReducers({
    counter,
    weather,
    routing: routerReducer
  }), INITIAL_STATE, enhancer);

const history = syncHistoryWithStore(browserHistory, store)

// render with routing
ReactDOM.render(
  <Provider store={store}>
    <div>
      <Router history={history}>
        <Route path="/" component={App}>
          <IndexRoute component={HomeComponent}/>
          <Route path="counter" component={CounterContainer} />
          <Route path="weather" component={WeatherContainer} />
        </Route>
      </Router>
      <DevTools />
    </div>
  </Provider>,
  document.getElementById('root')
);
