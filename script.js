class FinancialPlannerBot {
    constructor() {
        this.currentFlow = 'start';
        this.userData = {};
        this.chatMessages = document.getElementById('chatMessages');
        this.inputContainer = document.getElementById('inputContainer');
        this.progressFill = document.getElementById('progressFill');
        
        this.flows = {
            start: {
                messages: [
                    { type: 'text', text: '👋 Hi there! I\'m your AI Financial Planner. Ready to build a plan for your business goal?' }
                ],
                actions: [
                    { type: 'button', label: 'Yes, let\'s do it', target: 'ask_goal' }
                ],
                progress: 10
            },
            ask_goal: {
                messages: [
                    { type: 'text', text: 'Awesome! What is your business goal? (e.g., open a new branch, hire 2 staff, buy equipment)' }
                ],
                actions: [
                    { type: 'input', key: 'user_goal', target: 'ask_timeline', placeholder: 'Describe your business goal...' }
                ],
                progress: 25
            },
            ask_timeline: {
                messages: [
                    { type: 'text', text: 'In how many months would you like to achieve this goal?' }
                ],
                actions: [
                    { type: 'input', key: 'user_timeline', target: 'ask_cashflow', placeholder: 'Enter number of months', inputType: 'number' }
                ],
                progress: 40
            },
            ask_cashflow: {
                messages: [
                    { type: 'text', text: 'What is your average monthly revenue? (This helps estimate your cash flow)' }
                ],
                actions: [
                    { type: 'input', key: 'user_cashflow', target: 'ask_expenses', placeholder: 'Enter monthly revenue (₹)', inputType: 'number' }
                ],
                progress: 55
            },
            ask_expenses: {
                messages: [
                    { type: 'text', text: 'What are your average monthly business expenses?' }
                ],
                actions: [
                    { type: 'input', key: 'user_expenses', target: 'ask_savings', placeholder: 'Enter monthly expenses (₹)', inputType: 'number' }
                ],
                progress: 70
            },
            ask_savings: {
                messages: [
                    { type: 'text', text: 'What is your current business savings amount?' }
                ],
                actions: [
                    { type: 'input', key: 'user_savings', target: 'ask_funding', placeholder: 'Enter current savings (₹)', inputType: 'number' }
                ],
                progress: 85
            },
            ask_funding: {
                messages: [
                    { type: 'text', text: 'How would you prefer to fund this goal?' }
                ],
                actions: [
                    { type: 'button', label: 'Self-funded', target: 'ai_planner', value: 'self-funded' },
                    { type: 'button', label: 'Business Loan', target: 'ai_planner', value: 'loan' },
                    { type: 'button', label: 'External Funding', target: 'ai_planner', value: 'external' }
                ],
                progress: 95
            },
            ai_planner: {
                messages: [
                    { type: 'text', text: '🤖 Analyzing your data and creating a personalized financial plan...' }
                ],
                actions: [],
                progress: 100
            },
            plan_result: {
                messages: [],
                actions: [
                    { type: 'button', label: 'Set Monthly Reminders', target: 'reminder' },
                    { type: 'button', label: 'Explore Loan Options', target: 'loan_suggestion' },
                    { type: 'button', label: 'Start Over', target: 'start' }
                ],
                progress: 100
            },
            reminder: {
                messages: [
                    { type: 'text', text: '✅ Reminder set! I\'ll nudge you every month to review your goal savings progress.' }
                ],
                actions: [
                    { type: 'button', label: 'Start New Plan', target: 'start' }
                ],
                progress: 100
            },
            loan_suggestion: {
                messages: [
                    { type: 'text', text: '💡 Based on your plan, a small business loan might help accelerate your goal. Want me to show funding options?' }
                ],
                actions: [
                    { type: 'button', label: 'Yes, show me options', target: 'end' },
                    { type: 'button', label: 'No thanks', target: 'end' }
                ],
                progress: 100
            },
            end: {
                messages: [
                    { type: 'text', text: 'Thanks for using the Goal-Based Planner! Come back anytime to update or review your plan 🚀' }
                ],
                actions: [
                    { type: 'button', label: 'Start New Plan', target: 'start' }
                ],
                progress: 100
            }
        };
        
        this.init();
    }
    
    init() {
        this.showFlow(this.currentFlow);
    }
    
    showFlow(flowId) {
        const flow = this.flows[flowId];
        if (!flow) return;
        
        this.currentFlow = flowId;
        this.updateProgress(flow.progress);
        
        // Show messages
        flow.messages.forEach(message => {
            this.addMessage(message.text, 'bot');
        });
        
        // Handle special AI planner flow
        if (flowId === 'ai_planner') {
            this.generateFinancialPlan();
            return;
        }
        
        // Show actions
        this.showActions(flow.actions);
    }
    
    showActions(actions) {
        this.inputContainer.innerHTML = '';
        
        if (actions.length === 0) return;
        
        const container = document.createElement('div');
        
        actions.forEach(action => {
            if (action.type === 'button') {
                const button = document.createElement('button');
                button.className = 'btn btn-secondary';
                button.textContent = action.label;
                button.onclick = () => {
                    if (action.value) {
                        this.userData[action.key || 'user_funding'] = action.value;
                    }
                    this.addMessage(action.label, 'user');
                    this.showFlow(action.target);
                };
                container.appendChild(button);
            } else if (action.type === 'input') {
                const inputGroup = document.createElement('div');
                inputGroup.className = 'input-group';
                
                const input = document.createElement('input');
                input.type = action.inputType || 'text';
                input.placeholder = action.placeholder || 'Enter your response...';
                input.id = action.key;
                
                const button = document.createElement('button');
                button.className = 'btn btn-primary';
                button.textContent = 'Next';
                button.onclick = () => this.handleInput(action);
                
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.handleInput(action);
                    }
                });
                
                inputGroup.appendChild(input);
                inputGroup.appendChild(button);
                container.appendChild(inputGroup);
                
                // Focus on input
                setTimeout(() => input.focus(), 100);
            }
        });
        
        this.inputContainer.appendChild(container);
    }
    
    handleInput(action) {
        const input = document.getElementById(action.key);
        const value = input.value.trim();
        
        if (!value) {
            input.style.borderColor = '#ff6b6b';
            return;
        }
        
        this.userData[action.key] = value;
        this.addMessage(value, 'user');
        this.showFlow(action.target);
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    addAIMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-response';
        messageDiv.textContent = text;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    updateProgress(percentage) {
        this.progressFill.style.width = percentage + '%';
    }
    
    async generateFinancialPlan() {
        // Show loading
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot loading';
        loadingDiv.textContent = 'Generating your financial plan';
        this.chatMessages.appendChild(loadingDiv);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Remove loading message
        loadingDiv.remove();
        
        // Generate plan using the financial advisor logic
        const plan = this.createFinancialPlan();
        
        this.addAIMessage(plan);
        this.showFlow('plan_result');
    }
    
    createFinancialPlan() {
        const goal = this.userData.user_goal || 'Business expansion';
        const timeline = parseInt(this.userData.user_timeline) || 12;
        
        // Parse cash flow data (could be comma-separated values)
        const cashflowInput = this.userData.user_cashflow || '50000';
        const cashflowValues = cashflowInput.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
        const avgRevenue = cashflowValues.length > 0 ? 
            cashflowValues.reduce((a, b) => a + b, 0) / cashflowValues.length : 50000;
        
        const expenses = parseFloat(this.userData.user_expenses) || avgRevenue * 0.8;
        const savings = parseFloat(this.userData.user_savings) || 10000;
        const funding = this.userData.user_funding || 'self-funded';
        
        const netCashFlow = avgRevenue - expenses;
        const monthlySavingsCapacity = netCashFlow * 0.7; // 70% of net cash flow
        
        // Estimate CAPEX based on goal type
        let estimatedCapex = 100000; // Default
        const goalLower = goal.toLowerCase();
        
        if (goalLower.includes('hire') || goalLower.includes('staff')) {
            const staffCount = this.extractNumber(goal) || 2;
            estimatedCapex = staffCount * 65000; // Annual cost per employee
        } else if (goalLower.includes('expand') || goalLower.includes('branch') || goalLower.includes('location')) {
            estimatedCapex = 150000; // New location cost
        } else if (goalLower.includes('equipment') || goalLower.includes('machinery')) {
            estimatedCapex = 80000; // Equipment cost
        } else if (goalLower.includes('inventory') || goalLower.includes('stock')) {
            estimatedCapex = 50000; // Inventory cost
        }
        
        const totalNeeded = Math.max(0, estimatedCapex - savings);
        const monthsToSave = monthlySavingsCapacity > 0 ? totalNeeded / monthlySavingsCapacity : Infinity;
        const isFeasible = monthsToSave <= timeline;
        
        return `🎯 FINANCIAL PLAN FOR YOUR GOAL

📋 GOAL: ${goal}
⏰ Timeline: ${timeline} months
💰 Estimated Budget: ₹${estimatedCapex.toLocaleString()}
🏦 Current Savings: ₹${savings.toLocaleString()}
📊 Additional Needed: ₹${totalNeeded.toLocaleString()}

💵 FINANCIAL CAPACITY
Monthly Average Revenue: ₹${avgRevenue.toLocaleString()}
Monthly Expenses: ₹${expenses.toLocaleString()}
Monthly Net Cash Flow: ₹${netCashFlow.toLocaleString()}
Monthly Savings Target: ₹${monthlySavingsCapacity.toLocaleString()}
Time to Save: ${monthsToSave === Infinity ? 'Insufficient cash flow' : Math.ceil(monthsToSave) + ' months'}

${isFeasible ? '✅ ACHIEVABLE' : '⚠️ CHALLENGING'}
Confidence Level: ${isFeasible ? 'High' : 'Medium'}

${cashflowValues.length > 1 ? `📈 CASH FLOW ANALYSIS
Projected Revenue: ${cashflowValues.map((v, i) => `Month ${i+1}: ₹${v.toLocaleString()}`).join(', ')}
Average Monthly Revenue: ₹${avgRevenue.toLocaleString()}

` : ''}📅 MONTHLY PLAN
📅 MONTHLY PLAN
${this.generateMonthlyPlan(timeline, monthlySavingsCapacity, savings, estimatedCapex)}

💡 RECOMMENDATIONS:
${isFeasible ? 
  '• Set up automatic transfers to savings\n• Review expenses monthly\n• Consider accelerating if cash flow improves' :
  '• Consider extending timeline by 3-6 months\n• Explore business loan options\n• Focus on increasing revenue first'
}

${funding === 'loan' ? '🏦 LOAN CONSIDERATIONS:\n• Prepare 2-3 years of financial statements\n• Consider business loan of ₹' + Math.ceil(totalNeeded/10000)*10000 + '\n• Compare interest rates from multiple lenders\n\n' : ''}${funding === 'external' ? '👥 EXTERNAL FUNDING:\n• Develop comprehensive business plan\n• Prepare investor pitch deck\n• Consider equity vs debt financing\n\n' : ''}🎯 NEXT STEPS:
🎯 NEXT STEPS:
1. Open dedicated savings account
2. Set up monthly transfers
3. Track progress monthly
4. Review and adjust quarterly`;
    }
    
    generateMonthlyPlan(timeline, monthlySavings, currentSavings, targetAmount) {
        let plan = '';
        let cumulative = currentSavings;
        
        for (let month = 1; month <= Math.min(timeline, 6); month++) {
            cumulative += monthlySavings;
            const progress = (cumulative / targetAmount) * 100;
            
            plan += `Month ${month}: Save ₹${monthlySavings.toLocaleString()} (Total: ₹${cumulative.toLocaleString()}) - ${Math.min(100, progress).toFixed(0)}%\n`;
        }
        
        if (timeline > 6) {
            plan += `... (showing first 6 months of ${timeline} month plan)`;
        }
        
        return plan;
    }
    
    extractNumber(text) {
        const match = text.match(/\d+/);
        return match ? parseInt(match[0]) : null;
    }
}

// Initialize the bot when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FinancialPlannerBot();
});