// ==========================================
// STUDYFLOW - MAIN JAVASCRIPT
// ==========================================

const API_URL = (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" || window.location.protocol === "file:")
    ? (localStorage.getItem("studyflow_api_url") || "http://127.0.0.1:8000")
    : (localStorage.getItem("studyflow_api_url") || "https://studyflow-backend.onrender.com");

let tasks = [];
let editingTaskId = null;
let currentFilter = "all";
let searchTerm = "";


// ==========================================
// USER FUNCTIONS
// ==========================================

function getCurrentUser() {
    const localUser = localStorage.getItem("studyflowUser");
    const sessionUser = sessionStorage.getItem("studyflowUser");

    if (localUser) {
        return JSON.parse(localUser);
    }

    if (sessionUser) {
        return JSON.parse(sessionUser);
    }

    return null;
}


function getUserId() {
    const user = getCurrentUser();
    return user ? user.id : null;
}


function setupUserInfo() {
    const user = getCurrentUser();

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    const userNameElements = document.querySelectorAll(
        "#userName, #welcomeName"
    );

    userNameElements.forEach(element => {
        if (element.id === "welcomeName") {
            element.textContent = user.full_name;
        } else {
            element.textContent = user.full_name;
        }
    });

    const avatar = document.getElementById("userAvatar");

    if (avatar) {
        avatar.textContent = user.full_name
            .charAt(0)
            .toUpperCase();
    }
}


// ==========================================
// API FUNCTION
// ==========================================

async function apiRequest(url, options = {}) {

    const response = await fetch(url, options);

    let data;

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.detail || "Something went wrong"
        );
    }

    return data;
}


// ==========================================
// LOAD TASKS
// ==========================================

async function loadTasks() {

    const userId = getUserId();

    if (!userId) return;

    try {

        tasks = await apiRequest(
            `${API_URL}/api/tasks/${userId}`
        );

        updateAllPages();

    } catch (error) {

        console.error("Error loading tasks:", error);

    }
}


// ==========================================
// UPDATE ALL PAGES
// ==========================================

function updateAllPages() {

    renderPlanner();
    updateDashboard();
    updateProgress();
    updateStats();
}


// ==========================================
// STATISTICS
// ==========================================

function calculateStats() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    const percentage =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);

    return {
        total,
        completed,
        pending,
        percentage
    };
}


