import React from 'react'
import { useTable } from 'react-table'

/*
  Copied parts of https://react-table.tanstack.com/docs/examples/editable-data
*/

// Create an editable cell renderer
const EditableCell = ({
	value: initialValue,
	row: { index },
	column: { id },
	updateMyData
}) => {
	const [value, setValue] = React.useState(initialValue);
	// If the initialValue is changed external, sync it up with our state
	React.useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);
	const onChange = e => {
		setValue(e.target.value);
	}
	// We'll only update the external data when the input is blurred
	const onBlur = () => {
		let t_value = value.trim();
		updateMyData(index, id, t_value.toLowerCase() === "everyone" ? null : t_value);
	}
	return <input value={value === null ? "Everyone" : value} placeholder="WebID or 'Everyone'" onChange={onChange} onBlur={onBlur} />;
}

const CheckboxCell = ({
	value: initialValue,
	row: { index },
	column: { id },
	updateMyData
}) => {
	const [value, setValue] = React.useState(initialValue);
	// If the initialValue is changed external, sync it up with our state
	React.useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	const onChecked = e => {
		setValue(e.target.checked);
		updateMyData(index, id, e.target.checked);
	}
	return <input type="checkbox" value={value} onChange={onChecked} checked={value} />;
}

const RemoveRowCell = ({ row: { index }, removeRow }) =>
	<div className="removeButton" onClick={() => removeRow(index)}>X</div>

const CheckBoxHeader = ({
	checkAll,
	column: { id }
}) => {
	const [checked, setChecked] = React.useState(false);

	const onClick = e => {
		checkAll(id, !checked);
		setChecked(!checked);
	}
	return <>{id[0].toUpperCase() + id.slice(1)}<br/><input type="checkbox" onClick={onClick} /></>
}

// Be sure to pass our updateMyData option
export default function AccessControlTable({ tableData, submitValues }) {
	const columns = React.useMemo(
		() => [
			{
				Header: 'Name',
				accessor: 'agent',
				Cell: EditableCell
			}, {
				Header: CheckBoxHeader,
				accessor: 'read',
			}, {
				Header: CheckBoxHeader,
				accessor: 'write',
			}, {
				Header: CheckBoxHeader,
				accessor: 'comment',
			}, {
				Header: CheckBoxHeader,
				accessor: 'control',
			}, {
				Header: '',
				accessor: 'deleteRow',
				Cell: RemoveRowCell
			}
		],
		[]
	);
	// Set our editable cell renderer as the default Cell renderer
	const defaultColumn = {
		Cell: CheckboxCell,
	};
	const [data, setData] = React.useState(tableData)

	React.useEffect(
		() => setData(tableData),
		[tableData]
	)

	const addRow = () => {
		data.push({ agent: '', read: false, write: false, comment: false, control: false });
		setData([...data]);
	}

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

	const removeRow = (rowIndex) => {
		data.splice(rowIndex, 1);
		setData([...data]);
	}

	const checkAll = (id, checked) => {
		setData(old =>
			old.map(row => {
				row[id] = checked;
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
			removeRow,
			checkAll
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
			<>
				<button onClick={addRow}>Add new</button>
				<button onClick={() => submitValues(data)}>Save permissions</button>
			</>
		</>
	)
}
