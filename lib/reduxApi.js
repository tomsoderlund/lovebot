import _ from 'lodash';
import 'isomorphic-fetch';
import reduxApi, { transformers } from 'redux-api';
import adapterFetch from 'redux-api/lib/adapters/fetch';
import { Provider, connect } from 'react-redux';

// Make better fix: https://github.com/zeit/next.js/issues/1488#issuecomment-289108931
const API_URL = process.env.NODE_ENV === 'production' ? 'SERVER' : 'http://localhost:3003';

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

		// Reimplement default `transformers.object`
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

})
.use('fetch', adapterFetch(fetch))
.use('rootUrl', API_URL);