function updateStats() {

    const stats = calculateStats();

    const elements = {
        totalTasks: stats.total,
        completedTasks: stats.completed,
        pendingTasks: stats.pending,
        progressPercentage: `${stats.percentage}%`,

        plannerTotal: stats.total,
        plannerCompleted: stats.completed,
        plannerPending: stats.pending,
        plannerPercentage: `${stats.percentage}%`,

        progressTotal: stats.total,
        progressCompleted: stats.completed,
        progressPending: stats.pending
    };

    Object.keys(elements).forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = elements[id];
        }

    });
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {

    if (!text) return "";

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(date) {

    if (!date) return "No deadline";

    const d = new Date(date + "T00:00:00");

    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// ==========================================
// PRIORITY CLASS
// ==========================================

function priorityClass(priority) {

    if (!priority) return "priority-medium";

    return `priority-${priority.toLowerCase()}`;
}


// ==========================================
// PLANNER
// ==========================================

function renderPlanner() {

    const taskList = document.getElementById("taskList");

    if (!taskList) return;

    let filteredTasks = [...tasks];

    // Filter
    if (currentFilter === "pending") {

        filteredTasks = filteredTasks.filter(
            task => !task.completed
        );

    } else if (currentFilter === "completed") {

        filteredTasks = filteredTasks.filter(
            task => task.completed
        );

    }

    // Search
    if (searchTerm) {

        filteredTasks = filteredTasks.filter(task =>

            task.title
                .toLowerCase()
                .includes(searchTerm.toLowerCase())

            ||

            task.subject
                .toLowerCase()
                .includes(searchTerm.toLowerCase())

        );

    }

    const taskCountLabel =
        document.getElementById("taskCountLabel");

    if (taskCountLabel) {

        taskCountLabel.textContent =
            `${filteredTasks.length} task${filteredTasks.length !== 1 ? "s" : ""}`;

    }


    if (filteredTasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-state">
                <h3>No tasks found</h3>
                <p>Add a study task to start planning.</p>
            </div>
        `;

        return;
    }


    taskList.innerHTML = filteredTasks.map(task => {

        return `
            <div class="task-item ${task.completed ? "completed" : ""}">

                <div class="task-content">

                    <button
                        class="task-action-btn"
                        onclick="toggleTask(${task.id})"
                        title="${task.completed ? "Undo" : "Complete"}"
                    >
                        ${task.completed ? "↩" : "✓"}
                    </button>

                    <div class="task-info">

                        <h3 class="task-title">
                            ${escapeHTML(task.title)}
                        </h3>

                        <div class="task-meta">

                            <span>
                                📚 ${escapeHTML(task.subject)}
                            </span>

                            <span>
                                📅 ${formatDate(task.deadline)}
                            </span>

                            <span class="priority-badge ${priorityClass(task.priority)}">
                                ${escapeHTML(task.priority)}
                            </span>

                        </div>

                        ${task.description
                ? `<p>${escapeHTML(task.description)}</p>`
                : ""
            }

                    </div>

                </div>


                <div class="task-actions">

                    <button
                        class="task-action-btn"
                        onclick="editTask(${task.id})"
                        title="Edit task"
                    >
                        ✏️
                    </button>

                    <button
                        class="task-action-btn"
                        onclick="deleteTask(${task.id})"
                        title="Delete task"
                    >
                        🗑️
                    </button>

                </div>

            </div>
        `;

    }).join("");
}


// ==========================================
// OPEN TASK MODAL
// ==========================================

function openTaskModal() {

    const modal =
        document.getElementById("taskModal");

    const form =
        document.getElementById("taskForm");

    if (!modal || !form) return;

    editingTaskId = null;

    form.reset();

    const heading =
        modal.querySelector("h2");

    if (heading) {
        heading.textContent = "Add Study Task";
    }

    const submitButton =
        form.querySelector('button[type="submit"]');

    if (submitButton) {
        submitButton.textContent = "Add Task";
    }

    modal.classList.add("active");
}


// ==========================================
// CLOSE TASK MODAL
// ==========================================

function closeTaskModal() {

    const modal =
        document.getElementById("taskModal");

    if (modal) {
        modal.classList.remove("active");
    }

    editingTaskId = null;
}


// ==========================================
// CREATE / UPDATE TASK
// ==========================================

async function handleTaskSubmit(event) {

    event.preventDefault();

    const userId = getUserId();

    if (!userId) return;


    const title =
        document.getElementById("taskTitle").value.trim();

    const subject =
        document.getElementById("taskSubject").value.trim();

    const deadline =
        document.getElementById("taskDeadline").value;

    const description =
        document.getElementById("taskDescription").value.trim();


    const priorityElement =
        document.querySelector(
            'input[name="priority"]:checked'
        );

    const priority =
        priorityElement
            ? priorityElement.value
            : "Medium";


    const taskData = {

        title,
        subject,
        deadline: deadline || null,
        description: description || null,
        priority

    };


    try {

        if (editingTaskId) {

            await apiRequest(
                `${API_URL}/api/tasks/${editingTaskId}?user_id=${userId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(taskData)
                }
            );

        } else {

            await apiRequest(
                `${API_URL}/api/tasks/?user_id=${userId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(taskData)
                }
            );

        }


        closeTaskModal();

        await loadTasks();


    } catch (error) {

        alert(error.message);

    }
}


// ==========================================
// EDIT TASK
// ==========================================

function editTask(taskId) {

    const task =
        tasks.find(t => t.id === taskId);

    if (!task) return;


    editingTaskId = taskId;


    document.getElementById("taskTitle").value =
        task.title || "";

    document.getElementById("taskSubject").value =
        task.subject || "";

    document.getElementById("taskDeadline").value =
        task.deadline || "";

    document.getElementById("taskDescription").value =
        task.description || "";


    const priority =
        document.querySelector(
            `input[name="priority"][value="${task.priority}"]`
        );

    if (priority) {
        priority.checked = true;
    }


    const modal =
        document.getElementById("taskModal");

    const heading =
        modal.querySelector("h2");

    if (heading) {
        heading.textContent = "Edit Study Task";
    }


    const submitButton =
        document
            .getElementById("taskForm")
            .querySelector('button[type="submit"]');

    if (submitButton) {
        submitButton.textContent = "Update Task";
    }


    modal.classList.add("active");
}


// ==========================================
// DELETE TASK
// ==========================================

async function deleteTask(taskId) {

    const userId = getUserId();

    if (!userId) return;


    const confirmDelete =
        confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) return;


    try {

        await apiRequest(
            `${API_URL}/api/tasks/${taskId}?user_id=${userId}`,
            {
                method: "DELETE"
            }
        );

        await loadTasks();

    } catch (error) {

        alert(error.message);

    }
}


// ==========================================
// COMPLETE / UNDO TASK
// ==========================================

async function toggleTask(taskId) {

    const userId = getUserId();

    if (!userId) return;


    try {

        await apiRequest(
            `${API_URL}/api/tasks/${taskId}/complete?user_id=${userId}`,
            {
                method: "PATCH"
            }
        );

        await loadTasks();

    } catch (error) {

        alert(error.message);

    }
}


// ==========================================
// SEARCH
// ==========================================

function setupSearch() {

    const search =
        document.getElementById("taskSearch");

    if (!search) return;


    search.addEventListener("input", function () {

        searchTerm = this.value.trim();

        renderPlanner();

    });
}


// ==========================================
// FILTER BUTTONS
// ==========================================

function setupFilters() {

    const buttons =
        document.querySelectorAll(".filter-btn");

    buttons.forEach(button => {

        button.addEventListener("click", function () {

            buttons.forEach(btn =>
                btn.classList.remove("active")
            );

            this.classList.add("active");

            currentFilter =
                this.dataset.filter || "all";

            renderPlanner();

        });

    });
}


// ==========================================
// PLANNER EVENTS
// ==========================================

function setupPlanner() {

    const openButton =
        document.getElementById("openTaskModal");

    const emptyButton =
        document.getElementById("emptyAddTask");

    const closeButton =
        document.getElementById("closeTaskModal");

    const cancelButton =
        document.getElementById("cancelTask");

    const form =
        document.getElementById("taskForm");


    if (openButton) {

        openButton.addEventListener(
            "click",
            openTaskModal
        );

    }


    if (emptyButton) {

        emptyButton.addEventListener(
            "click",
            openTaskModal
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeTaskModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeTaskModal
        );

    }


    if (form) {

        form.addEventListener(
            "submit",
            handleTaskSubmit
        );

    }


    setupSearch();

    setupFilters();

}


// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard() {

    const recentTasks =
        document.getElementById("recentTasks");

    if (!recentTasks) return;


    const recent =
        [...tasks]
            .sort((a, b) => b.id - a.id)
            .slice(0, 5);


    if (recent.length === 0) {

        recentTasks.innerHTML = `
            <div class="empty-state">
                <p>No tasks added yet.</p>
            </div>
        `;

    } else {

        recentTasks.innerHTML =
            recent.map(task => `

                <div class="task-item ${task.completed ? "completed" : ""}">

                    <div class="task-content">

                        <div class="task-info">

                            <h3 class="task-title">
                                ${escapeHTML(task.title)}
                            </h3>

                            <div class="task-meta">

                                <span>
                                    📚 ${escapeHTML(task.subject)}
                                </span>

                                <span>
                                    📅 ${formatDate(task.deadline)}
                                </span>

                            </div>

                        </div>

                    </div>

                    <span class="priority-badge ${priorityClass(task.priority)}">
                        ${escapeHTML(task.priority)}
                    </span>

                </div>

            `).join("");

    }


    const stats = calculateStats();


    const progressCircle =
        document.getElementById("progressCircle");

    if (progressCircle) {

        progressCircle.style.setProperty(
            "--progress",
            `${stats.percentage}%`
        );

    }

}


// ==========================================
// PROGRESS PAGE
// ==========================================

function updateProgress() {

    const progressPage =
        document.getElementById("bigProgressPercentage");

    if (!progressPage) return;


    const stats = calculateStats();


    const overallProgressText =
        document.getElementById("overallProgressText");

    if (overallProgressText) {
        overallProgressText.textContent =
            `${stats.percentage}%`;
    }


    const bigProgressPercentage =
        document.getElementById("bigProgressPercentage");

    if (bigProgressPercentage) {
        bigProgressPercentage.textContent =
            `${stats.percentage}%`;
    }


    const largeProgressFill =
        document.getElementById("largeProgressFill");

    if (largeProgressFill) {

        largeProgressFill.style.width =
            `${stats.percentage}%`;

    }


    document.getElementById("completedCount")
        ?.replaceChildren(
            document.createTextNode(stats.completed)
        );

    document.getElementById("totalCount")
        ?.replaceChildren(
            document.createTextNode(stats.total)
        );


    updateSubjectProgress();
    updateAchievements();
    updateMotivation();

}


// ==========================================
// SUBJECT PROGRESS
// ==========================================

function updateSubjectProgress() {

    const container =
        document.getElementById("subjectProgressList");

    if (!container) return;


    if (tasks.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <p>No subject progress available yet.</p>
            </div>
        `;

        return;
    }


    const subjects = {};


    tasks.forEach(task => {

        const subject =
            task.subject || "Other";

        if (!subjects[subject]) {

            subjects[subject] = {
                total: 0,
                completed: 0
            };

        }


        subjects[subject].total++;

        if (task.completed) {
            subjects[subject].completed++;
        }

    });


    container.innerHTML =
        Object.keys(subjects).map(subject => {

            const data = subjects[subject];

            const percentage =
                Math.round(
                    (data.completed / data.total) * 100
                );


            return `

                <div class="subject-row">

                    <div class="subject-info">

                        <strong>
                            ${escapeHTML(subject)}
                        </strong>

                        <span>
                            ${data.completed}/${data.total} completed
                        </span>

                    </div>

                    <div class="subject-progress-bar">

                        <div
                            class="subject-progress-fill"
                            style="width:${percentage}%"
                        ></div>

                    </div>

                    <strong>
                        ${percentage}%
                    </strong>

                </div>

            `;

        }).join("");

}


// ==========================================
// ACHIEVEMENTS
// ==========================================

function updateAchievements() {

    const completed =
        calculateStats().completed;


    updateAchievement(
        "achievementFirst",
        completed >= 1
    );

    updateAchievement(
        "achievementFive",
        completed >= 5
    );

    updateAchievement(
        "achievementTen",
        completed >= 10
    );

    updateAchievement(
        "achievementAll",
        tasks.length > 0 &&
        completed === tasks.length
    );

}


function updateAchievement(id, unlocked) {

    const achievement =
        document.getElementById(id);

    if (!achievement) return;


    const status =
        achievement.querySelector(
            ".achievement-status"
        );


    if (status) {

        status.textContent =
            unlocked
                ? "Unlocked ✓"
                : "Locked";

    }


    achievement.classList.toggle(
        "unlocked",
        unlocked
    );

}


// ==========================================
// MOTIVATION
// ==========================================

function updateMotivation() {

    const title =
        document.getElementById("motivationTitle");

    const text =
        document.getElementById("motivationText");


    if (!title || !text) return;


    const percentage =
        calculateStats().percentage;


    if (percentage === 100) {

        title.textContent =
            "Excellent work! 🎉";

        text.textContent =
            "You completed all your study tasks. Keep up the great work!";

    }

    else if (percentage >= 75) {

        title.textContent =
            "Almost there! 💪";

        text.textContent =
            "You're doing great. Finish the remaining tasks!";

    }

    else if (percentage >= 50) {

        title.textContent =
            "Keep going! 🚀";

        text.textContent =
            "You're halfway there. Stay consistent with your studies.";

    }

    else if (percentage > 0) {

        title.textContent =
            "Good start! 🌱";

        text.textContent =
            "Every completed task brings you closer to your goals.";

    }

    else {

        title.textContent =
            "Ready to begin? 📚";

        text.textContent =
            "Add your first study task and start planning your progress.";

    }

}


// ==========================================
// LOGOUT
// ==========================================

function setupLogout() {

    const logoutButton =
        document.getElementById("logoutBtn");

    if (!logoutButton) return;


    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "studyflowUser"
            );

            sessionStorage.removeItem(
                "studyflowUser"
            );

            window.location.href =
                "index.html";

        }
    );

}


