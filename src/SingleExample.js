import React from 'react';
import { v4 } from 'uuid';
import { Input, Card, Box, FlexList } from '@procore/core-react';
import { types, onSnapshot, flow } from "mobx-state-tree"
import { observer } from "mobx-react"
import { asReduxStore, connectReduxDevtools } from "mst-middlewares"

const post = (url, payload) => new Promise((resolve) =>
  setTimeout(() => {
    const mockResponse = { status: 200, body: { item: payload } }
    console.log('post::', url, mockResponse)
    resolve(mockResponse)
  }, 500)
)

const del = (url) => new Promise((resolve) =>
  setTimeout(() => {
    const mockResponse = { status: 200, body: { item: { _deleted: true } } }
    console.log('del::', url, mockResponse)
    resolve(mockResponse)
  }, 500)
)

export const TodoModel = types
  .model("Todo", {
    id: types.identifier,
    title: types.string,
    endpoint: types.string,
    status: types.optional(
      types.enumeration("Status", ["IN_PROGRESS", "COMPLETE"]),
      'IN_PROGRESS'
    ),
    description: types.optional(types.string, ''),
    state: types.optional(
      types.enumeration("State", ["LOADING", "DONE", "ERROR"]),
      'DONE'
    ),
  })

export const Todo = TodoModel.actions(todo => ({
    updateTitle: flow(function* (title) {
      todo.state = "LOADING"
      try {
        const updated = yield post(todo.endpoint, { title })
        todo.title = title
        todo.state = "DONE"
      } catch (e) {
        todo.errors = e;
        todo.state = "ERROR"
      }
    }),
    updateStatus: flow(function* (status) {
      todo.state = "LOADING"
      try {
        const updated = yield post(todo.endpoint, { status })
        todo.status = status
        todo.state = "DONE"
      } catch (e) {
        todo.errors = e;
        todo.state = "ERROR"
      }
    }),
    updateDescription: flow(function* (description) {
      todo.state = "LOADING"
      try {
        const updated = yield post(todo.endpoint, { description })
        todo.description = description
        todo.state = "DONE"
      } catch (e) {
        todo.errors = e;
        todo.state = "ERROR"
      }
    }),
  }));

const DUMMY_ID = v4()

const store = Todo.create({
  id: DUMMY_ID,
  endpoint: `/todos/${DUMMY_ID}`,
  title: '',
  status: 'IN_PROGRESS',
  description: '',
  state: "DONE",
})

const TodoItem = ({
  title = 'Create Mock APIs',
  status = 'IN_PROGRESS',
  description = 'Mock APIs for state management.',
  actions: { updateStatus }
}) => (
  <Card>
    <Card.TipHeader
      style={{
        backgroundColor: status === 'IN_PROGRESS'
          ? 'papayawhip'
          : 'mediumspringgreen'
      }}
      onClick={() =>
        status === 'IN_PROGRESS'
          ? updateStatus('COMPLETE')
          : updateStatus('IN_PROGRESS')
      }
    >
      <Card.TipHeaderContent>
        <Card.TipHeaderTitle>{title}</Card.TipHeaderTitle>
      </Card.TipHeaderContent>
    </Card.TipHeader>
    <Box padding="xl">
      <p>{description}</p>
    </Box>
  </Card>
);

// const StandaloneTodoItem = observer(TodoItem);
const StandaloneTodoItem = TodoItem;

const SingleExample = ({ todo, actions }) => (
  <FlexList>
    <FlexList direction="column">
      <Input
        placeholder="Title"
        onBlur={({ target }) => actions.updateTitle(target.value)}
        defaultValue={todo.title}
      />
      <Input
        placeholder="Description"
        onBlur={({ target }) => actions.updateDescription(target.value)}
        defaultValue={todo.description}
      />
    </FlexList>
    <StandaloneTodoItem
      title={todo.title}
      description={todo.description}
      status={todo.status}
      actions={actions}
    />
  </FlexList>
);

const FCompose = observer(SingleExample);

export default ({todo = store})=> {
  const actions = {
    updateTitle: title => todo.updateTitle(title),
    updateStatus: status => todo.updateStatus(status),
    updateDescription: description => todo.updateDescription(description),
  };

  return (
    <FCompose
      todo={todo}
      actions={actions}
    />
  )
}

