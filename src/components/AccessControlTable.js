import React, { useDebugValue } from 'react'
import { useTable } from 'react-table'

/*
  Copied parts of https://react-table.tanstack.com/docs/examples/editable-data
*/

// Create an editable cell renderer
const EditableCell = ({
	value: initialValue,
	row: { index },
	column: { id },
	updateMyData, // This is a custom function that we supplied to our table instance
}) => {
	// We need to keep and update the state of the cell normally
	const [value, setValue] = React.useState(initialValue);
	// If the initialValue is changed external, sync it up with our state
	React.useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	if (id !== 'agent') {
		// CHECKBOX
		const onChecked = e => {
			setValue(e.target.checked);
			updateMyData(index, id, e.target.checked);
		}
		return <input type="checkbox" value={value} onChange={onChecked} checked={value} />;
	} else {
		// TEXT FIELD
		const onChange = e => {
			setValue(e.target.value);
		}
		// We'll only update the external data when the input is blurred
		const onBlur = () => {
			let t_value = value.trim();
			updateMyData(index, id, t_value.toLowerCase() === "everyone" ? null : t_value);
		}
		return <input value={value === null ? "Everyone" : value} onChange={onChange} onBlur={onBlur} />;
	}
}

// Be sure to pass our updateMyData option
export default function AccessControlTable({ tableData, submitValues }) {
	const columns = React.useMemo(
		() => [
			{
				Header: 'Name',
				accessor: 'agent'
			}, {
				Header: 'Read',
				accessor: 'read',
			}, {
				Header: 'Write',
				accessor: 'write',
			}, {
				Header: 'Comment',
				accessor: 'comment',
			}, {
				Header: 'Control',
				accessor: 'control',
			},
		],
		[]
	);
	// Set our editable cell renderer as the default Cell renderer
	const defaultColumn = {
		Cell: EditableCell,
	};
	const [data, setData] = React.useState(tableData)

	React.useEffect(
		() => {
			setData(tableData)
		},
		[tableData]
	)

	const updateMyData = (rowIndex, columnId, value) => {
		setData(old =>
			old.map((row, index) => {
				if (index === rowIndex) {
					return {
						...old[rowIndex],
						[columnId]: value,
					}
				}
				return row;
			})
		)
	}

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		rows,
		prepareRow
	} = useTable(
		{
			columns,
			data,
			defaultColumn,
			updateMyData,
		}
	)

	// Render the UI for your table
	return (
		<>
			<table {...getTableProps()} className="access-control-table">
				<thead>
					{headerGroups.map(headerGroup => (
						<tr {...headerGroup.getHeaderGroupProps()}>
							{headerGroup.headers.map(column => (
								<th {...column.getHeaderProps()}>{column.render('Header')}</th>
							))}
						</tr>
					))}
				</thead>
				<tbody {...getTableBodyProps()}>
					{rows.map((row, i) => {
						prepareRow(row)
						return (
							<tr {...row.getRowProps()}>
								{row.cells.map(cell => {
									return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
								})}
							</tr>
						)
					})}
				</tbody>
			</table>
			<button onClick={() => submitValues(data)}>Save permissions</button>
		</>
	)
}
