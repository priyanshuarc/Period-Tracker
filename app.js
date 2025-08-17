// Period Tracking App - Main JavaScript File

class PeriodTrackingApp {
    constructor() {
        this.currentDate = new Date();
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.selectedFlow = null;
        this.selectedSymptoms = new Set();
        this.selectedMoods = new Set();
        this.userData = this.loadUserData();
        
        this.symptoms = [
            { name: 'Cramps', icon: 'fas fa-exclamation-triangle', category: 'physical' },
            { name: 'Headache', icon: 'fas fa-head-side-virus', category: 'physical' },
            { name: 'Bloating', icon: 'fas fa-circle', category: 'physical' },
            { name: 'Fatigue', icon: 'fas fa-battery-quarter', category: 'energy' },
            { name: 'Mood swings', icon: 'fas fa-emotion', category: 'emotional' },
            { name: 'Acne', icon: 'fas fa-dot-circle', category: 'skin' },
            { name: 'Back pain', icon: 'fas fa-hand-back-fist', category: 'physical' },
            { name: 'Nausea', icon: 'fas fa-dizzy', category: 'physical' }
        ];
        
        this.moods = [
            { name: 'Happy', icon: 'fas fa-smile', emoji: '😊' },
            { name: 'Sad', icon: 'fas fa-frown', emoji: '😢' },
            { name: 'Anxious', icon: 'fas fa-anxiety', emoji: '😰' },
            { name: 'Irritable', icon: 'fas fa-angry', emoji: '😠' },
            { name: 'Calm', icon: 'fas fa-peace', emoji: '😌' },
            { name: 'Energetic', icon: 'fas fa-bolt', emoji: '⚡' },
            { name: 'Stressed', icon: 'fas fa-head-side-cough', emoji: '😵' }
        ];
        
        this.articles = [
            { title: 'Understanding Your Menstrual Cycle', category: 'basics', content: 'Learn about the four phases of your menstrual cycle and what happens in your body during each phase.' },
            { title: 'PMS vs PMDD: Key Differences', category: 'health', content: 'Understand the differences between PMS and PMDD, including symptoms and treatment options.' },
            { title: 'Nutrition During Your Cycle', category: 'lifestyle', content: 'Discover how to adjust your diet during different phases of your cycle for optimal health.' },
            { title: 'Exercise and Menstruation', category: 'lifestyle', content: 'Learn about the best types of exercise during your period and throughout your cycle.' },
            { title: 'When to See a Doctor', category: 'health', content: 'Important signs and symptoms that warrant a visit to your healthcare provider.' },
            { title: 'Birth Control Options', category: 'contraception', content: 'Comprehensive guide to different contraceptive methods and their effects on your cycle.' },
            { title: 'Fertility and Conception', category: 'pregnancy', content: 'Understanding fertility windows and tips for conception or avoiding pregnancy.' },
            { title: 'Irregular Cycles: Causes and Solutions', category: 'health', content: 'Common causes of irregular periods and when to seek medical advice.' }
        ];
        
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.generateCalendar();
        this.generateSymptomsGrid();
        this.generateMoodGrid();
        this.generateArticles();
        this.updateDashboard();
        this.updateInsights();
        this.loadSettings();
    }
    
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all nav buttons and tab contents
                navButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(tab => tab.classList.remove('active'));
                
                // Add active class to clicked button and corresponding tab
                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
                
