const http = require("http");
const readline = require("readline");
const fs = require("fs");
const fsPath = require("path");
const { NULL } = require("mysql/lib/protocol/constants/types");

// Create Readline Interface for CLI input
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});



function storeData(data, updateId) {
	const dataFilePath = fsPath.join(__dirname, "todo.json");
	let todos = {};

	// Extract or default the primary key
	let primaryKey = data.primaryKey ? data.primaryKey : 0;
	let deleteStatus = data.delete ? 1 : 0;





	try {
		// Read existing todos if the file exists
		if (fs.existsSync(dataFilePath)) {
			let rawData = fs.readFileSync(dataFilePath);
			todos = JSON.parse(rawData);
		}
	} catch (error) {
		console.log(`Error reading file: ${error}`);
	}

	if (deleteStatus) {
		delete todos[primaryKey];
		try {
			fs.writeFileSync(dataFilePath, JSON.stringify(todos, null, 2));
			console.log(`Todo deleted successfully (Id: ${primaryKey})`);
		} catch (error) {
			console.log(`Error deleting data: ${error}`);
		}
		return;
	}

	// Ensure `todos` is an object
	if (typeof todos !== "object" || todos === null) {
		todos = {};
	}


	let lastInsertedId = Object.keys(todos).length > 0 ? Math.max(...Object.keys(todos).map(Number)) + 1 : 1;

	// Check if the primaryKey already exists
	if (!todos[primaryKey]) {
		todos[lastInsertedId] = {
			id: lastInsertedId,
			description: data.description,
			status: "active",
			createdAt: new Date(),
			updatedAt: null // Use null, not NULL
		};
	} else {
		todos[updateId] = {
			id: updateId,
			description: data.description,
			status: "active",
			createdAt: todos[updateId]["createdAt"],
			updatedAt: new Date(),
		};
	}

	// Save data back to the file
	try {
		fs.writeFileSync(dataFilePath, JSON.stringify(todos, null, 2));
		console.log(`Todo added successfully (Id: ${lastInsertedId})`);
	} catch (error) {
		console.log(`Error saving data: ${error}`);
	}
}





function extractFirstText(str) {
	if (!str || typeof str !== "string") {
		console.error("Invalid input string");
		return "";
	}

	const matches = str.match(/"(.*?)"/);
	return matches ? matches[1] : str; // Returns extracted text or the full string
}




function addTodo(inputText) {
	if (!inputText || typeof inputText !== "string") {
		console.error("Invalid input text.");
		return;
	}

	let addText = extractFirstText(inputText);
	if (!addText) {
		console.error("No valid text extracted.");
		return;
	}

	let todo = {
		primaryKey: 0, // Using timestamp as a unique key
		description: addText.trim(),
	};

	storeData(todo);

}

function updateTodo(inputText, updateId) {
	if (!inputText || typeof inputText !== "string") {
		console.error("Invalid input text.");
		return;
	}

	let addText = extractFirstText(inputText);
	if (!addText) {
		console.error("No valid text extracted.");
		return;
	}

	let todo = {
		primaryKey: updateId, // Using timestamp as a unique key
		description: addText.trim(),
	};

	storeData(todo, updateId);

}
function statusUpdate(updateId, status) {
	const dataFilePath = fsPath.join(__dirname, "todo.json");
	let todos = {};
	try {
		// Read existing todos if the file exists
		if (fs.existsSync(dataFilePath)) {
			let rawData = fs.readFileSync(dataFilePath);
			todos = JSON.parse(rawData);
		}
	} catch (error) {
		console.log(`Error reading file: ${error}`);
	}

	if (!todos[updateId]) {
		console.log("No Data Found!");
	} else {
		todos[updateId] = {
			id: updateId,
			description: todos[updateId]['description'],
			status: status,
			createdAt: todos[updateId]["createdAt"],
			updatedAt: todos[updateId]['updatedAt'],
		};
	}

	// Save data back to the file
	try {
		fs.writeFileSync(dataFilePath, JSON.stringify(todos, null, 2));
		console.log(`Status updated successfully (Id: ${updateId})`);
	} catch (error) {
		console.log(`Error saving data: ${error}`);
	}

}

function getList(status) {
	const dataFilePath = fsPath.join(__dirname, "todo.json");
	let todos = {};
	try {
		// Read existing todos if the file exists
		if (fs.existsSync(dataFilePath)) {
			let rawData = fs.readFileSync(dataFilePath);
			todos = JSON.parse(rawData);
		}
	} catch (error) {
		console.log(`Error reading file: ${error}`);
	}


	console.log(todos);
}

function deleteTodo(deleteId) {
	if (deleteId) {
		let todo = {
			primaryKey: deleteId, // Using timestamp as a unique key
			description: "",
			delete: true
		};
		storeData(todo, deleteId);
	}
	else {
		console.log("Missing the delete id.");
	}
}

function processInput(input) {
	const textArr = input.trim().toLowerCase().split(" ");
	const allowedKeywords = ["add", "update", "delete", "mark-in-progress", "mark-done", "list"];
	const allowedMethods = ["done", "todo", "in-progress"];
	let controllerKeyword = (textArr.length >= 1) ? textArr[0] : "";
	let methodName = (textArr.length >= 2) ? textArr[1] : "";

	// console.log(`${controllerKeyword} ${methodName} ${allowedKeywords}`);
	switch (controllerKeyword) {
		case "add":
			addTodo(input);
			break;
		case "update":
			updateTodo(input, textArr[1]);
			break;
		case "delete":
			deleteTodo(textArr[1]);
			break;
		case "mark-in-progress":
			statusUpdate(textArr[1], 'in-progress');
			break;
		case "mark-done":
			statusUpdate(textArr[1], 'done');
			break;
		case "list":
			getList(textArr[1]);
			break;
		case "":
			console.log(` Please enter text search in between ${allowedKeywords} and ${allowedMethods}`);
			break;
	}
}

// Track user inputs
rl.on("line", (input) => {
	processInput(input);
});



// Create a basic server
const server = http.createServer((req, res) => {
	res.writeHead(200, { "Content-Type": "text/plain" });
	res.end("Server is running...\n");
});

// Start server on port 3000
server.listen(3000, () => {
	console.log("Server running at http://localhost:3000/");
	console.log("Listening for customer input in CLI...");
});
