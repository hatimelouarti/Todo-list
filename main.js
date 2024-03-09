import "./style.scss";

// task class
class task {
  constructor(title, state) {
    this.id = task.generateUniqueId();
    this.title = title;
    this.state = state;
  }

  static generateUniqueId() {
    return Date.now().toString();
  }
}
//class ui

class ui {
  static displaytasks() {
    console.log(store.gettask());
    const tasksList = document.querySelector(".tasks-list");
    tasksList.innerHTML = ""; // Clear existing tasks

    const tasks = store.gettask();
    tasks.forEach((task) => {
      ui.addtasktopage(task);
    });
  }
  //display every task on the page
  static addtasktopage(task) {
    const tasksList = document.querySelector(".tasks-list");

    const taskHtml = `
    <div class="task" draggable="true">
      <div class="check">
        <input type="checkbox" id="myCheckbox" value="${task.id}" ${
      task.state ? "checked" : ""
    }/>
      </div>
      <div class='task-title ${task.state ? "line" : ""}'>${task.title}</div>
      <div class="remove">
        <img src="./images/icon-cross.svg" alt="${task.id}" />
      </div>
    </div>`;

    tasksList.insertAdjacentHTML("beforeend", taskHtml);
  }

  // delete task
  static deletetask(el) {
    if (el.parentElement.classList.contains("remove")) {
      el.parentElement.parentElement.remove();
    }
  }

  //on load calculate number of items left unchecked
  static unfinished_task_calculate() {
    const tasks = store.gettask();
    let sumtasks = 0;

    tasks.forEach((task) => {
      if (task.state === false) {
        sumtasks += 1;
      }
    });
    document.querySelector(".itemsleft span").innerHTML = `${sumtasks}`;
  }
  //clear completed tasks
  static clear() {
    const tasks = store.gettask();

    tasks.forEach((task) => {
      if (task.state === true) {
        store.removetask(task.id);
      }
    });
  }

  // Filter tasks
  static filter(filter) {
    if (filter === "All") {
      ui.displaytasks();
      ui.checked;
    } else if (filter === "Active") {
      const tasks = store.gettask().filter((task) => !task.state);
      ui.displayFilteredTasks(tasks);
    } else if (filter === "Completed") {
      const tasks = store.gettask().filter((task) => task.state);
      ui.displayFilteredTasks(tasks);
    }
  }

