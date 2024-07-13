// importing Inquirer
const inquirer = require('inquirer');

// install .env
require('dotenv').config()
const { Pool } = require('pg');

// Connect to database
const pool = new Pool(
  {
    user: 'postgres',
    password: process.env.DB_PASSWORD,
    host: 'localhost',
    database: 'employees_db'
  },
  console.log(`Connected to the employees database.`)
)

//creating inquirer prompt for a list of options to select in the terminal
function menu() {
  inquirer.prompt([{
    type: "list",
    name: "choice",
    message: "what would you like to do?",
    choices: ["View all employees", "View all roles", "View all departments", "Add an employee", "Add a deptartment", "Add a role", "Update an employees role", "Delete an employee", "Delete a manager", "Delete a role", "quit"]
  }])
  .then(({choice}) => {
    if(choice === "View all employees") viewEmployees();
    else if (choice === "View all roles") viewRoles();
    else if (choice === "View all departments") viewDepartments();
    else if (choice === "Add an employee") addEmployee();
    else if (choice === "Add a deptartment") addDepartment();
    else if (choice === "Add a role") addRole();
    else if (choice === "Update an employees role") updateEmployee();
    else if (choice === "Delete an employee") deleteEmployee();
    else if (choice === "Delete a manager") deleteManager();
    else if (choice === "Delete a role") deleteRole();
    else pool.end()
  })
}

//creating function for viewDepartments
async function viewDepartments() {
  const departments = await pool.query("select* from department");
  console.table(departments.rows)
  menu()
}

//creating function for viewRoles
async function viewRoles() {
  const roles = await pool.query ("select role.title, role.salary, department.name from role join department on role.department_id = department.id")
  console.table(roles.rows)
  //goes back to menu
  menu()
}

//creating function for viewEmployees
async function viewEmployees() {
  const sql = `SELECT employee.id, employee.first_name AS "first name", employee.last_name AS "last name", role.title, department.name AS department, role.salary, manager.first_name || ' ' || manager.last_name AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id`;
  const employees = await pool.query(sql)
  console.table(employees.rows)
   //goes back to menu
  menu()
}

//creating function for addDepartment
async function addDepartment() {
  try {
    const departmentData = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter department name:'
      }
    ]);

    // Insert info into database
    const query = {
      text: 'INSERT INTO department(name) VALUES($1)',
      values: [departmentData.name]
    };

    await pool.query(query);
    console.log('Department added successfully!');
    menu();
  } catch (error) {
    console.error('Error adding department:', error);
     //goes back to menu
    menu();
  }
}

//creating function for addRole
async function addRole() {
  try {
    // Fetch department names from the database
    const departmentQuery = 'SELECT id, name FROM department';
    const departmentResult = await pool.query(departmentQuery);
    const departments = departmentResult.rows;

    // Prepare department choices for Inquirer prompt
    const departmentChoices = departments.map(department => ({
      name: department.name,
      value: department.id
    }));

    // Prompt user for role details
    const roleData = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter role title:'
      },
      {
        type: 'input',
        name: 'salary',
        message: 'Enter role salary:'
      },
      {
        type: 'list',
        name: 'department_id',
        message: 'Select department for this role:',
        choices: departmentChoices
      }
    ]);

    // Insert into database
    const query = {
      text: 'INSERT INTO role(title, salary, department_id) VALUES($1, $2, $3)',
      values: [roleData.title, roleData.salary, roleData.department_id]
    };

    await pool.query(query);
    console.log('Role added successfully!');
     //goes back to menu
    menu();
  } catch (error) {
    console.error('Error adding role:', error);
     //goes back to menu
    menu();
  }
}

//creating function to addEmployee
async function addEmployee() {
  try {
    // Fetch roles from the database
    const roleQuery = 'SELECT id, title FROM role';
    const roleResult = await pool.query(roleQuery);
    const roles = roleResult.rows;

    // Prepare role choices for Inquirer prompt
    const roleChoices = roles.map(role => ({
      name: role.title,
      value: role.id
    }));

    // Fetch managers from the database (assuming manager_id refers to another employee id)
    const managerQuery = 'SELECT id, first_name, last_name FROM employee';
    const managerResult = await pool.query(managerQuery);
    const managers = managerResult.rows;

    // Prepare manager choices for Inquirer prompt
    const managerChoices = managers.map(manager => ({
      name: `${manager.first_name} ${manager.last_name}`,
      value: manager.id
    }));

    // Prompt user for employee details
    const employeeData = await inquirer.prompt([
      {
        type: 'input',
        name: 'first_name',
        message: "Enter employee's first name:"
      },
      {
        type: 'input',
        name: 'last_name',
        message: "Enter employee's last name:"
      },
      {
        type: 'list',
        name: 'role_id',
        message: 'Select employee role:',
        choices: roleChoices
      },
      {
        type: 'list',
        name: 'manager_id',
        message: 'Select employee manager (optional):',
        choices: managerChoices
      }
    ]);

    // Insert into database
    const query = {
      text: 'INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES($1, $2, $3, $4)',
      values: [employeeData.first_name, employeeData.last_name, employeeData.role_id, employeeData.manager_id || null]
    };

    await pool.query(query);
    console.log('Employee added successfully!');
     //goes back to menu
    menu();
  } catch (error) {
    console.error('Error adding employee:', error);
     //goes back to menu
    menu();
  }
}

