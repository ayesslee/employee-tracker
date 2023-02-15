// dependencies
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

// list of variables 
var roles;
var employees;
var departments;

// create a connection to the database
const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // MySQL password
        password: 'Chomi4lyfe@',
        database: 'workforce_db'
    },
    console.log(`Connected to the database.`)
);

// Connect to the database 
db.connect((err) => {
    if (err) throw err;
    main();
});

// main menu with options
const main = function () {
    inquirer
        .prompt({
            type: 'list',
            message: 'What would you like to do?',
            name: 'main_options',
            choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Exit']
        })
        .then(function (input) {
            switch (input.main_options) {
                case 'View All Employees':
                    viewAllEmployees();
                    break;
                case 'Add Employee':
                    addEmployee();
                    break;
                case 'Update Employee Role':
                    updateEmployeeRole();
                    break;
                case 'View All Roles':
                    viewAllRoles();
                    break;
                case 'Add Role':
                    addRole();
                    break;
                case 'View All Departments':
                    viewAllDepartments();
                    break;
                case 'Add Department':
                    addDepartment();
                    break;
                case 'Exit':
                    exit();
                    break;
            }
        });
}

// function to get roles
function currentRoles() {
    roles = [];
    db.query('SELECT * FROM role', (err, input) => {
        if (err) throw err;
        for (i = 0; i < input.length; i++) {
            roles.push(input[i].id + ' ' + input[i].title)
        };
    });
    return roles;
};

// function to get employees 
function currentEmployees() {
    employees = [];
    db.query('SELECT * FROM employee', (err, input) => {
        if (err) throw err;
        for (i = 0; i < input.length; i++) {
            employees.push(input[i].id + ' ' + input[i].first_name + ' ' + input[i].last_name)
        };
    });
    return employees;
};

// function to get departments 
function currentDepartments() {
    departments = [];
    db.query('SELECT * FROM department', (err, input) => {
        if (err) throw err;
        for (i = 0; i < input.length; i++) {
            departments.push(input[i].id + ' ' + input[i].name)
        };
    });
    return departments;
};

// function to view all employees in the database
function viewAllEmployees() {
    db.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, employee.manager_id AS manager FROM employee JOIN role ON employee.role_id=role.id JOIN department ON role.department_id=department.id', (err, input) => {
        if (err) throw err;
        console.table(input);
        main();
    });
};

// function to add an employee to the database
function addEmployee() {
    currentRoles();
    currentEmployees();
    inquirer
        .prompt([{
            type: 'input',
            message: 'First name of the new employee?',
            name: 'firstName'
        },
        {
            type: 'input',
            message: 'Last name of the new employee?',
            name: 'lastName'
        },
        {
            type: 'list',
            message: 'Role of new employee?',
            name: 'roleid',
            choices: roles
        },
        {
            type: 'list',
            message: 'Manager of the new employee?',
            name: 'managerid',
            choices: employees
        }
        ])
        .then(function (input) {
            var ri = input.roleid.split(' ');
            var mi = input.managerid.split(' ');
            db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)', [input.firstName, input.lastName, ri[0], mi[0]], function (err, res) {
                if (err) throw err;
                console.table(res);
                main();
            });
        });
};

// function to update employee role in the database
function updateEmployeeRole() {
    currentRoles();
    currentEmployees();
    inquirer
        .prompt([
            {
                type: 'input',
                message: 'What is your name?',
                name: 'name'
            },
            {
                type: 'list',
                message: 'Name of employee that is being updated?',
                name: 'nameupdate',
                choices: employees
            },
            {
                type: 'list',
                message: 'Role that needs to be updated to?',
                name: 'roleupdate',
                choices: roles
            }
        ])
        .then(function (input) {
            var ri = input.roleupdate.split(' ');
            var ei = input.nameupdate.split(' ');
            db.query('UPDATE employee SET role_id=? WHERE first_name=?', [ri[0], ei[1]], function (err, res) {
                if (err) throw err;
                console.table(res);
                main();
            });
        });
};

// function to view all roles in the database
function viewAllRoles() {
    db.query('SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id=department.id', (err, input) => {
        if (err) throw err;
        console.table(input);
        main();
    });
};

// function to add roles in database 
function addRole() {
    currentDepartments();
    inquirer
        .prompt([
            {
                type: 'input',
                message: 'Name of the new role?',
                name: 'roleName'
            },
            {
                type: 'input',
                message: 'Salary of the new role?',
                name: 'roleSalary'
            },
            {
                type: 'list',
                message: 'Name of the department this role fits in?',
                name: 'departmentid',
                choices: departments
            }
        ])
        .then(function (input) {
            var di = input.departmentid.split(' ');
            db.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [input.roleName, input.roleSalary, di[0]], function (err, res) {
                if (err) throw err;
                console.table(res);
                main();
            });
        });
};

// function to view all departments in the database 
function viewAllDepartments() {
    db.query('SELECT * FROM department', (err, input) => {
        if (err) throw err;
        console.table(input);
        main();
    });
};

// functino to add departments into the database
function addDepartment() {
    inquirer
        .prompt({
            type: 'input',
            message: 'Name of the new department?',
            name: 'departmentName'
        })
        .then(function (input) {
            db.query('INSERT INTO department (name) VALUES (?)', [input.departmentName], function (err, res) {
                if (err) throw err;
                console.table(res);
                main();
            });
        });
};

// function to exit the application 
function exit() {
    db.end();
    console.log('Applcation exited.');
    process.exit();
};