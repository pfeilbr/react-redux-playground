import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { combineReducers, createStore, applyMiddleware } from 'redux'
import { Provider, connect } from 'react-redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import { Link, Router, Route, browserHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
import fetch from 'isomorphic-fetch'

const Styles = {
  container: {
    border: 'solid black 1px',
    padding: '10px',
    margin: '10px'
  }
}

// React component
class Counter extends Component {
  render(){
    const { value, onIncreaseClick } = this.props;
    return (
      <div style={Styles.container}>
        <h3>Counter Component</h3>
        <div>{value}</div>
        <button onClick={onIncreaseClick}>add 1</button>
      </div>
    );
  }
}

// Action:
const increaseAction = {type: 'increase'};

// Reducer:
function counter(state={count: 0}, action) {
  let count = state.count;
  switch(action.type){
    case 'increase':
      return {count: count+1};
    default:
      return state;
  }
}

// Map Redux state to component props
function mapStateToProps(state)  {
  return {
    value: state.count
  };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
  return {
    onIncreaseClick: () => dispatch(increaseAction)
  };
}

// Connected Component:
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
        <button onClick={this.handleRefreshClick}>refresh</button>
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

const App = ({ children }) => (
  <div>
    <Header title="react-redux-playground" />

      <header>
              Links:
              {' '}
              <Link to="/">Home</Link>
              {' '}
              <Link to="/counter">Counter</Link>
              {' '}
              <Link to="/weather">Weather</Link>
    </header>

    <div>
      <button onClick={() => browserHistory.push('/weather')}>Go to /weather</button>
    </div>

    <div style={{ marginTop: '1.5em' }}>{children}</div>

  </div>
)

// store
let store = createStore(
  combineReducers({
    counter,
    weather,
    routing: routerReducer
  }), {
  weather: {
    isFetching: false,
    zip: '19446',
    temperature: 0
  }
}, applyMiddleware(thunk, createLogger()));

const history = syncHistoryWithStore(browserHistory, store)

// render
ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
        <Route path="counter" component={CounterContainer} />
        <Route path="weather" component={WeatherContainer} />
      </Route>
    </Router>

  </Provider>,
  document.getElementById('root')
);