                // Update chart if insights tab is opened
                if (targetTab === 'insights') {
                    this.updateChart();
                }
            });
        });
    }
    
    setupEventListeners() {
        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.generateCalendar();
        });
        
        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.generateCalendar();
        });
        
        // Period logging
        document.getElementById('savePeriodBtn').addEventListener('click', () => this.savePeriod());
        document.getElementById('logPeriodBtn').addEventListener('click', () => this.showTab('log'));
        document.getElementById('logSymptomsBtn').addEventListener('click', () => this.showTab('log'));
        document.getElementById('logMoodBtn').addEventListener('click', () => this.showTab('log'));
        
        // Flow button selection
        document.querySelectorAll('.flow-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectFlow(btn));
        });
        
        // Symptom and mood saving
        document.getElementById('saveSymptomsBtn').addEventListener('click', () => this.saveSymptoms());
        document.getElementById('saveMoodBtn').addEventListener('click', () => this.saveMood());
        
        // Settings
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('clearDataBtn').addEventListener('click', () => this.clearData());
        
        // Modal events
        document.getElementById('closePeriodModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelPeriodModal').addEventListener('click', () => this.closeModal());
        document.getElementById('savePeriodModal').addEventListener('click', () => this.savePeriodFromModal());
        
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => this.searchArticles(e.target.value));
        
        // Settings changes
        document.getElementById('userAge').addEventListener('change', () => this.saveSettings());
        document.getElementById('typicalCycleLength').addEventListener('change', () => this.saveSettings());
        document.querySelectorAll('.setting-toggle').forEach(toggle => {
            toggle.addEventListener('change', () => this.saveSettings());
        });
    }
    
    showTab(tabName) {
        const navBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (navBtn) {
            navBtn.click();
        }
    }
    
    generateCalendar() {
        const calendar = document.getElementById('calendarGrid');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        document.getElementById('currentMonth').textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        calendar.innerHTML = '';
        
        // Add day headers
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendar.appendChild(dayHeader);
        });
        
        // Generate calendar days
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = currentDate.getDate();
            
            // Add classes based on date status
            if (currentDate.getMonth() !== this.currentMonth) {
                dayElement.classList.add('other-month');
            }
            
            if (this.isToday(currentDate)) {
                dayElement.classList.add('today');
            }
            
            // Add cycle phase classes
            const cycleDay = this.getCycleDay(currentDate);
            if (cycleDay > 0) {
                if (this.isPeriodDay(currentDate)) {
                    dayElement.classList.add('period');
                } else if (this.isFertileDay(currentDate)) {
                    dayElement.classList.add('fertile');
                } else if (this.isPMSDay(currentDate)) {
                    dayElement.classList.add('pms');
                } else if (this.isPredictedPeriod(currentDate)) {
                    dayElement.classList.add('predicted');
                }
            }
            
            dayElement.addEventListener('click', () => this.openPeriodModal(currentDate));
            calendar.appendChild(dayElement);
        }
    }
    
    openPeriodModal(date) {
        const modal = document.getElementById('periodModal');
        const selectedDateSpan = document.getElementById('selectedDate');
        selectedDateSpan.textContent = date.toLocaleDateString();
        modal.classList.remove('hidden');
        modal.selectedDate = date;
    }
    
    closeModal() {
        document.getElementById('periodModal').classList.add('hidden');
    }
    
    savePeriodFromModal() {
        const modal = document.getElementById('periodModal');
        const flowIntensity = document.getElementById('modalFlowIntensity').value;
        const date = modal.selectedDate;
        
        if (flowIntensity) {
            this.addPeriodDay(date, flowIntensity);
            this.generateCalendar();
            this.updateDashboard();
            this.closeModal();
            this.showNotification('Period data saved successfully!');
        }
    }
    
    generateSymptomsGrid() {
        const grid = document.getElementById('symptomsGrid');
        grid.innerHTML = '';
        
        this.symptoms.forEach(symptom => {
            const button = document.createElement('button');
            button.className = 'symptom-btn';
            button.innerHTML = `<i class="${symptom.icon}"></i><span>${symptom.name}</span>`;
            button.addEventListener('click', () => this.toggleSymptom(button, symptom.name));
            grid.appendChild(button);
        });
    }
    
    generateMoodGrid() {
        const grid = document.getElementById('moodGrid');
        grid.innerHTML = '';
        
        this.moods.forEach(mood => {
            const button = document.createElement('button');
            button.className = 'mood-btn';
            button.innerHTML = `<span style="font-size: 1.5rem;">${mood.emoji}</span><span>${mood.name}</span>`;
            button.addEventListener('click', () => this.toggleMood(button, mood.name));
            grid.appendChild(button);
        });
    }
    
    generateArticles() {
        const container = document.getElementById('articlesContainer');
        container.innerHTML = '';
        
        this.articles.forEach(article => {
            const articleCard = document.createElement('div');
            articleCard.className = 'article-card';
            articleCard.innerHTML = `
                <div class="article-title">${article.title}</div>
                <div class="article-category">${article.category}</div>
                <div style="margin-top: 12px; color: var(--color-text-secondary); font-size: var(--font-size-sm);">
                    ${article.content}
                </div>
            `;
            container.appendChild(articleCard);
        });
    }
    
    selectFlow(button) {
        document.querySelectorAll('.flow-btn').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        this.selectedFlow = button.getAttribute('data-flow');
    }
    
    toggleSymptom(button, symptomName) {
        if (this.selectedSymptoms.has(symptomName)) {
            this.selectedSymptoms.delete(symptomName);
            button.classList.remove('selected');
        } else {
            this.selectedSymptoms.add(symptomName);
            button.classList.add('selected');
        }
    }
    
    toggleMood(button, moodName) {
        // Allow only one mood selection
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        this.selectedMoods.clear();
        
        this.selectedMoods.add(moodName);
        button.classList.add('selected');
    }
    
    savePeriod() {
        const startDate = document.getElementById('periodStartDate').value;
        const endDate = document.getElementById('periodEndDate').value;
        
        if (!startDate) {
            this.showNotification('Please select a start date', 'error');
            return;
        }
        
        if (!this.selectedFlow) {
            this.showNotification('Please select flow intensity', 'error');
            return;
        }
        
        const period = {
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            flow: this.selectedFlow,
            id: Date.now()
        };
        
        this.userData.periods.push(period);
        this.saveUserData();
        this.updateDashboard();
        this.generateCalendar();
        this.showNotification('Period saved successfully!');
        
        // Reset form
        document.getElementById('periodStartDate').value = '';
        document.getElementById('periodEndDate').value = '';
        this.selectedFlow = null;
        document.querySelectorAll('.flow-btn').forEach(btn => btn.classList.remove('selected'));
    }
    
    saveSymptoms() {
        if (this.selectedSymptoms.size === 0) {
            this.showNotification('Please select at least one symptom', 'error');
            return;
        }
        
        const today = new Date().toDateString();
        this.userData.symptoms[today] = Array.from(this.selectedSymptoms);
        this.saveUserData();
        this.showNotification('Symptoms saved successfully!');
        
        // Reset selection
        this.selectedSymptoms.clear();
        document.querySelectorAll('.symptom-btn').forEach(btn => btn.classList.remove('selected'));
    }
    
    saveMood() {
        if (this.selectedMoods.size === 0) {
            this.showNotification('Please select a mood', 'error');
            return;
        }
        
        const today = new Date().toDateString();
        this.userData.moods[today] = Array.from(this.selectedMoods)[0];
        this.saveUserData();
        this.showNotification('Mood saved successfully!');
        
        // Reset selection
        this.selectedMoods.clear();
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
    }
    
    updateDashboard() {
        const cycleDay = this.getCurrentCycleDay();
        const nextPeriodDays = this.getDaysUntilNextPeriod();
        const avgCycleLength = this.getAverageCycleLength();
        
        document.getElementById('cycleDay').textContent = cycleDay || '?';
        document.getElementById('nextPeriodDays').textContent = nextPeriodDays || '?';
        document.getElementById('cycleLength').textContent = avgCycleLength || 28;
        
        // Update insight
        const insight = this.getTodayInsight();
        document.getElementById('todayInsight').textContent = insight;
    }
    
    updateInsights() {
        const avgCycleLength = this.getAverageCycleLength();
        const regularity = this.getCycleRegularity();
        const commonSymptom = this.getMostCommonSymptom();
        
        document.getElementById('avgCycleLength').textContent = `${avgCycleLength || 28} days`;
        
        const regularityElement = document.getElementById('cycleRegularity');
        regularityElement.textContent = regularity;
        regularityElement.className = `health-value status ${regularity === 'Regular' ? 'status--success' : 'status--warning'}`;
        
        document.getElementById('commonSymptom').textContent = commonSymptom || 'None tracked';
        
        // Update predictions
        this.updatePredictions();
    }
    
    updatePredictions() {
        const predictionList = document.getElementById('predictionList');
        predictionList.innerHTML = '';
        
        const nextPeriod = this.getNextPeriodPrediction();
        const nextOvulation = this.getNextOvulationPrediction();
        
        if (nextPeriod) {
            const periodItem = document.createElement('div');
            periodItem.className = 'prediction-item';
            periodItem.innerHTML = `
                <div>
                    <div class="prediction-type">Next Period</div>
                    <div class="prediction-date">${nextPeriod.date.toLocaleDateString()}</div>
                </div>
                <div class="status status--info">${nextPeriod.confidence}% confidence</div>
            `;
            predictionList.appendChild(periodItem);
        }
        
        if (nextOvulation) {
            const ovulationItem = document.createElement('div');
            ovulationItem.className = 'prediction-item';
            ovulationItem.innerHTML = `
                <div>
                    <div class="prediction-type">Next Ovulation</div>
                    <div class="prediction-date">${nextOvulation.date.toLocaleDateString()}</div>
                </div>
                <div class="status status--success">${nextOvulation.confidence}% confidence</div>
            `;
            predictionList.appendChild(ovulationItem);
        }
    }
    
    updateChart() {
        const canvas = document.getElementById('cycleTrendChart');
        const ctx = canvas.getContext('2d');
        
        // Clear any existing chart
        if (window.cycleChart) {
            window.cycleChart.destroy();
        }
        
        const cycleLengths = this.getCycleLengthHistory();
        const labels = cycleLengths.map((_, index) => `Cycle ${index + 1}`);
        
        window.cycleChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cycle Length (days)',
                    data: cycleLengths,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 20,
                        max: 35
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    searchArticles(query) {
        const container = document.getElementById('articlesContainer');
        const filteredArticles = this.articles.filter(article => 
            article.title.toLowerCase().includes(query.toLowerCase()) ||
            article.category.toLowerCase().includes(query.toLowerCase()) ||
            article.content.toLowerCase().includes(query.toLowerCase())
        );
        
        container.innerHTML = '';
        filteredArticles.forEach(article => {
            const articleCard = document.createElement('div');
            articleCard.className = 'article-card';
            articleCard.innerHTML = `
                <div class="article-title">${article.title}</div>
                <div class="article-category">${article.category}</div>
                <div style="margin-top: 12px; color: var(--color-text-secondary); font-size: var(--font-size-sm);">
                    ${article.content}
                </div>
            `;
            container.appendChild(articleCard);
        });
    }
    
    loadSettings() {
        const settings = this.userData.settings;
        document.getElementById('userAge').value = settings.age || '';
        document.getElementById('typicalCycleLength').value = settings.cycleLength || 28;
        document.getElementById('periodReminders').checked = settings.periodReminders !== false;
        document.getElementById('ovulationAlerts').checked = settings.ovulationAlerts !== false;
        document.getElementById('symptomPrompts').checked = settings.symptomPrompts !== false;
    }
    
    saveSettings() {
        this.userData.settings = {
            age: parseInt(document.getElementById('userAge').value) || null,
            cycleLength: parseInt(document.getElementById('typicalCycleLength').value) || 28,
            periodReminders: document.getElementById('periodReminders').checked,
            ovulationAlerts: document.getElementById('ovulationAlerts').checked,
            symptomPrompts: document.getElementById('symptomPrompts').checked
        };
        this.saveUserData();
        this.showNotification('Settings saved successfully!');
    }
    
    exportData() {
        const dataStr = JSON.stringify(this.userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'luna-cycle-data.json';
        link.click();
        URL.revokeObjectURL(url);
        this.showNotification('Data exported successfully!');
    }
    
    clearData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            this.userData = this.getDefaultUserData();
            this.saveUserData();
            this.updateDashboard();
            this.updateInsights();
            this.generateCalendar();
            this.loadSettings();
            this.showNotification('All data cleared successfully!');
        }
    }
    
    // Utility functions
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }
    
    isPeriodDay(date) {
        return this.userData.periods.some(period => {
            const start = new Date(period.startDate);
            const end = period.endDate ? new Date(period.endDate) : new Date(start.getTime() + 4 * 24 * 60 * 60 * 1000);
            return date >= start && date <= end;
        });
    }
    
    isFertileDay(date) {
        const cycleDay = this.getCycleDay(date);
        return cycleDay >= 10 && cycleDay <= 16;
    }
    
    isPMSDay(date) {
        const cycleDay = this.getCycleDay(date);
        const cycleLength = this.userData.settings.cycleLength || 28;
        return cycleDay > cycleLength - 7 && cycleDay < cycleLength;
    }
    
    isPredictedPeriod(date) {
        const nextPeriod = this.getNextPeriodPrediction();
        if (!nextPeriod) return false;
        
        const timeDiff = Math.abs(date.getTime() - nextPeriod.date.getTime());
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return dayDiff <= 2;
    }
    
    getCycleDay(date) {
        const lastPeriod = this.getLastPeriodStart();
        if (!lastPeriod) return 0;
        
        const timeDiff = date.getTime() - lastPeriod.getTime();
        const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
        return dayDiff > 0 ? dayDiff : 0;
    }
    
    getCurrentCycleDay() {
        return this.getCycleDay(new Date());
    }
    
    getLastPeriodStart() {
        if (this.userData.periods.length === 0) return null;
        const sortedPeriods = this.userData.periods.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        return new Date(sortedPeriods[0].startDate);
    }
    
    getDaysUntilNextPeriod() {
        const prediction = this.getNextPeriodPrediction();
        if (!prediction) return null;
        
        const today = new Date();
        const timeDiff = prediction.date.getTime() - today.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return dayDiff > 0 ? dayDiff : 0;
    }
    
    getAverageCycleLength() {
        if (this.userData.periods.length < 2) return this.userData.settings.cycleLength || 28;
        
        const sortedPeriods = this.userData.periods.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        const cycleLengths = [];
        
        for (let i = 1; i < sortedPeriods.length; i++) {
            const prev = new Date(sortedPeriods[i - 1].startDate);
            const curr = new Date(sortedPeriods[i].startDate);
            const length = Math.floor((curr - prev) / (1000 * 3600 * 24));
            cycleLengths.push(length);
        }
        
        return Math.round(cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length);
    }
    
    getCycleRegularity() {
        const cycleLengths = this.getCycleLengthHistory();
        if (cycleLengths.length < 3) return 'Insufficient data';
        
        const avg = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
        const variance = cycleLengths.reduce((sum, length) => sum + Math.pow(length - avg, 2), 0) / cycleLengths.length;
        const stdDev = Math.sqrt(variance);
        
        return stdDev <= 2 ? 'Regular' : stdDev <= 4 ? 'Slightly irregular' : 'Irregular';
    }
    
    getMostCommonSymptom() {
        const symptomCounts = {};
        Object.values(this.userData.symptoms).forEach(symptoms => {
            symptoms.forEach(symptom => {
                symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
            });
        });
        
        const mostCommon = Object.keys(symptomCounts).reduce((a, b) => 
            symptomCounts[a] > symptomCounts[b] ? a : b, null);
        return mostCommon;
    }
    
    getCycleLengthHistory() {
        if (this.userData.periods.length < 2) return [28];
        
        const sortedPeriods = this.userData.periods.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        const cycleLengths = [];
        
        for (let i = 1; i < sortedPeriods.length; i++) {
            const prev = new Date(sortedPeriods[i - 1].startDate);
            const curr = new Date(sortedPeriods[i].startDate);
            const length = Math.floor((curr - prev) / (1000 * 3600 * 24));
            cycleLengths.push(length);
        }
        
        return cycleLengths.length > 0 ? cycleLengths : [28];
    }
    
    getNextPeriodPrediction() {
        const lastPeriod = this.getLastPeriodStart();
        if (!lastPeriod) return null;
        
        const avgCycleLength = this.getAverageCycleLength();
        const nextPeriodDate = new Date(lastPeriod.getTime() + avgCycleLength * 24 * 60 * 60 * 1000);
        
        const cycleLengths = this.getCycleLengthHistory();
        const confidence = cycleLengths.length >= 3 ? 85 : 60;
        
        return {
            date: nextPeriodDate,
            confidence: confidence
        };
    }
    
    getNextOvulationPrediction() {
        const lastPeriod = this.getLastPeriodStart();
        if (!lastPeriod) return null;
        
        const avgCycleLength = this.getAverageCycleLength();
        const ovulationDay = avgCycleLength - 14;
        const ovulationDate = new Date(lastPeriod.getTime() + ovulationDay * 24 * 60 * 60 * 1000);
        
        return {
            date: ovulationDate,
            confidence: 75
        };
    }
    
    getTodayInsight() {
        const cycleDay = this.getCurrentCycleDay();
        const avgCycleLength = this.getAverageCycleLength();
        
        if (cycleDay <= 5) {
            return "You're in your menstrual phase. Rest well and stay hydrated.";
        } else if (cycleDay >= 10 && cycleDay <= 16) {
            return "You're in your fertile window. This is the best time for conception.";
        } else if (cycleDay > avgCycleLength - 7) {
            return "You might experience PMS symptoms soon. Consider tracking your mood and symptoms.";
        } else {
            return "Your body is in the follicular phase. Great time for exercise and new activities!";
        }
    }
    
    addPeriodDay(date, flowIntensity) {
        // Check if this date is already part of an existing period
        const existingPeriod = this.userData.periods.find(period => {
            const start = new Date(period.startDate);
            const end = period.endDate ? new Date(period.endDate) : new Date(start.getTime() + 4 * 24 * 60 * 60 * 1000);
            return date >= start && date <= end;
        });
        
        if (!existingPeriod) {
            // Create new period entry
            const newPeriod = {
                startDate: date,
                endDate: null,
                flow: flowIntensity,
                id: Date.now()
            };
            this.userData.periods.push(newPeriod);
            this.saveUserData();
        }
    }
    
    showNotification(message, type = 'success') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background-color: ${type === 'error' ? 'var(--color-error)' : 'var(--color-success)'};
            color: white;
            border-radius: var(--radius-base);
            z-index: 1001;
            box-shadow: var(--shadow-lg);
            font-size: var(--font-size-sm);
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    loadUserData() {
        const stored = localStorage.getItem('lunaTrackerData');
        return stored ? JSON.parse(stored) : this.getDefaultUserData();
    }
    
    saveUserData() {
        localStorage.setItem('lunaTrackerData', JSON.stringify(this.userData));
    }
    
    getDefaultUserData() {
        return {
            periods: [],
            symptoms: {},
            moods: {},
            settings: {
                age: null,
                cycleLength: 28,
                periodReminders: true,
                ovulationAlerts: true,
                symptomPrompts: false
            }
        };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.periodApp = new PeriodTrackingApp();
});