// ==========================================
// SCHEDULE
// ==========================================

let currentWeekOffset = 0;
let scheduleEditId = null;


function getScheduleKey() {

    const userId = getUserId();

    return `studyflowSchedule_${userId}`;

}


function getSchedule() {

    return JSON.parse(
        localStorage.getItem(
            getScheduleKey()
        ) || "[]"
    );

}


function saveSchedule(data) {

    localStorage.setItem(
        getScheduleKey(),
        JSON.stringify(data)
    );

}


function setupSchedule() {

    const openButton =
        document.getElementById("openScheduleModal");

    const closeButton =
        document.getElementById("closeScheduleModal");

    const form =
        document.getElementById("scheduleForm");

    const previousWeek =
        document.getElementById("previousWeek");

    const nextWeek =
        document.getElementById("nextWeek");

    const todayButton =
        document.getElementById("todayBtn");


    // OPEN MODAL

    if (openButton) {

        openButton.addEventListener(
            "click",
            function () {

                document
                    .getElementById("scheduleModal")
                    ?.classList.add("active");

            }
        );

    }


    // CLOSE MODAL

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeScheduleModal
        );

    }


    // FORM SUBMIT

    if (form) {

        form.addEventListener(
            "submit",
            addScheduleSession
        );

    }


    // PREVIOUS WEEK

    if (previousWeek) {

        previousWeek.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                currentWeekOffset--;

                renderSchedule();

            }
        );

    }


    // NEXT WEEK

    if (nextWeek) {

        nextWeek.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                currentWeekOffset++;

                renderSchedule();

            }
        );

    }


    // TODAY BUTTON

    if (todayButton) {

        todayButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                currentWeekOffset = 0;

                renderSchedule();

            }
        );

    }


    renderSchedule();

}


