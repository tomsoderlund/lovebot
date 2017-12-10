const UserItem = ({user, index, inProgress, handleUpdate, handleDelete}) => (
	<div className={inProgress === user._id ? 'inProgress' : ''}>
		{user.twitterHandle} 
		<a className="update" onClick={handleUpdate.bind(this, index, user._id)}>Update</a>
		<a className="delete" onClick={handleDelete.bind(this, index, user._id)}>Delete</a>
		<style jsx>{`
			a {
				margin-left: 0.5em;
				cursor: pointer;
				font-size: 0.6em;
				text-transform: uppercase;
			}
			a.update {
				color: lime;
			}
			a.delete {
				color: tomato;
			}
			.inProgress {
				opacity: 0.3;
			}
		`}</style>
	</div>
);
export default UserItem;