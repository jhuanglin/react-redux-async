import React from 'react'

class TodoList extends React.Component{
  render() {
    const { todos } = this.props
    const lis = todos.map((todo, ind) => {
      return (
        <li key={ind} onClick={() => this.props.handleTodo(todo.id)}>
          {todo.text}
        </li>
      )
    })

    return (
      <div>
        {this.props.children}
        <ul>
          {lis}
        </ul>
      </div>
    )
  }
}

export default TodoList
