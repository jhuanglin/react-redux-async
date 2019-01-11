import { connect } from 'react-redux'
import TodoList from '../components/TodoList'
import { delTodo } from '../actions'

const mapStateToProps = (state) => ({
  todos: state.todos.filter(t => !t.del)
})

const mapDispatchToProps = dispatch => ({
  handleTodo: id => {
    dispatch(delTodo(id))
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList)
