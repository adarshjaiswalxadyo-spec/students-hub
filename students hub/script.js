// Student Hub - AI Productivity App JavaScript

class StudentHub {
    constructor() {
        this.timer = {
            minutes: 25,
            seconds: 0,
            totalSeconds: 1500,
            isRunning: false,
            isPaused: false,
            interval: null
        };
        
        this.tasks = [];
        this.notes = [];
        this.focusMinutes = 0;
        this.isDarkMode = false;
        
        this.init();
    }
    
    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.updateUI();
        this.initializeAnimations();
        this.loadAISuggestions();
        this.loadMotivationalQuote();
    }
    
    // Local Storage Management
    loadFromLocalStorage() {
        const savedTasks = localStorage.getItem('studentHub_tasks');
        const savedNotes = localStorage.getItem('studentHub_notes');
        const savedFocusMinutes = localStorage.getItem('studentHub_focusMinutes');
        const savedDarkMode = localStorage.getItem('studentHub_darkMode');
        
        if (savedTasks) this.tasks = JSON.parse(savedTasks);
        if (savedNotes) this.notes = JSON.parse(savedNotes);
        if (savedFocusMinutes) this.focusMinutes = parseInt(savedFocusMinutes);
        if (savedDarkMode) {
            this.isDarkMode = savedDarkMode === 'true';
            this.applyDarkMode();
        }
    }
    
    saveToLocalStorage() {
        localStorage.setItem('studentHub_tasks', JSON.stringify(this.tasks));
        localStorage.setItem('studentHub_notes', JSON.stringify(this.notes));
        localStorage.setItem('studentHub_focusMinutes', this.focusMinutes.toString());
        localStorage.setItem('studentHub_darkMode', this.isDarkMode.toString());
    }
    
    // Event Listeners
    setupEventListeners() {
        // Timer controls
        document.getElementById('startTimer').addEventListener('click', () => this.startTimer());
        document.getElementById('pauseTimer').addEventListener('click', () => this.pauseTimer());
        document.getElementById('resetTimer').addEventListener('click', () => this.resetTimer());
        
        // Timer presets
        document.querySelectorAll('.timer-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const minutes = parseInt(e.target.dataset.minutes);
                this.setTimerDuration(minutes);
            });
        });
        
        // Task management
        document.getElementById('addTask').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        // Notes management
        document.getElementById('addNote').addEventListener('click', () => this.addNote());
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Distraction blocker
        document.getElementById('distractionBlocker').addEventListener('click', () => this.activateFocusMode());
        document.getElementById('exitFocusMode').addEventListener('click', () => this.deactivateFocusMode());
        
        // AI and quotes
        document.getElementById('refreshSuggestions').addEventListener('click', () => this.loadAISuggestions());
        document.getElementById('newQuote').addEventListener('click', () => this.loadMotivationalQuote());
    }
    
    // Pomodoro Timer
    startTimer() {
        if (this.timer.isRunning && !this.timer.isPaused) return;
        
        this.timer.isRunning = true;
        this.timer.isPaused = false;
        
        this.timer.interval = setInterval(() => {
            if (this.timer.seconds === 0) {
                if (this.timer.minutes === 0) {
                    this.completeTimer();
                    return;
                }
                this.timer.minutes--;
                this.timer.seconds = 59;
            } else {
                this.timer.seconds--;
            }
            
            this.updateTimerDisplay();
            this.updateTimerCircle();
        }, 1000);
        
        document.getElementById('timerStatus').textContent = 'Running';
        this.animateTimerStart();
    }
    
    pauseTimer() {
        if (!this.timer.isRunning || this.timer.isPaused) return;
        
        this.timer.isPaused = true;
        clearInterval(this.timer.interval);
        
        document.getElementById('timerStatus').textContent = 'Paused';
    }
    
    resetTimer() {
        clearInterval(this.timer.interval);
        this.timer.isRunning = false;
        this.timer.isPaused = false;
        this.timer.minutes = 25;
        this.timer.seconds = 0;
        this.timer.totalSeconds = 1500;
        
        this.updateTimerDisplay();
        this.updateTimerCircle();
        document.getElementById('timerStatus').textContent = 'Ready';
    }
    
    setTimerDuration(minutes) {
        this.resetTimer();
        this.timer.minutes = minutes;
        this.timer.totalSeconds = minutes * 60;
        this.updateTimerDisplay();
        this.updateTimerCircle();
    }
    
    completeTimer() {
        clearInterval(this.timer.interval);
        this.timer.isRunning = false;
        this.timer.isPaused = false;
        
        this.focusMinutes += this.timer.totalSeconds / 60;
        this.saveToLocalStorage();
        this.updateProgressTracker();
        
        document.getElementById('timerStatus').textContent = 'Completed!';
        this.showNotification('Pomodoro session completed! Great job!', 'success');
        
        // Play completion sound (using Web Audio API)
        this.playCompletionSound();
        
        // Reset after 3 seconds
        setTimeout(() => this.resetTimer(), 3000);
    }
    
    updateTimerDisplay() {
        const minutes = String(this.timer.minutes).padStart(2, '0');
        const seconds = String(this.timer.seconds).padStart(2, '0');
        document.getElementById('timerDisplay').textContent = `${minutes}:${seconds}`;
    }
    
    updateTimerCircle() {
        const circle = document.getElementById('timerCircle');
        const currentSeconds = this.timer.minutes * 60 + this.timer.seconds;
        const progress = currentSeconds / this.timer.totalSeconds;
        const circumference = 2 * Math.PI * 88;
        const offset = circumference * (1 - progress);
        
        circle.style.strokeDashoffset = offset;
        
        if (this.timer.isRunning && !this.timer.isPaused) {
            circle.classList.add('timer-circle-active');
        } else {
            circle.classList.remove('timer-circle-active');
        }
    }
    
    // Task Management
    addTask() {
        const input = document.getElementById('taskInput');
        const taskText = input.value.trim();
        
        if (!taskText) return;
        
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(task);
        this.saveToLocalStorage();
        this.renderTasks();
        this.updateProgressTracker();
        
        input.value = '';
        this.animateTaskAddition(task.id);
    }
    
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToLocalStorage();
            this.renderTasks();
            this.updateProgressTracker();
        }
    }
    
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveToLocalStorage();
        this.renderTasks();
        this.updateProgressTracker();
    }
    
    renderTasks() {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';
        
        this.tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskElement.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3 flex-1">
                        <input type="checkbox" ${task.completed ? 'checked' : ''} 
                            class="custom-checkbox" onchange="app.toggleTask(${task.id})">
                        <span class="${task.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-white'}">${task.text}</span>
                    </div>
                    <button onclick="app.deleteTask(${task.id})" 
                        class="text-red-500 hover:text-red-700 transition-colors duration-200">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            taskList.appendChild(taskElement);
        });
    }
    
    // Notes Management
    addNote() {
        const textarea = document.getElementById('noteInput');
        const noteText = textarea.value.trim();
        
        if (!noteText) return;
        
        const note = {
            id: Date.now(),
            text: noteText,
            createdAt: new Date().toISOString()
        };
        
        this.notes.unshift(note);
        this.saveToLocalStorage();
        this.renderNotes();
        this.updateProgressTracker();
        
        textarea.value = '';
        this.animateNoteAddition(note.id);
    }
    
    deleteNote(id) {
        this.notes = this.notes.filter(n => n.id !== id);
        this.saveToLocalStorage();
        this.renderNotes();
        this.updateProgressTracker();
    }
    
    renderNotes() {
        const notesList = document.getElementById('notesList');
        notesList.innerHTML = '';
        
        this.notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-item';
            noteElement.innerHTML = `
                <div class="flex justify-between items-start">
                    <p class="text-gray-800 dark:text-gray-200 flex-1 pr-2">${note.text}</p>
                    <button onclick="app.deleteNote(${note.id})" 
                        class="text-red-500 hover:text-red-700 transition-colors duration-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    ${new Date(note.createdAt).toLocaleString()}
                </div>
            `;
            notesList.appendChild(noteElement);
        });
    }
    
    // Theme Management
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.applyDarkMode();
        this.saveToLocalStorage();
    }
    
    applyDarkMode() {
        if (this.isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
    
    // Focus Mode
    activateFocusMode() {
        const overlay = document.getElementById('distractionOverlay');
        overlay.classList.remove('hidden');
        overlay.classList.add('flex', 'focus-mode-overlay');
        
        // Start timer if not running
        if (!this.timer.isRunning) {
            this.startTimer();
        }
    }
    
    deactivateFocusMode() {
        const overlay = document.getElementById('distractionOverlay');
        overlay.classList.add('hidden');
        overlay.classList.remove('flex', 'focus-mode-overlay');
    }
    
    // AI Suggestions (Mock implementation)
    loadAISuggestions() {
        const suggestionsContainer = document.getElementById('aiSuggestions');
        suggestionsContainer.innerHTML = '<div class="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg border-l-4 border-purple-500 animate-pulse"><p class="text-gray-700 dark:text-gray-300">Loading AI suggestions...</p></div>';
        
        // Simulate AI API call
        setTimeout(() => {
            const suggestions = this.generateAISuggestions();
            this.renderAISuggestions(suggestions);
        }, 1500);
    }
    
    generateAISuggestions() {
        const suggestions = [
            {
                title: "Study Technique",
                content: "Try the Feynman Technique: Explain concepts in simple terms as if teaching someone else.",
                icon: "🧠"
            },
            {
                title: "Time Management",
                content: "Break large tasks into smaller, manageable chunks. This reduces overwhelm and increases productivity.",
                icon: "⏰"
            },
            {
                title: "Focus Tip",
                content: "Use the 2-minute rule: If a task takes less than 2 minutes, do it immediately.",
                icon: "🎯"
            }
        ];
        
        return suggestions;
    }
    
    renderAISuggestions(suggestions) {
        const container = document.getElementById('aiSuggestions');
        container.innerHTML = '';
        
        suggestions.forEach((suggestion, index) => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'ai-suggestion-card animate-fadeInUp';
            suggestionElement.style.animationDelay = `${index * 0.1}s`;
            suggestionElement.innerHTML = `
                <div class="flex items-start space-x-3">
                    <span class="text-2xl">${suggestion.icon}</span>
                    <div>
                        <h4 class="font-semibold text-gray-800 dark:text-white">${suggestion.title}</h4>
                        <p class="text-gray-600 dark:text-gray-300 text-sm mt-1">${suggestion.content}</p>
                    </div>
                </div>
            `;
            container.appendChild(suggestionElement);
        });
    }
    
    // Motivational Quotes
    loadMotivationalQuote() {
        const quotes = [
            "The expert in anything was once a beginner.",
            "Success is the sum of small efforts repeated day in and day out.",
            "Don't watch the clock; do what it does. Keep going.",
            "The future depends on what you do today.",
            "Education is the passport to the future.",
            "Believe you can and you're halfway there.",
            "The only way to do great work is to love what you do.",
            "Success is not final, failure is not fatal: it is the courage to continue that counts."
        ];
        
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        const quoteElement = document.getElementById('motivationalQuote');
        
        // Fade out, change text, fade in
        quoteElement.style.opacity = '0';
        setTimeout(() => {
            quoteElement.textContent = randomQuote;
            quoteElement.style.opacity = '1';
        }, 300);
    }
    
    // Progress Tracker
    updateProgressTracker() {
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const totalTasks = this.tasks.length;
        
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('totalNotes').textContent = this.notes.length;
        document.getElementById('focusMinutes').textContent = Math.floor(this.focusMinutes);
        
        // Update task progress
        const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        document.getElementById('taskProgress').textContent = `${completedTasks}/${totalTasks} completed`;
        document.getElementById('taskProgressBar').style.width = `${progressPercentage}%`;
        
        // Update activity chart
        this.updateActivityChart();
    }
    
    updateActivityChart() {
        const chartContainer = document.getElementById('activityChart');
        const hours = ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'];
        
        chartContainer.innerHTML = '<div class="flex items-end justify-between h-32 space-x-2">';
        
        hours.forEach(hour => {
            const height = Math.random() * 100; // Mock data
            chartContainer.innerHTML += `
                <div class="flex-1 flex flex-col items-center">
                    <div class="activity-bar w-full" style="height: ${height}%"></div>
                    <span class="text-xs text-gray-600 dark:text-gray-400 mt-1">${hour}</span>
                </div>
            `;
        });
        
        chartContainer.innerHTML += '</div>';
    }
    
    // Animations
    initializeAnimations() {
        // Initial animations
        gsap.from("header", { duration: 0.8, y: -50, opacity: 0 });
        gsap.from("section", { duration: 1, y: 50, opacity: 0, stagger: 0.2 });
        
        // Hover animations for cards
        gsap.utils.toArray("section > div").forEach(card => {
            card.addEventListener("mouseenter", () => {
                gsap.to(card, { duration: 0.3, scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" });
            });
            
            card.addEventListener("mouseleave", () => {
                gsap.to(card, { duration: 0.3, scale: 1, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" });
            });
        });
    }
    
    animateTimerStart() {
        gsap.to("#timerCircle", { duration: 1, rotation: 360, ease: "power2.inOut" });
    }
    
    animateTaskAddition(taskId) {
        setTimeout(() => {
            const element = document.querySelector(`[onclick="app.deleteTask(${taskId})"]`).closest('.task-item');
            gsap.from(element, { duration: 0.5, x: -50, opacity: 0 });
        }, 50);
    }
    
    animateNoteAddition(noteId) {
        setTimeout(() => {
            const element = document.querySelector(`[onclick="app.deleteNote(${noteId})"]`).closest('.note-item');
            gsap.from(element, { duration: 0.5, y: -30, opacity: 0 });
        }, 50);
    }
    
    // Sound Effects
    playCompletionSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
    
    // Notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // UI Updates
    updateUI() {
        this.renderTasks();
        this.renderNotes();
        this.updateProgressTracker();
        this.updateTimerDisplay();
        this.updateTimerCircle();
    }
}

// Initialize the app
const app = new StudentHub();

// Make app globally accessible for inline event handlers
window.app = app;
