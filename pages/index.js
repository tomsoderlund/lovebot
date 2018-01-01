import _ from 'lodash';

import { Component } from 'react';
import PropTypes from 'prop-types';

import Link from 'next/link'
import PageHead from '../components/PageHead';
import MenuBar from '../components/MenuBar';

export default class ProfilePage extends Component {

	static async getInitialProps ({store, isServer, query, req}) {
		// Get user
		const loggedInUser = isServer
			? _.get(req, 'session.passport.user')
			: undefined //_.get(window, '__NEXT_DATA__.props.initialProps.loggedInUser');
		return { loggedInUser };
	}

	render() {

		return (
			<div>
				<PageHead
					title='Lovebot'
					description='A love-finding Twitter bot'
				/>

				<MenuBar loggedInUser={this.props.loggedInUser}></MenuBar>

				<main>
					<p>Welcome to Lovebot</p>
					<Link href='/feed' as='/feed'><a>See profiles</a></Link>
				</main>

			</div>
		);
	}
};