  // Display filtered tasks
  static displayFilteredTasks(tasks) {
    const tasksList = document.querySelector(".tasks-list");
    tasksList.innerHTML = ""; // Clear existing tasks

    tasks.forEach((task) => {
      ui.addtasktopage(task);
    });
  }
}
// local storage class
class store {
  static gettask() {
    let tasks;
    if (localStorage.getItem("tasks") === null) {
      tasks = [];
    } else {
      tasks = JSON.parse(localStorage.getItem("tasks"));
    }
    return tasks;
  }
  static addtask(task) {
    const tasks = store.gettask();
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  static removetask(id) {
    const tasks = store.gettask();
    tasks.forEach((task, index) => {
      if (task.id === id) {
        tasks.splice(index, 1);
      }
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  static changestate(id) {
    const tasks = store.gettask();

    tasks.forEach((task, index) => {
      const checkbox = document.querySelector(
        `input[type="checkbox"][value="${task.id}"]`
      );
      const taskContainer = checkbox.closest(".task");
      const taskTitle = taskContainer.querySelector(".task-title");
      if (task.id === id) {
        tasks[index].state = !tasks[index].state;
        taskTitle.classList.toggle("line");
      }
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  static swapid(dragedid, siblingid) {
    const tasks = store.gettask();
    const taskdragIndex = tasks.findIndex((task) => task.id === dragedid);
    const tasksibIndex = tasks.findIndex((task) => task.id === siblingid);
    const newTasks = [...tasks];

    // Check if siblingid is beyond the length of the tasks array
    if (tasksibIndex >= newTasks.length) {
      // Add undefined elements to fill the gap
      let k = tasksibIndex - newTasks.length + 1;
      while (k--) {
        newTasks.push(undefined);
      }
    }

    // Move the task at taskdragIndex to tasksibIndex
    newTasks.splice(tasksibIndex, 0, newTasks.splice(taskdragIndex, 1)[0]);

    // Update local storage
    localStorage.setItem("tasks", JSON.stringify(newTasks));
  }
}
//event to clear input on click
const taskInput = document.querySelector('.input-task input[type="text"]');
taskInput.addEventListener("click", (event) => {
  event.preventDefault();
  if (taskInput.value === "Create a new todo...") {
    taskInput.value = "";
  }
});

taskInput.addEventListener("blur", (event) => {
  if (taskInput.value === "") {
    taskInput.value = "Create a new todo...";
  }
});
//event to switch theme mode
const switchmode = document.querySelector(".switch img");
switchmode.addEventListener("click", (e) => {
  const currentTheme = document.documentElement.getAttribute("data-theme");

  // Toggle the data-theme attribute
  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "light");
    document.querySelector(".switch img").src = "./images/icon-moon.svg";
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    document.querySelector(".switch img").src = "./images/icon-sun.svg";
  }
});

//event to show todo tasks on load in the page
document.addEventListener("DOMContentLoaded", ui.displaytasks());
//event get input of task and send it to storage
document.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    const input = document.querySelector(".input-task input[type='text']");
    if (
      !input.value ||
      input.value.includes("Create a new todo...") ||
      input.value.length >= 100
    ) {
      console.log("Input is empty or contains default text");
      return;
    } else {
      const newtask = new task(input.value, false);
      store.addtask(newtask);
      input.value = "";

      ui.addtasktopage(newtask);

      const tasks = document.querySelectorAll(".task");
      const tasksList = document.querySelector(".tasks-list");

      tasks.forEach((task) => {
        task.addEventListener("dragstart", () => {
          task.classList.add("draging");
        });
        task.addEventListener("dragend", () => {
          task.classList.remove("draging");
        });
      });

      tasksList.addEventListener("dragover", sortinglist);
    }
  }
});
//event remove task from list
document.querySelector(".tasks-list").addEventListener("click", (e) => {
  const id = e.target.alt;
  store.removetask(id);
  ui.deletetask(e.target);
});
//event CHANGE check state
document.querySelector(".tasks-list").addEventListener("click", (e) => {
  const id = e.target.getAttribute("value");
  store.changestate(id);
  ui.unfinished_task_calculate();
});

// event onload calculate unfinshed tsks
document.addEventListener("DOMContentLoaded", ui.unfinished_task_calculate());
//event clear completed tasks
document.querySelector(".clear").addEventListener("click", () => {
  ui.clear();
  ui.displaytasks();
});
//event clear completed tasks

addEventListener("click", (event) => {
  const target = event.target;
  if (target.closest(".filterselector")) {
    if (target.innerHTML === "All") {
      ui.filter("All");
    } else if (target.innerHTML === "Active") {
      ui.filter("Active");
    } else if (target.innerHTML === "Completed") {
      ui.filter("Completed");
    }
  }
});
//event drag and drop
const tasks = document.querySelectorAll(".task");
const tasksList = document.querySelector(".tasks-list");

// Add event listeners for dragstart and dragend events on each task
tasks.forEach((task) => {
  task.addEventListener("dragstart", () => {
    task.classList.add("draging");
  });
  task.addEventListener("dragend", () => {
    task.classList.remove("draging");
  });
});

// Define the sortinglist function to handle dragover event
const sortinglist = (e) => {
  e.preventDefault();

  const draggingTask = tasksList.querySelector(".draging");
  const siblings = [...tasksList.querySelectorAll(".task:not(.draging)")];
  const nextSibling = siblings.find((sibling) => {
    return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
  });

  if (draggingTask) {
    if (nextSibling) {
      tasksList.insertBefore(draggingTask, nextSibling);
    } else {
      // If nextSibling is null, insert draggingTask at the end of the list
      tasksList.appendChild(draggingTask);
    }

    const draggingtask = draggingTask.querySelector(
      "input[type='checkbox']"
    ).value;
    const nextSiblingValue = nextSibling
      ? nextSibling.querySelector("input[type='checkbox']").value
      : null;

    store.swapid(draggingtask, nextSiblingValue);
  }
};

// Add dragover event listener to the tasksList container
tasksList.addEventListener("dragover", sortinglist);

// Fix typo in event listener: dragenter instead of draenter
tasksList.addEventListener("dragenter", (e) => e.preventDefault());
