// Simple multi select box
const MultiSelect = ({options, value, onClick}) => {

	const buttonList = options
		? options.map((option) => <button
				key={option}
				onClick={onClick ? onClick.bind(this, option) : undefined}
				className={option === value ? 'selected' : ''}
			>{option}</button>
		)
		: [];

	return <div className='multi-select'>
		{buttonList}
	</div>
};
export default MultiSelect;
