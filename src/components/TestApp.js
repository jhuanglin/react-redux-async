import React from 'react'
import { fetchMockData } from '../actions'
import { connect } from 'react-redux'

class TestApp extends React.Component{
  componentWillMount() {
    const {fetchData} = this.props
    fetchData()
  }
  render () {
    return (
      <div>
        <p>{this.props.requestStatus ? '11': 'aa'}</p>
        <h2>hello world</h2>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    data: state.mockData,
    requestStatus: state.requestStatus
  }
}

const mapDispatchToProps = (dispatch) => ({
  fetchData: () => dispatch(fetchMockData())
})

export default connect(mapStateToProps, mapDispatchToProps)(TestApp)
