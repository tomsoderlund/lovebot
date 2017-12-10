import _ from 'lodash';
import 'isomorphic-fetch';
import reduxApi, { transformers } from 'redux-api';
import adapterFetch from 'redux-api/lib/adapters/fetch';
import { Provider, connect } from 'react-redux';

// Docs: https://github.com/lexich/redux-api
export default reduxApi({

	// Simple endpoint description
	//oneUser: '/api/users/59c9743888a7e95e93c3bbea',

	// Complex endpoint description
	users: {
		url: '/api/users/:id',
		crud: true, // Make CRUD actions: https://github.com/lexich/redux-api/blob/master/docs/DOCS.md#crud

		// base endpoint options `fetch(url, options)`
		options: {
			headers: {
				'Content-Type': 'application/json'
			}
		},

		// reducer (state, action) {
		// 	console.log('reducer', action);
		// 	return state;
		// },

		// postfetch: [
		// 	function ({data, actions, dispatch, getState, request}) {
		// 		console.log('postfetch', {data, actions, dispatch, getState, request});
		// 		dispatch(actions.users.sync());
		// 	}
		// ],

		// Reimplement default `transformers.object`
		//transformer: transformers.array,
		transformer: function (data, prevData, action) {
			const actionMethod = _.get(action, 'request.params.method');
			switch (actionMethod) {
				case 'POST':
					return [...prevData, data];
					break;
				case 'PUT':
					return prevData.map(oldData => oldData._id === data._id ? data : oldData);
					break;
				case 'DELETE':
					return _(prevData).filter(oldData => oldData._id === data._id ? undefined : oldData).compact().value();
					break;
				default:
					return transformers.array.call(this, data, prevData, action);
			}
		},

	}

}).use('fetch', adapterFetch(fetch)); // it's necessary to point using REST backend

// From https://github.com/reactjs/react-redux/issues/390#issuecomment-221389608
export function connectComponentWithStore(WrappedComponent, store, ...args) {
	var ConnectedWrappedComponent = connect(...args)(WrappedComponent)
	return function (props) {
		return <ConnectedWrappedComponent {...props} store={store} />
	}
};