#!/usr/bin/env python3
"""
Demo script for the Smart Financial Advisor
Shows various business scenarios and financial planning outputs
"""

import sys
from financial_advisor import analyze_business_goal

def demo_scenarios():
    """Run multiple demo scenarios to showcase the financial advisor"""
    
    scenarios = [
        {
            "name": "Restaurant Expansion",
            "goal": "Open 2 new restaurant locations in nearby cities",
            "timeline": 18,
            "inflow": 85000,
            "outflow": 70000,
            "savings": 45000,
            "funding": "self-funded"
        },
        {
            "name": "Tech Startup Scaling",
            "goal": "Hire 8 software developers and upgrade office equipment",
            "timeline": 12,
            "inflow": 120000,
            "outflow": 95000,
            "savings": 25000,
            "funding": "external"
        },
        {
            "name": "Manufacturing Equipment",
            "goal": "Purchase new manufacturing equipment to increase production capacity",
            "timeline": 8,
            "inflow": 60000,
            "outflow": 52000,
            "savings": 15000,
            "funding": "loan"
        },
        {
            "name": "Retail Inventory Expansion",
            "goal": "Expand inventory for seasonal sales and add 3 part-time staff",
            "timeline": 6,
            "inflow": 35000,
            "outflow": 28000,
            "savings": 8000,
            "funding": "self-funded"
        },
        {
            "name": "Service Business Growth",
            "goal": "Hire 5 consultants and open office in new city",
            "timeline": 15,
            "inflow": 95000,
            "outflow": 75000,
            "savings": 35000,
            "funding": "self-funded"
        }
    ]
    
    print("🎯 SMART FINANCIAL ADVISOR - DEMO SCENARIOS")
    print("=" * 60)
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n📊 SCENARIO {i}: {scenario['name']}")
        print("-" * 40)
        
        try:
            result, detailed_plan = analyze_business_goal(
                goal_description=scenario['goal'],
                timeline_months=scenario['timeline'],
                monthly_inflow=scenario['inflow'],
                monthly_outflow=scenario['outflow'],
                current_savings=scenario['savings'],
                preferred_funding=scenario['funding']
            )
            
            print(result)
            
            # Show key metrics
            print(f"\n📈 KEY METRICS:")
            print(f"  Feasibility: {'✅ Achievable' if detailed_plan['feasibility']['is_achievable'] else '⚠️ Challenging'}")
            print(f"  Risk Level: {detailed_plan['feasibility']['confidence_level']}")
            print(f"  Monthly Savings Needed: ${detailed_plan['financial_capacity']['monthly_savings_target']:,.2f}")
            
        except Exception as e:
            print(f"❌ Error in scenario: {e}")
        
        print("\n" + "=" * 60)
        
        # Pause between scenarios for readability
        if i < len(scenarios):
            try:
                if sys.stdin.isatty():
                    input("Press Enter to continue to next scenario...")
                else:
                    print("(Continuing to next scenario...)")
            except (EOFError, KeyboardInterrupt):
                print("\nContinuing to next scenario...")

def interactive_demo():
    """Interactive demo where user can input their own scenario"""
    print("\n🎯 INTERACTIVE FINANCIAL ADVISOR")
    print("=" * 40)
    print("Let's create a financial plan for your business goal!")
    
    try:
        # Get user input
        if not sys.stdin.isatty():
            print("Interactive mode not available in non-interactive environment.")
            return
            
        goal = input("\n📋 Describe your business goal: ")
        timeline = int(input("⏰ Timeline in months: "))
        inflow = float(input("💰 Monthly revenue/inflow ($): "))
        outflow = float(input("💸 Monthly expenses/outflow ($): "))
        savings = float(input("🏦 Current savings ($): "))
        
        print("\n💡 Funding preferences:")
        print("1. Self-funded")
        print("2. Business loan")
        print("3. External funding/investors")
        
        funding_choice = input("Choose (1-3): ")
        funding_map = {"1": "self-funded", "2": "loan", "3": "external"}
        funding = funding_map.get(funding_choice, "self-funded")
        
        print("\n🔄 Generating your personalized financial plan...")
        print("-" * 50)
        
        result, detailed_plan = analyze_business_goal(
            goal_description=goal,
            timeline_months=timeline,
            monthly_inflow=inflow,
            monthly_outflow=outflow,
            current_savings=savings,
            preferred_funding=funding
        )
        
        print(result)
        
        # Offer to save the plan
        save_plan = input("\n💾 Would you like to save this plan to a file? (y/n): ") if sys.stdin.isatty() else 'n'
        if save_plan.lower() == 'y':
            filename = f"financial_plan_{goal.replace(' ', '_')[:20]}.txt"
            with open(filename, 'w') as f:
                f.write(result)
            print(f"✅ Plan saved to {filename}")
        
    except ValueError:
        print("❌ Please enter valid numbers for financial data.")
    except EOFError:
        print("\n❌ Input not available in non-interactive environment.")
    except KeyboardInterrupt:
        print("\n👋 Thanks for using the Financial Advisor!")
    except Exception as e:
        print(f"❌ An error occurred: {e}")

if __name__ == "__main__":
    try:
        if sys.stdin.isatty():
            print("🏢 SMART FINANCIAL ADVISOR FOR SMBs")
            print("Choose your demo mode:")
            print("1. View pre-built scenarios")
            print("2. Interactive planning session")
            print("3. Both")
            
            choice = input("\nEnter your choice (1-3): ")
            
            if choice == "1":
                demo_scenarios()
            elif choice == "2":
                interactive_demo()
            elif choice == "3":
                demo_scenarios()
                print("\n" + "="*60)
                interactive_demo()
            else:
                print("Invalid choice. Running demo scenarios...")
                demo_scenarios()
        else:
            print("🏢 SMART FINANCIAL ADVISOR FOR SMBs - Non-interactive mode")
            print("Running demo scenarios...")
            demo_scenarios()
    except (EOFError, KeyboardInterrupt):
        print("\n🏢 Running demo scenarios in non-interactive mode...")
        demo_scenarios()