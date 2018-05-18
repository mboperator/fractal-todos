import React, { Component } from 'react';
import { Card, Page, Box, ToolHeader, Tabs } from '@procore/core-react';
import logo from './logo.svg';
import './App.css';

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
            <Card>
              <Card.TipHeader>
                <Card.TipHeaderContent>
                  <Card.TipHeaderTitle>Create Mock APIs</Card.TipHeaderTitle>
                </Card.TipHeaderContent>
              </Card.TipHeader>
              <Box padding="xl">
                <p>Mock APIs for state management.</p>
              </Box>
            </Card>
          </Page.Body>
        </Page.Main>
      </Page>
    );
  }
}

export default App;
