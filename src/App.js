import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { Input, Card, Page, Box, ToolHeader, Tabs, FlexList } from '@procore/core-react';
import SingleExample from './SingleExample';
import ListExample from './ListExample';
import ListOfListsExample from './ListOfListsExample';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <Page>
          <Page.Main>
            <Page.ToolHeader>
              <ToolHeader>
                <ToolHeader.Section>
                  <ToolHeader.Icon />
                  <ToolHeader.Header>Redux Fractal Architecture</ToolHeader.Header>
                  <Tabs>
                    <Tabs.Tab variant="active">
                      <Link to="/">
                        <Tabs.Link label="Todo" />
                      </Link>
                    </Tabs.Tab>
                    <Tabs.Tab>
                      <Link to="/list">
                        <Tabs.Link label="Todo List" />
                      </Link>
                    </Tabs.Tab>
                    <Tabs.Tab>
                      <Link to="/listOfLists">
                        <Tabs.Link label="List of Todo Lists" />
                      </Link>
                    </Tabs.Tab>
                  </Tabs>
                </ToolHeader.Section>
              </ToolHeader>
            </Page.ToolHeader>
            <Page.Body>
              <Route exact path="/" component={SingleExample} />
              <Route exact path="/list" component={ListExample} />
              <Route exact path="/listOfLists" component={ListOfListsExample} />
            </Page.Body>
          </Page.Main>
        </Page>
      </Router>
    );
  }
}

export default App;
