import React from 'react';
import { v4 } from 'uuid';
import { Button, Input, Card, Box, FlexList } from '@procore/core-react';
import { withStateHandlers } from 'recompose';
import { createStore } from 'redux';
import { createModule } from 'redux-modules';
import { Provider } from 'react-redux';

import { itemModel, TodoItem } from './SingleExample';
import Connect from './Connect';
import ChildConnect from './ChildConnect';

const listModel = createModule({
  name: 'todoList',
  initialState: {
    todos: [],
  },
  transformations: {
    init: s => s,
    addTodo: ({ todos }, { payload: todo }) => ({ todos: todos.concat({ ...todo, id: v4() }) }),
    removeTodo: ({ todos }, { payload: id }) => ({ todos: todos.filter(t => t.id !== id) }),
    updateTodo: ({ todos }, { payload, meta }) => {
      const todoToUpdate = todos.find(todos => todos.id === meta.id);
      const updatedTodo = itemModel.reducer(todoToUpdate, payload.action);
      const updatedState = {
        todos: todos.map(t => t.id === meta.id ? updatedTodo : t)
      };
      return updatedState;
    },
  },
});

const store = createStore(listModel.reducer, { todos: [] });

const FormState = withStateHandlers({}, {
  update: (state) => (attr, value) => ({ ...state, [attr]: value }),
  clear: () => () => ({ title: '', description: '' }),
})(({ children, ...props }) => children(props));

const ListExample = () => (
  <Provider store={store}>
    <Connect selector={s => s} actions={listModel.actions}>
      {({ actions, ...state }) => (
        <FlexList>
          <FormState>
            {({ title, description, update, clear }) => (
              <FlexList direction="column">
                <Input
                  placeholder="Title"
                  onChange={({ target }) => update('title', target.value)}
                  value={title}
                />
                <Input
                  placeholder="Description"
                  onChange={({ target }) => update('description', target.value)}
                  value={description}
                />
                <FlexList>
                  <Button onClick={() => {
                    actions.addTodo({ title, description });
                    clear();
                  }}>
                    Add Todo
                  </Button>
                  <Button onClick={clear} variant="secondary">
                    Clear
                  </Button>
                </FlexList>
              </FlexList>
            )}
          </FormState>
          {state.todos.map(todo => (
            <ChildConnect actions={itemModel.actions} dispatch={actions.updateTodo} meta={{ id: todo.id }}>
              {childActions => (
                <TodoItem {...todo} actions={childActions} />
              )}
            </ChildConnect>
          ))}
        </FlexList>
      )}
    </Connect>
  </Provider>
);

export default ListExample;
