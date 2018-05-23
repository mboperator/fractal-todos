import React, { Component } from 'react';
import { Input, Card, Page, Box, ToolHeader, Tabs, FlexList } from '@procore/core-react';
import { createStore } from 'redux';
import { createModule } from 'redux-modules';
import { Provider } from 'react-redux';
import Connect from './Connect';
import logo from './logo.svg';
import './App.css';

const itemModel = createModule({
  name: 'todoItem',
  initialState: { title: '', status: 'IN_PROGRESS', description : '' },
  transformations: {
    updateTitle: (state, { payload: title }) => ({ ...state, title }),
    updateDescription: (state, { payload: description }) => ({ ...state, description }),
    updateStatus: (state, { payload: status }) => ({ ...state, status }),
  },
});

const store = createStore(itemModel.reducer, {});


const TodoItem = ({
  title = 'Create Mock APIs',
  status = 'IN_PROGRESS',
  description = 'Mock APIs for state management.'
}) => (
  <Card>
    <Card.TipHeader>
      <Card.TipHeaderContent>
        <Card.TipHeaderTitle>{title}</Card.TipHeaderTitle>
      </Card.TipHeaderContent>
    </Card.TipHeader>
    <Box padding="xl">
      <p>{description}</p>
    </Box>
  </Card>
);

class App extends Component {
  render() {
    return (
      <Page>
        <Page.Main>
          <Page.ToolHeader>
            <ToolHeader>
              <ToolHeader.Section>
                <ToolHeader.Icon />
                <ToolHeader.Header>Redux Fractal Architecture</ToolHeader.Header>
                <Tabs>
                  <Tabs.Tab variant="active">
                    <Tabs.Link label="Todo" />
                  </Tabs.Tab>
                  <Tabs.Tab>
                    <Tabs.Link label="Todo List" />
                  </Tabs.Tab>
                  <Tabs.Tab>
                    <Tabs.Link label="List of Todo Lists" />
                  </Tabs.Tab>
                </Tabs>
              </ToolHeader.Section>
            </ToolHeader>
          </Page.ToolHeader>
          <Page.Body>
            <Provider store={store}>
              <Connect selector={s => s} actions={itemModel.actions}>
                {({ actions, ...state }) => (
                  <FlexList>
                    <FlexList direction="column">
                      <Input
                        placeholder="Title"
                        onChange={({ target }) => actions.updateTitle(target.value)}
                        value={state.title}
                      />
                      <Input
                        placeholder="Description"
                        onChange={({ target }) => actions.updateDescription(target.value)}
                        value={state.description}
                      />
                    </FlexList>
                    <TodoItem {...state} actions={actions} />
                  </FlexList>
                )}
              </Connect>
            </Provider>
          </Page.Body>
        </Page.Main>
      </Page>
    );
  }
}

export default App;
