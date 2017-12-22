import _ from 'lodash';

import { Component } from 'react';
import PropTypes from 'prop-types';

import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import withRedux from 'next-redux-wrapper';
import reduxApi from '../lib/reduxApi';

import PageHead from '../components/PageHead';
import UserItem from '../components/UserItem';
import LoadingSpinner from '../components/LoadingSpinner';

class IndexPage extends React.Component {

	static propTypes = {

		// oneUser: PropTypes.shape({
		// 	loading: PropTypes.bool.isRequired,
		// 	data: PropTypes.shape({
		// 		text: PropTypes.string
		// 	}).isRequired
		// }).isRequired,

		users: PropTypes.shape({
			loading: PropTypes.bool.isRequired,
			data: PropTypes.array.isRequired
		}).isRequired,

		dispatch: PropTypes.func.isRequired

	};

	static async getInitialProps ({store, isServer, pathname, query}) {
		const { dispatch } = store;
		// Get all Users
		const gender = 'woman';
		const resultPromise = await dispatch(reduxApi.actions.users.sync({ gender: gender }));
		return resultPromise;
	}

	constructor (props) {
		super(props)
		this.state = { gender: 'woman', users: props.users }
	}

/*
	handleChange (event) {
		this.setState({ twitterHandle: event.target.value });
	}

	handleAdd (event) {
		// Progress indicator
		this.setState({ inProgress: true });
		const callbackWhenDone = () => this.setState({ twitterHandle: '', inProgress: null });

		// Actual data request
		const newUser = {
			twitterHandle: this.state.twitterHandle,
		};
		this.props.dispatch(reduxApi.actions.users.post({}, { body: JSON.stringify(newUser) }, callbackWhenDone));
	}

	handleUpdate (index, userId, event) {
		// Progress indicator
		this.setState({ inProgress: userId });
		const callbackWhenDone = () => this.setState({ inProgress: null });

		// Actual data request
		const newUser = {
			twitterHandle: prompt('New twitterHandle?'),
		};
		this.props.dispatch(reduxApi.actions.users.put({ id: userId }, { body: JSON.stringify(newUser) }, callbackWhenDone));
	}

	handleDelete (index, userId, event) {
		// Progress indicator
		this.setState({ inProgress: userId });
		const callbackWhenDone = () => this.setState({ inProgress: null });

		// Actual data request
		this.props.dispatch(reduxApi.actions.users.delete({ id: userId }, callbackWhenDone));
	}
*/
	handleFilterChange (property, event) {
		// Progress indicator
		let newFilter = _.merge({}, this.state);
		newFilter[property] = event.target.value;
		newFilter.inProgress = true;
		this.setState(newFilter);
		// Data request
		const callbackWhenDone = () => this.setState({ inProgress: null });
		this.props.dispatch(reduxApi.actions.users.reset('sync'));
		const query = _.pick(newFilter, ['gender', 'city']);
		this.props.dispatch(reduxApi.actions.users.sync(query, callbackWhenDone));
	}

	render () {

		const {users} = this.props;

		const userList = users.data
			? users.data.map((user, index) => <UserItem
					user={user}
					index={index}
					key={index}
					inProgress={this.state.inProgress}
				/>)
			: [];

		return <div>
			<PageHead
				title='Lovebot'
				description='A love-finding Twitter bot'
			/>

			<div className='options'>
				<select value={this.state.gender} onChange={this.handleFilterChange.bind(this, 'gender')} >
					<option value="woman">Women</option>
					<option value="man">Men</option>
					<option value="other">Other</option>
				</select>
				<select value={this.state.city} onChange={this.handleFilterChange.bind(this, 'city')} >
					<option value="all">All</option>
					<option>Stockholm</option>
				</select>
			</div>

			<LoadingSpinner hide={!this.state.inProgress}/>

			<div className={'userList ' + (this.state.inProgress ? 'hidden' : '')}>
				{userList}
			</div>

			<style jsx>{`
				div {
					margin-top: 1em;
				}
				.userList {
					display: flex;
					flex-direction: row;
					justify-content: center;
					align-items: flex-start;
					flex-wrap: wrap;						
				}
				.options {
					display: flex;
					flex-direction: row;
					justify-content: space-around;
					align-items: flex-start;
				}
			`}</style>

		</div>
	};

}

const createStoreWithThunkMiddleware = applyMiddleware(thunkMiddleware)(createStore);
const makeStore = (state, enhancer) => createStoreWithThunkMiddleware(combineReducers(reduxApi.reducers), state);
const mapStateToProps = (state) => ({ users: state.users });

const IndexPageConnected = withRedux({ createStore: makeStore, mapStateToProps })(IndexPage)
export default IndexPageConnected;
