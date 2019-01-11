import React from 'react'
import AddTodo from '../container/AddTodo'
import AllTodo from '../container/AllTodo'
import TrashTodo from '../container/TrashTodo'
const App = () => (
  <div>
    <AddTodo />
    <AllTodo>
      <strong>
        全部列表
      </strong>
    </AllTodo>
    <TrashTodo>
      <strong>
        删除列表
      </strong>
    </TrashTodo>
  </div>
)

export default App
