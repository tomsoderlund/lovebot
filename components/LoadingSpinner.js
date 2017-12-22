const LoadingSpinner = ({hide}) => <div>
	<img className={hide ? 'hidden' : ''} src='/static/spinner-line-dark.gif' alt='Loading...'/>
	<style jsx>{`
		img {
			width: 100%;
			opacity: 0.5;
			margin: 1em 0;
		}
	`}</style>
</div>
export default LoadingSpinner;