function closeScheduleModal() {

    document
        .getElementById("scheduleModal")
        ?.classList.remove("active");

}


function addScheduleSession(event) {

    event.preventDefault();


    const session = {

        id: Date.now(),

        title:
            document.getElementById("sessionTitle").value,

        subject:
            document.getElementById("sessionSubject").value,

        day:
            document.getElementById("sessionDay").value,

        start:
            document.getElementById("sessionStart").value,

        end:
            document.getElementById("sessionEnd").value,

        notes:
            document.getElementById("sessionNotes").value,

        // Store the week
        weekOffset:
            currentWeekOffset

    };


    const schedule =
        getSchedule();

    schedule.push(session);

    saveSchedule(schedule);


    event.target.reset();

    closeScheduleModal();

    renderSchedule();

}


function renderSchedule() {

    const columns =
        document.querySelectorAll(".day-sessions");

    if (!columns.length) return;


    const schedule =
        getSchedule();


    const dayNames = [

        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"

    ];


    // WEEK TITLE

    const today =
        new Date();

    const currentDay =
        today.getDay();

    const monday =
        new Date(today);

    monday.setDate(
        today.getDate() -
        (currentDay === 0 ? 6 : currentDay - 1) +
        (currentWeekOffset * 7)
    );


    const weekTitle =
        document.getElementById("weekTitle");

    const weekRange =
        document.getElementById("weekRange");


    if (weekTitle) {

        if (currentWeekOffset === 0) {

            weekTitle.textContent =
                "This Week";

        } else if (currentWeekOffset > 0) {

            weekTitle.textContent =
                `${currentWeekOffset} Week${
                    currentWeekOffset > 1 ? "s" : ""
                } Ahead`;

        } else {

            weekTitle.textContent =
                `${Math.abs(currentWeekOffset)} Week${
                    Math.abs(currentWeekOffset) > 1 ? "s" : ""
                } Ago`;

        }

    }


    if (weekRange) {

        const sunday =
            new Date(monday);

        sunday.setDate(
            monday.getDate() + 6
        );


        const options = {
            day: "numeric",
            month: "short"
        };


        weekRange.textContent =
            `${monday.toLocaleDateString(
                "en-US",
                options
            )} - ${sunday.toLocaleDateString(
                "en-US",
                options
            )}`;

    }


    // DISPLAY SESSIONS

    columns.forEach(
        function (column, index) {

            const day =
                dayNames[index];


            const sessions =
                schedule.filter(
                    function (session) {

                        return (

                            session.day &&
                            session.day.toLowerCase() ===
                            day.toLowerCase() &&

                            // Old schedules without
                            // weekOffset belong to current week
                            (session.weekOffset ?? 0) ===
                            currentWeekOffset

                        );

                    }
                );


            column.innerHTML =
                sessions.map(
                    function (session) {

                        return `

                            <div class="schedule-session">

                                <strong>
                                    ${escapeHTML(
                                        session.title
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        session.subject
                                    )}
                                </span>

                                <small>
                                    ${session.start}
                                    -
                                    ${session.end}
                                </small>

                                <button
                                    class="task-action-btn"
                                    onclick="deleteScheduleSession(${session.id})"
                                >
                                    🗑️
                                </button>

                            </div>

                        `;

                    }
                ).join("");


        }
    );


    updateTodayPlan(schedule);

}


