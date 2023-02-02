import React, { Component } from 'react';
import { Card, Button } from 'semantic-ui-react';
import factory from '../ethereum/factory';
import Layout from '../components/Layout';
import { Link } from '../routes';

class GeeUpIndex extends Component {
  static async getInitialProps() {
    const geeUps = await factory.methods.getDeployedGeeUps().call();
    return { geeUps };
  }

  renderGeeUps() {
    const items = this.props.geeUps.map(address => {
      return {
        header: address,
        description: (
          <Link route={`/geeups/${address}`}><a>View GeeUp</a></Link>
        ),
        fluid: true
      };
    });
    return <Card.Group items={items} />;
  }

  render() {
    return (
      <Layout>
        <div>
          <h3>Open GeeUps</h3>
          <Link route="/geeups/new">
            <a>
              <Button floated="right" content="Create GeeUp" icon="add circle" primary />
            </a>
          </Link>
          {this.renderGeeUps()}
        </div>
      </Layout>
    );
  }
}

export default GeeUpIndex;
