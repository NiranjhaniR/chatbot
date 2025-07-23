class FinancialPlannerBot {
    constructor() {
        this.currentFlow = 'start';
        this.userData = {};
        this.chatMessages = document.getElementById('chatMessages');
        this.inputContainer = document.getElementById('inputContainer');
        this.progressFill = document.getElementById('progressFill');
        
        // Hugging Face API configuration (free tier)
        this.aiConfig = {
            baseUrl: 'https://api-inference.huggingface.co/models/',
            models: {
                // Free open-source models
                primary: 'microsoft/DialoGPT-large',
                financial: 'facebook/blenderbot-400M-distill',
                fallback: 'gpt2'
            }
        };
        
        this.flows = {
            start: {
                messages: [
                    { type: 'text', text: '👋 Hi there! I\'m your AI Financial Planner powered by open-source AI. Ready to build a personalized plan for your business goal?' }
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
                    { type: 'text', text: '🤖 Connecting to AI Financial Advisor... Analyzing your data and creating a personalized plan...' }
                ],
                actions: [],
                progress: 100
            },
            plan_result: {
                messages: [],
                actions: [
                    { type: 'button', label: 'Get AI Recommendations', target: 'ai_recommendations' },
                    { type: 'button', label: 'Ask AI Questions', target: 'ai_chat' },
                    { type: 'button', label: 'Start Over', target: 'start' }
                ],
                progress: 100
            },
            ai_recommendations: {
                messages: [
                    { type: 'text', text: '🤖 Getting personalized AI recommendations...' }
                ],
                actions: [],
                progress: 100
            },
            ai_chat: {
                messages: [
                    { type: 'text', text: '💬 Ask me anything about your financial plan! I\'m powered by AI and can help with specific questions.' }
                ],
                actions: [
                    { type: 'input', key: 'ai_question', target: 'ai_response', placeholder: 'Ask your financial question...' }
                ],
                progress: 100
            },
            ai_response: {
                messages: [],
                actions: [
                    { type: 'button', label: 'Ask Another Question', target: 'ai_chat' },
                    { type: 'button', label: 'Back to Plan', target: 'plan_result' }
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
        
        // Handle special AI flows
        if (flowId === 'ai_planner') {
            this.generateAIFinancialPlan();
            return;
        } else if (flowId === 'ai_recommendations') {
            this.getAIRecommendations();
            return;
        } else if (flowId === 'ai_response') {
            this.getAIResponse();
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
        messageDiv.innerHTML = text.replace(/\n/g, '<br>');
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    updateProgress(percentage) {
        this.progressFill.style.width = percentage + '%';
    }
    
    // AI Integration Methods
    async callHuggingFaceAPI(prompt, model = 'microsoft/DialoGPT-large') {
        try {
            const response = await fetch(`${this.aiConfig.baseUrl}${model}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_length: 500,
                        temperature: 0.7,
                        do_sample: true,
                        top_p: 0.9
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Handle different response formats
            if (Array.isArray(data) && data[0]?.generated_text) {
                return data[0].generated_text.replace(prompt, '').trim();
            } else if (data.generated_text) {
                return data.generated_text.replace(prompt, '').trim();
            } else if (typeof data === 'string') {
                return data;
            }
            
            return 'I apologize, but I received an unexpected response format. Let me try a different approach.';
            
        } catch (error) {
            console.error('AI API Error:', error);
            return this.getFallbackResponse(prompt);
        }
    }
    
    getFallbackResponse(prompt) {
        // Fallback responses when AI service is unavailable
        if (prompt.includes('financial plan') || prompt.includes('business goal')) {
            return `Based on your business goal and financial data, I recommend creating a structured savings plan. Focus on optimizing your cash flow and consider the timeline you've set. Would you like me to break down specific steps?`;
        } else if (prompt.includes('recommendation')) {
            return `Here are some general recommendations: 1) Set up automatic savings transfers, 2) Review your expenses monthly, 3) Consider multiple funding options, 4) Track your progress regularly. What specific area would you like me to focus on?`;
        } else {
            return `I understand your question about financial planning. While I'm having connectivity issues with the AI service, I can still help you with basic financial planning principles. Could you rephrase your question?`;
        }
    }
    
    async generateAIFinancialPlan() {
        // Show loading
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot loading';
        loadingDiv.textContent = 'AI is analyzing your financial data...';
        this.chatMessages.appendChild(loadingDiv);
        
        // Prepare prompt for AI
        const prompt = this.createFinancialPlanPrompt();
        
        try {
            // Call AI service
            const aiResponse = await this.callHuggingFaceAPI(prompt, 'facebook/blenderbot-400M-distill');
            
            // Remove loading message
            loadingDiv.remove();
            
            // Combine AI response with structured plan
            const structuredPlan = this.createStructuredPlan();
            const combinedResponse = `🤖 **AI Financial Analysis:**\n\n${aiResponse}\n\n${structuredPlan}`;
            
            this.addAIMessage(combinedResponse);
            
        } catch (error) {
            loadingDiv.remove();
            const fallbackPlan = this.createStructuredPlan();
            this.addAIMessage(`🤖 **AI Financial Plan:**\n\n${fallbackPlan}`);
        }
        
        this.showFlow('plan_result');
    }
    
    async getAIRecommendations() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot loading';
        loadingDiv.textContent = 'AI is generating personalized recommendations...';
        this.chatMessages.appendChild(loadingDiv);
        
        const prompt = `Financial Advisory Request:
Business Goal: ${this.userData.user_goal || 'Business expansion'}
Timeline: ${this.userData.user_timeline || 12} months
Monthly Revenue: ₹${this.userData.user_cashflow || 50000}
Monthly Expenses: ₹${this.userData.user_expenses || 40000}
Current Savings: ₹${this.userData.user_savings || 10000}
Funding Preference: ${this.userData.user_funding || 'self-funded'}

Please provide 5 specific, actionable financial recommendations for achieving this business goal within the given timeline and budget constraints.`;
        
        try {
            const aiResponse = await this.callHuggingFaceAPI(prompt, 'facebook/blenderbot-400M-distill');
            loadingDiv.remove();
            
            // Enhanced recommendations with structured format
            const structuredRecommendations = this.createStructuredRecommendations();
            const combinedResponse = `🎯 **AI RECOMMENDATIONS:**\n\n${aiResponse}\n\n${structuredRecommendations}`;
            
            this.addAIMessage(combinedResponse);
        } catch (error) {
            console.error('AI Recommendations Error:', error);
            loadingDiv.remove();
            
            // Provide comprehensive fallback recommendations
            const fallbackRecommendations = this.createStructuredRecommendations();
            this.addAIMessage(`🎯 **SMART RECOMMENDATIONS:**\n\n${fallbackRecommendations}`);
        }
        
        // Update the flow to show proper actions
        setTimeout(() => {
            this.showFlow('plan_result');
        }, 1000);
    }
    
    createStructuredRecommendations() {
        const goal = this.userData.user_goal || 'Business expansion';
        const timeline = parseInt(this.userData.user_timeline) || 12;
        const revenue = parseFloat(this.userData.user_cashflow) || 50000;
        const expenses = parseFloat(this.userData.user_expenses) || 40000;
        const savings = parseFloat(this.userData.user_savings) || 10000;
        const funding = this.userData.user_funding || 'self-funded';
        
        const netCashFlow = revenue - expenses;
        const savingsRate = netCashFlow > 0 ? (netCashFlow / revenue * 100).toFixed(1) : 0;
        
        return `📋 **PERSONALIZED ACTION PLAN:**

💰 **IMMEDIATE ACTIONS (Month 1-2):**
• Set up automatic transfer of ₹${Math.floor(netCashFlow * 0.7).toLocaleString()}/month to goal savings
• Review and cut unnecessary expenses by 10-15%
• Open a separate high-yield savings account for this goal
• Create monthly budget tracking system

📈 **GROWTH STRATEGIES (Month 3-6):**
• Increase revenue by 5-10% through ${this.getRevenueStrategy(goal)}
• Negotiate better rates with suppliers to reduce costs
• Consider pre-orders or advance payments from customers
• Explore government schemes for ${funding === 'loan' ? 'business loans' : 'business grants'}

🎯 **GOAL-SPECIFIC RECOMMENDATIONS:**
${this.getGoalSpecificAdvice(goal, timeline, netCashFlow)}

⚠️ **RISK MANAGEMENT:**
• Maintain emergency fund of ₹${(expenses * 3).toLocaleString()} (3 months expenses)
• Get business insurance before major investments
• Start with pilot/small-scale implementation if possible
• Track ROI metrics from month 1

📊 **MONTHLY TARGETS:**
• Save: ₹${Math.floor(netCashFlow * 0.7).toLocaleString()}/month
• Current Savings Rate: ${savingsRate}% of revenue
• Target: Achieve goal in ${timeline} months
• Review progress every 30 days`;
    }
    
    getRevenueStrategy(goal) {
        const goalLower = goal.toLowerCase();
        if (goalLower.includes('restaurant') || goalLower.includes('food')) {
            return 'menu optimization, delivery partnerships, catering services';
        } else if (goalLower.includes('retail') || goalLower.includes('shop')) {
            return 'online sales, loyalty programs, seasonal promotions';
        } else if (goalLower.includes('service')) {
            return 'premium service packages, referral programs, subscription models';
        } else {
            return 'new customer acquisition, upselling existing clients, digital marketing';
        }
    }
    
    getGoalSpecificAdvice(goal, timeline, cashFlow) {
        const goalLower = goal.toLowerCase();
        
        if (goalLower.includes('hire') || goalLower.includes('staff')) {
            return `• Calculate total hiring cost: salary + benefits + training + equipment
• Start recruitment process 2 months before target date
• Consider part-time or contract workers initially
• Budget for 3-6 months of salary as buffer`;
        } else if (goalLower.includes('expand') || goalLower.includes('location')) {
            return `• Research new location thoroughly (foot traffic, competition, rent)
• Negotiate flexible lease terms (shorter initial period)
• Plan for 6 months of operating expenses for new location
• Consider franchising or partnership models`;
        } else if (goalLower.includes('equipment')) {
            return `• Get quotes from multiple suppliers
• Consider leasing vs buying (cash flow impact)
• Look for end-of-year deals or bulk discounts
• Plan for installation, training, and maintenance costs`;
        } else {
            return `• Break down the goal into smaller, measurable milestones
• Research all associated costs (hidden costs often 20-30% more)
• Create contingency fund of 15-20% of total budget
• Set up progress tracking and review checkpoints`;
        }
    }
    
    async getAIResponse() {
        const question = this.userData.ai_question;
        
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot loading';
        loadingDiv.textContent = 'AI is thinking...';
        this.chatMessages.appendChild(loadingDiv);
        
        const contextPrompt = `Context: User has a business goal: ${this.userData.user_goal}, Timeline: ${this.userData.user_timeline} months, Monthly Revenue: ₹${this.userData.user_cashflow}, Monthly Expenses: ₹${this.userData.user_expenses}. Question: ${question}. Provide helpful financial advice.`;
        
        try {
            const aiResponse = await this.callHuggingFaceAPI(contextPrompt);
            loadingDiv.remove();
            this.addAIMessage(`🤖 **AI Response:**\n\n${aiResponse}`);
        } catch (error) {
            loadingDiv.remove();
            this.addAIMessage(`🤖 **AI Response:**\n\n${this.getFallbackResponse(contextPrompt)}`);
        }
        
        this.showFlow('ai_response');
    }
    
    createFinancialPlanPrompt() {
        return `As an expert financial advisor, analyze this business scenario and provide insights: 
        Business Goal: ${this.userData.user_goal}
        Timeline: ${this.userData.user_timeline} months
        Monthly Revenue: ₹${this.userData.user_cashflow}
        Monthly Expenses: ₹${this.userData.user_expenses}
        Current Savings: ₹${this.userData.user_savings}
        Preferred Funding: ${this.userData.user_funding}
        
        Provide analysis on feasibility, risks, and key recommendations.`;
    }
    
    createStructuredPlan() {
        const goal = this.userData.user_goal || 'Business expansion';
        const timeline = parseInt(this.userData.user_timeline) || 12;
        const revenue = parseFloat(this.userData.user_cashflow) || 50000;
        const expenses = parseFloat(this.userData.user_expenses) || 40000;
        const savings = parseFloat(this.userData.user_savings) || 10000;
        const funding = this.userData.user_funding || 'self-funded';
        
        const netCashFlow = revenue - expenses;
        const monthlySavingsCapacity = netCashFlow * 0.7;
        
        // Estimate CAPEX based on goal type
        let estimatedCapex = 100000;
        const goalLower = goal.toLowerCase();
        
        if (goalLower.includes('hire') || goalLower.includes('staff')) {
            const staffCount = this.extractNumber(goal) || 2;
            estimatedCapex = staffCount * 65000;
        } else if (goalLower.includes('expand') || goalLower.includes('branch')) {
            estimatedCapex = 150000;
        } else if (goalLower.includes('equipment')) {
            estimatedCapex = 80000;
        }
        
        const totalNeeded = Math.max(0, estimatedCapex - savings);
        const monthsToSave = monthlySavingsCapacity > 0 ? totalNeeded / monthlySavingsCapacity : Infinity;
        const isFeasible = monthsToSave <= timeline;
        
        return `📊 **STRUCTURED FINANCIAL PLAN**

🎯 **GOAL:** ${goal}
⏰ **Timeline:** ${timeline} months
💰 **Estimated Budget:** ₹${estimatedCapex.toLocaleString()}
🏦 **Current Savings:** ₹${savings.toLocaleString()}
📈 **Additional Needed:** ₹${totalNeeded.toLocaleString()}

💵 **FINANCIAL CAPACITY**
• Monthly Net Cash Flow: ₹${netCashFlow.toLocaleString()}
• Monthly Savings Target: ₹${monthlySavingsCapacity.toLocaleString()}
• Time to Save: ${monthsToSave === Infinity ? 'Insufficient cash flow' : Math.ceil(monthsToSave) + ' months'}

${isFeasible ? '✅ **ACHIEVABLE**' : '⚠️ **CHALLENGING**'}
Confidence Level: ${isFeasible ? 'High' : 'Medium'}

🎯 **NEXT STEPS:**
1. Set up dedicated savings account
2. Automate monthly transfers
3. Track progress monthly
4. Review and adjust quarterly

${funding === 'loan' ? '🏦 **LOAN CONSIDERATIONS:**\n• Prepare financial statements\n• Compare interest rates\n• Consider loan amount: ₹' + Math.ceil(totalNeeded/10000)*10000 : ''}`;
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