//creating function for updateEmployee
async function updateEmployee() {
  try {
    // Fetch employees from the database
    const employeeQuery = 'SELECT id, first_name, last_name FROM employee';
    const employeeResult = await pool.query(employeeQuery);
    const employees = employeeResult.rows;

    // Prepare employee choices for Inquirer prompt
    const employeeChoices = employees.map(employee => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id
    }));

    // Fetch roles from the database
    const roleQuery = 'SELECT id, title FROM role';
    const roleResult = await pool.query(roleQuery);
    const roles = roleResult.rows;

    // Prepare role choices for Inquirer prompt
    const roleChoices = roles.map(role => ({
      name: role.title,
      value: role.id
    }));

    // Prompt user for employee update details
    const employeeUpdateData = await inquirer.prompt([
      {
        type: 'list',
        name: 'employee_id',
        message: 'Select employee to update:',
        choices: employeeChoices
      },
      {
        type: 'list',
        name: 'role_id',
        message: 'Select new role for the employee:',
        choices: roleChoices
      }
    ]);

    // Update database
    const query = {
      text: 'UPDATE employee SET role_id = $1 WHERE id = $2',
      values: [employeeUpdateData.role_id, employeeUpdateData.employee_id]
    };

    await pool.query(query);
    console.log('Employee role updated successfully!');
     //goes back to menu
    menu();
  } catch (error) {
    console.error('Error updating employee role:', error);
     //goes back to menu
    menu();
  }
}


// Function to delete an employee
async function deleteEmployee() {
  try {
    const employeeQuery = 'SELECT id, first_name, last_name FROM employee';
    const employeeResult = await pool.query(employeeQuery);
    const employees = employeeResult.rows;

    const employeeChoices = employees.map(employee => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id
    }));

    const employeeToDelete = await inquirer.prompt({
      type: 'list',
      name: 'employee_id',
      message: 'Select employee to delete:',
      choices: employeeChoices
    });

    const deleteQuery = {
      text: 'DELETE FROM employee WHERE id = $1',
      values: [employeeToDelete.employee_id]
    };

    await pool.query(deleteQuery);
    console.log('Employee deleted successfully!');
    menu();
  } catch (error) {
    console.error('Error deleting employee:', error);
    menu();
  }
}

// Function to delete a manager (assuming manager_id refers to another employee id)
async function deleteManager() {
  try {
    const managerQuery = 'SELECT id, first_name, last_name FROM employee';
    const managerResult = await pool.query(managerQuery);
    const managers = managerResult.rows;

    const managerChoices = managers.map(manager => ({
      name: `${manager.first_name} ${manager.last_name}`,
      value: manager.id
    }));

    const managerToDelete = await inquirer.prompt({
      type: 'list',
      name: 'manager_id',
      message: 'Select manager (employee) to delete:',
      choices: managerChoices
    });

    const deleteQuery = {
      text: 'DELETE FROM employee WHERE id = $1',
      values: [managerToDelete.manager_id]
    };

    await pool.query(deleteQuery);
    console.log('Manager (employee) deleted successfully!');
    menu();
  } catch (error) {
    console.error('Error deleting manager (employee):', error);
    menu();
  }
}

// Function to delete a role
async function deleteRole() {
  try {
    const roleQuery = 'SELECT id, title FROM role';
    const roleResult = await pool.query(roleQuery);
    const roles = roleResult.rows;

    const roleChoices = roles.map(role => ({
      name: role.title,
      value: role.id
    }));

    const roleToDelete = await inquirer.prompt({
      type: 'list',
      name: 'role_id',
      message: 'Select role to delete:',
      choices: roleChoices
    });

    const deleteQuery = {
      text: 'DELETE FROM role WHERE id = $1',
      values: [roleToDelete.role_id]
    };

    await pool.query(deleteQuery);
    console.log('Role deleted successfully!');
    menu();
  } catch (error) {
    console.error('Error deleting role:', error);
    menu();
  }
}

 //goes back to menu
menu()
