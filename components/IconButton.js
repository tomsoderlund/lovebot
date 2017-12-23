const IconButton = ({ label, icon }) => {
	return 	(
		<button>
			<i className={'far fa-' + icon}></i>
			<div className='label'>{label}</div>
			<style jsx>{`
				button {
					margin: 0;
					flex: 1;
				}
				i {
					font-size: 1.2em;
				}
			`}</style>
		</button>
	)
};
export default IconButton;