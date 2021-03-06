import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
  state = {
    seenIndex: [],
    values: {},
    index: ''
  };

  componentDidMount() {
    this.fetchValues();
    this.fetchIndexes();
  }

  async fetchValues() {
    const values = await axios.get('/api/values/current');
    this.setState({ values: values.data });
  }

  async fetchIndexes() {
    const seenIndexes = await axios.get('/api/values/all');
    this.setState({ seenIndexes: seenIndexes.data });
  }

  renderSeenIndexes() {
    return this.state.seenIndex.map(({ number }) => number).join(', ');
  }

  renderValues() {
    const enteries = [];
    for (let key in this.state.values) {
      enteries.push(
        <div key={key}>
          For {key} I Calculated {this.state.values[key]}
        </div>
      );
    }
    return enteries;
  }

  handleSubmit = async event => {
    event.preventDefault();

    await axios.post('/api/value', {
      index: this.state.index
    });
    this.setState({ index: '' });
  };

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter your index</label>
          <input
            value={this.state.index}
            onChange={event => this.setState({ index: event.target.value })}
          />
          <button>Submit</button>
        </form>

        <h3>Indexes I have seen</h3>
        {this.renderSeenIndexes()}

        <h3>Calculated values</h3>
        {this.renderValues()}
      </div>
    );
  }
}

export default Fib;
