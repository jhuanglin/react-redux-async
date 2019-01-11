import React from 'react'
import { connect } from 'react-redux'
import { addTodo } from '../actions'

class AddTodo extends React.Component {
  constructor(props) {
    super(props)
    this.input = null
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (e) {
    e.preventDefault()
    if (!this.input.value.trim()) {
      return
    }
    this.props.dispatch(addTodo(this.input.value))
    this.input.value = ''
  }

  render () {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <input ref={(el) => this.input = el}></input>
          <button type='submit'>
            Add Todo
          </button>
        </form>
      </div>
    )
  }
}

export default connect()(AddTodo)
