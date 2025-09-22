'use client';

import { useState, useEffect } from 'react';

interface Test {
	_id: string;
	name: string;
	value: string;
}

export default function TestsPage() {
	const [tests, setTests] = useState<Test[]>([]);
	const [name, setName] = useState('');
	const [value, setValue] = useState('');
	const [editId, setEditId] = useState<string | null>(null);

	// Fetch all tests
	const fetchTests = async () => {
		const res = await fetch('/api/tests');
		const data = await res.json();
		if (data.data) setTests(data.data);
	};

	// Create or Update
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const url = editId ? `/api/tests/${editId}` : '/api/tests';
		const method = editId ? 'PUT' : 'POST';

		await fetch(url, {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, value }),
		});

		setName('');
		setValue('');
		setEditId(null);
		fetchTests();
	};

	// Delete
	const handleDelete = async (id: string) => {
		await fetch(`/api/tests/${id}`, { method: 'DELETE' });
		fetchTests();
	};

	// Edit
	const handleEdit = (test: Test) => {
		setName(test.name);
		setValue(test.value);
		setEditId(test._id);
	};

	useEffect(() => {
		fetchTests();
	}, []);

	return (
		<div className="p-8 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">Tests Module</h1>

			{/* Form */}
			<form onSubmit={handleSubmit} className="mb-8 p-4 border rounded">
				<div className="mb-4">
					<input
						type="text"
						placeholder="Name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full p-2 border rounded"
						required
					/>
				</div>
				<div className="mb-4">
					<input
						type="text"
						placeholder="Value"
						value={value}
						onChange={(e) => setValue(e.target.value)}
						className="w-full p-2 border rounded"
						required
					/>
				</div>
				<button
					type="submit"
					className="px-4 py-2 bg-blue-500 text-white rounded">
					{editId ? 'Update' : 'Create'}
				</button>
				{editId && (
					<button
						type="button"
						onClick={() => {
							setEditId(null);
							setName('');
							setValue('');
						}}
						className="ml-2 px-4 py-2 bg-gray-500 text-white rounded">
						Cancel
					</button>
				)}
			</form>

			{/* List */}
			<div className="space-y-2">
				{tests?.map((test) => (
					<div
						key={test._id}
						className="p-4 border rounded flex justify-between">
						<div>
							<p className="font-semibold">{test.name}</p>
							<p className="text-gray-600">{test.value}</p>
						</div>
						<div className="space-x-2">
							<button
								onClick={() => handleEdit(test)}
								className="px-3 py-1 bg-green-500 text-white rounded">
								Edit
							</button>
							<button
								onClick={() => handleDelete(test._id)}
								className="px-3 py-1 bg-red-500 text-white rounded">
								Delete
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