function deleteScheduleSession(id) {

    const schedule =
        getSchedule()
            .filter(
                function (session) {

                    return session.id !== id;

                }
            );


    saveSchedule(schedule);

    renderSchedule();

}


function updateTodayPlan(schedule) {

    const todayPlan =
        document.getElementById("todayPlan");

    if (!todayPlan) return;


    const today =
        new Date().toLocaleDateString(
            "en-US",
            {
                weekday: "long"
            }
        );


    const todaySessions =
        schedule.filter(
            function (session) {

                return (

                    session.day &&
                    session.day.toLowerCase() ===
                    today.toLowerCase() &&

                    (session.weekOffset ?? 0) ===
                    currentWeekOffset

                );

            }
        );


    if (!todaySessions.length) {

        todayPlan.innerHTML =
            "<p>No study sessions planned for today.</p>";

        return;

    }


    todayPlan.innerHTML =
        todaySessions.map(
            function (session) {

                return `

                    <div class="schedule-session">

                        <strong>
                            ${escapeHTML(
                                session.title
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                session.subject
                            )}
                        </span>

                        <small>
                            ${session.start}
                            -
                            ${session.end}
                        </small>

                    </div>

                `;

            }
        ).join("");

}


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("StudyFlow script loaded");

    setupUserInfo();
    setupLogout();
    setupPlanner();
    setupSchedule();
    loadTasks();

});