import json
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import calendar

@dataclass
class BusinessGoal:
    description: str
    timeline_months: int
    goal_type: str  # 'expansion', 'equipment', 'hiring', 'inventory', 'other'

@dataclass
class FinancialInfo:
    monthly_inflow: float
    monthly_outflow: float
    current_savings: float
    preferred_funding: str  # 'self-funded', 'loan', 'external'

@dataclass
class MonthlyPlan:
    month: int
    target_savings: float
    cumulative_savings: float
    milestone: str
    actions: List[str]
    risk_level: str

class FinancialAdvisor:
    def __init__(self):
        # Industry benchmarks for different business goals
        self.capex_estimates = {
            'expansion': {
                'new_city': 50000,
                'new_location': 75000,
                'franchise': 100000,
                'online_expansion': 15000
            },
            'equipment': {
                'manufacturing': 80000,
                'office_setup': 25000,
                'restaurant': 60000,
                'retail': 40000,
                'tech_hardware': 30000
            },
            'hiring': {
                'per_employee_annual': 65000,  # salary + benefits + overhead
                'recruitment_costs': 5000,
                'training_costs': 3000
            },
            'inventory': {
                'retail_expansion': 30000,
                'seasonal_stock': 20000,
                'bulk_purchase': 15000
            }
        }
        
        self.risk_factors = {
            'market_volatility': 0.15,
            'seasonal_business': 0.20,
            'new_market_entry': 0.25,
            'equipment_depreciation': 0.10
        }

    def classify_goal(self, description: str) -> Tuple[str, str]:
        """Classify the business goal and determine specific type"""
        description_lower = description.lower()
        
        if any(word in description_lower for word in ['expand', 'new city', 'location', 'branch']):
            if 'city' in description_lower or 'location' in description_lower:
                return 'expansion', 'new_location'
            return 'expansion', 'online_expansion'
        
        elif any(word in description_lower for word in ['hire', 'staff', 'employee', 'team']):
            return 'hiring', 'staff_expansion'
        
        elif any(word in description_lower for word in ['equipment', 'machinery', 'tools', 'hardware']):
            if 'manufacturing' in description_lower:
                return 'equipment', 'manufacturing'
            elif 'restaurant' in description_lower or 'kitchen' in description_lower:
                return 'equipment', 'restaurant'
            elif 'office' in description_lower:
                return 'equipment', 'office_setup'
            return 'equipment', 'tech_hardware'
        
        elif any(word in description_lower for word in ['inventory', 'stock', 'products']):
            return 'inventory', 'retail_expansion'
        
        return 'other', 'general'

    def estimate_capex(self, goal: BusinessGoal, description: str) -> float:
        """Estimate capital expenditure based on goal type and description"""
        goal_type, specific_type = self.classify_goal(description)
        
        base_estimate = 0
        
        if goal_type in self.capex_estimates:
            category = self.capex_estimates[goal_type]
            
            if goal_type == 'hiring':
                # Extract number of employees from description
                import re
                numbers = re.findall(r'\d+', description)
                num_employees = int(numbers[0]) if numbers else 1
                
                base_estimate = (
                    category['per_employee_annual'] * num_employees +
                    category['recruitment_costs'] * num_employees +
                    category['training_costs'] * num_employees
                )
            else:
                base_estimate = category.get(specific_type, list(category.values())[0])
        
        # Apply risk buffer (15-25% depending on goal type)
        risk_buffer = 0.20 if goal_type == 'expansion' else 0.15
        total_estimate = base_estimate * (1 + risk_buffer)
        
        return round(total_estimate, 2)

    def calculate_monthly_savings_capacity(self, financial_info: FinancialInfo) -> float:
        """Calculate how much can be saved monthly"""
        net_cash_flow = financial_info.monthly_inflow - financial_info.monthly_outflow
        
        # Conservative approach: save 70% of net positive cash flow
        if net_cash_flow > 0:
            return round(net_cash_flow * 0.70, 2)
        return 0

    def create_financial_plan(self, goal: BusinessGoal, financial_info: FinancialInfo) -> Dict:
        """Create comprehensive financial plan"""
        
        # Estimate required capital
        estimated_capex = self.estimate_capex(goal, goal.description)
        monthly_savings_capacity = self.calculate_monthly_savings_capacity(financial_info)
        
        # Calculate if goal is achievable
        total_needed = estimated_capex - financial_info.current_savings
        months_to_save = total_needed / monthly_savings_capacity if monthly_savings_capacity > 0 else float('inf')
        
        # Determine feasibility
        is_feasible = months_to_save <= goal.timeline_months
        
        # Create monthly plan
        monthly_plans = self._create_monthly_milestones(
            goal, financial_info, estimated_capex, monthly_savings_capacity
        )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            goal, financial_info, estimated_capex, is_feasible
        )
        
        return {
            'goal_analysis': {
                'description': goal.description,
                'timeline_months': goal.timeline_months,
                'estimated_budget': estimated_capex,
                'current_savings': financial_info.current_savings,
                'additional_needed': max(0, total_needed)
            },
            'financial_capacity': {
                'monthly_net_flow': financial_info.monthly_inflow - financial_info.monthly_outflow,
                'monthly_savings_target': monthly_savings_capacity,
                'months_needed_to_save': round(months_to_save, 1) if months_to_save != float('inf') else 'Insufficient cash flow'
            },
            'feasibility': {
                'is_achievable': is_feasible,
                'confidence_level': 'High' if is_feasible else 'Low',
                'risk_assessment': self._assess_risks(goal, financial_info)
            },
            'monthly_plan': monthly_plans,
            'recommendations': recommendations,
            'alternatives': self._suggest_alternatives(goal, financial_info, estimated_capex) if not is_feasible else []
        }

    def _create_monthly_milestones(self, goal: BusinessGoal, financial_info: FinancialInfo, 
                                 estimated_capex: float, monthly_savings: float) -> List[MonthlyPlan]:
        """Create detailed monthly milestones"""
        plans = []
        cumulative_savings = financial_info.current_savings
        target_per_month = (estimated_capex - financial_info.current_savings) / goal.timeline_months
        
        for month in range(1, goal.timeline_months + 1):
            # Adjust savings target based on capacity
            actual_savings = min(monthly_savings, target_per_month)
            cumulative_savings += actual_savings
            
            # Determine milestone and actions
            progress_percentage = (cumulative_savings / estimated_capex) * 100
            
            if month <= goal.timeline_months * 0.25:
                milestone = "Foundation Phase"
                actions = ["Set up dedicated savings account", "Optimize current expenses", "Research suppliers/vendors"]
                risk_level = "Low"
            elif month <= goal.timeline_months * 0.50:
                milestone = "Accumulation Phase"
                actions = ["Continue aggressive saving", "Secure preliminary quotes", "Refine business plan"]
                risk_level = "Low"
            elif month <= goal.timeline_months * 0.75:
                milestone = "Preparation Phase"
                actions = ["Finalize vendor agreements", "Secure permits/licenses", "Prepare implementation timeline"]
                risk_level = "Medium"
            else:
                milestone = "Implementation Phase"
                actions = ["Execute the plan", "Monitor cash flow closely", "Track ROI metrics"]
                risk_level = "High"
            
            plans.append(MonthlyPlan(
                month=month,
                target_savings=actual_savings,
                cumulative_savings=round(cumulative_savings, 2),
                milestone=milestone,
                actions=actions,
                risk_level=risk_level
            ))
        
        return plans

    def _assess_risks(self, goal: BusinessGoal, financial_info: FinancialInfo) -> List[str]:
        """Assess potential risks"""
        risks = []
        
        net_flow = financial_info.monthly_inflow - financial_info.monthly_outflow
        
        if net_flow < financial_info.monthly_outflow * 0.20:
            risks.append("Low cash flow buffer - vulnerable to unexpected expenses")
        
        if goal.timeline_months < 6:
            risks.append("Aggressive timeline may require external funding")
        
        if 'expansion' in goal.description.lower():
            risks.append("Market entry risks in new locations")
        
        if financial_info.current_savings < financial_info.monthly_outflow * 3:
            risks.append("Insufficient emergency fund")
        
        return risks

    def _generate_recommendations(self, goal: BusinessGoal, financial_info: FinancialInfo, 
                                estimated_capex: float, is_feasible: bool) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if is_feasible:
            recommendations.extend([
                "✅ Your goal is achievable with current cash flow",
                "💰 Set up automatic transfers to a dedicated savings account",
                "📊 Review and optimize monthly expenses to increase savings rate",
                "🎯 Consider accelerating timeline if cash flow improves"
            ])
        else:
            recommendations.extend([
                "⚠️ Current timeline may be challenging with existing cash flow",
                "💡 Consider extending timeline by 3-6 months",
                "🏦 Explore business loan options for faster implementation",
                "📈 Focus on increasing monthly revenue before major investment"
            ])
        
        # Funding-specific recommendations
        if financial_info.preferred_funding == 'loan':
            recommendations.append("🏦 Prepare financial statements for loan application")
        elif financial_info.preferred_funding == 'external':
            recommendations.append("👥 Develop investor pitch and business plan")
        
        return recommendations

    def _suggest_alternatives(self, goal: BusinessGoal, financial_info: FinancialInfo, 
                            estimated_capex: float) -> List[Dict]:
        """Suggest alternative approaches"""
        alternatives = []
        
        # Phased approach
        alternatives.append({
            'option': 'Phased Implementation',
            'description': f'Break down the {goal.description} into smaller phases',
            'budget_reduction': '40-60%',
            'timeline_impact': 'Extends by 6-12 months',
            'benefits': ['Lower initial investment', 'Reduced risk', 'Learn and adjust']
        })
        
        # Lease vs buy
        if 'equipment' in goal.description.lower():
            alternatives.append({
                'option': 'Equipment Leasing',
                'description': 'Lease equipment instead of purchasing',
                'budget_reduction': '70-80%',
                'timeline_impact': 'Can start immediately',
                'benefits': ['Lower upfront cost', 'Maintenance included', 'Tax benefits']
            })
        
        # Partnership approach
        alternatives.append({
            'option': 'Strategic Partnership',
            'description': 'Partner with another business to share costs',
            'budget_reduction': '30-50%',
            'timeline_impact': 'May accelerate timeline',
            'benefits': ['Shared risk', 'Combined expertise', 'Faster market entry']
        })
        
        return alternatives

    def format_plan_output(self, plan: Dict) -> str:
        """Format the plan into a user-friendly output"""
        output = []
        
        # Header
        output.append("🎯 SMART FINANCIAL PLAN FOR YOUR BUSINESS GOAL")
        output.append("=" * 50)
        
        # Goal Analysis
        goal_info = plan['goal_analysis']
        output.append(f"\n📋 GOAL: {goal_info['description']}")
        output.append(f"⏰ Timeline: {goal_info['timeline_months']} months")
        output.append(f"💰 Estimated Budget: ${goal_info['estimated_budget']:,.2f}")
        output.append(f"🏦 Current Savings: ${goal_info['current_savings']:,.2f}")
        output.append(f"📊 Additional Needed: ${goal_info['additional_needed']:,.2f}")
        
        # Financial Capacity
        capacity = plan['financial_capacity']
        output.append(f"\n💵 FINANCIAL CAPACITY")
        output.append(f"Monthly Net Cash Flow: ${capacity['monthly_net_flow']:,.2f}")
        output.append(f"Monthly Savings Target: ${capacity['monthly_savings_target']:,.2f}")
        output.append(f"Time to Save: {capacity['months_needed_to_save']} months")
        
        # Feasibility
        feasibility = plan['feasibility']
        status = "✅ ACHIEVABLE" if feasibility['is_achievable'] else "⚠️ CHALLENGING"
        output.append(f"\n{status}")
        output.append(f"Confidence Level: {feasibility['confidence_level']}")
        
        # Risks
        if feasibility['risk_assessment']:
            output.append(f"\n⚠️ RISK ASSESSMENT:")
            for risk in feasibility['risk_assessment']:
                output.append(f"  • {risk}")
        
        # Monthly Plan
        output.append(f"\n📅 MONTHLY SAVINGS PLAN")
        output.append("-" * 30)
        for monthly_plan in plan['monthly_plan'][:6]:  # Show first 6 months
            output.append(f"Month {monthly_plan.month}: {monthly_plan.milestone}")
            output.append(f"  💰 Save: ${monthly_plan.target_savings:,.2f}")
            output.append(f"  📈 Total: ${monthly_plan.cumulative_savings:,.2f}")
            output.append(f"  🎯 Actions: {', '.join(monthly_plan.actions[:2])}")
            output.append("")
        
        # Recommendations
        output.append("💡 RECOMMENDATIONS:")
        for rec in plan['recommendations']:
            output.append(f"  {rec}")
        
        # Alternatives (if any)
        if plan['alternatives']:
            output.append(f"\n🔄 ALTERNATIVE OPTIONS:")
            for alt in plan['alternatives']:
                output.append(f"  {alt['option']}: {alt['description']}")
                output.append(f"    Budget Reduction: {alt['budget_reduction']}")
        
        return "\n".join(output)

# Example usage function
def analyze_business_goal(goal_description: str, timeline_months: int, 
                         monthly_inflow: float, monthly_outflow: float,
                         current_savings: float = 0, preferred_funding: str = 'self-funded'):
    """Main function to analyze business goal and create financial plan"""
    
    advisor = FinancialAdvisor()
    
    goal = BusinessGoal(
        description=goal_description,
        timeline_months=timeline_months,
        goal_type=""  # Will be determined by classifier
    )
    
    financial_info = FinancialInfo(
        monthly_inflow=monthly_inflow,
        monthly_outflow=monthly_outflow,
        current_savings=current_savings,
        preferred_funding=preferred_funding
    )
    
    plan = advisor.create_financial_plan(goal, financial_info)
    formatted_output = advisor.format_plan_output(plan)
    
    return formatted_output, plan

if __name__ == "__main__":
    # Example usage
    result, detailed_plan = analyze_business_goal(
        goal_description="Expand to 2 new cities and hire 3 additional staff members",
        timeline_months=12,
        monthly_inflow=45000,
        monthly_outflow=35000,
        current_savings=25000,
        preferred_funding="self-funded"
    )
    
    print(result)