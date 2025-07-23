import os
from typing import TypedDict, Annotated, List, Dict
from langgraph.graph import StateGraph, START, END, add_messages
from logic import classify_input, search_web_information, generate_search_response, handle_chat, route_conversation
from financial_advisor import analyze_business_goal, FinancialAdvisor

class ConversationState(TypedDict):
    messages: Annotated[list, add_messages]
    user_input: str
    conversation_type: str
    context: dict
    session_id: str
    needs_web_search: bool
    search_results: List[Dict]
    search_queries: List[str]
    sources: List[str]
    # Financial advisor specific fields
    is_financial_query: bool
    financial_plan: Dict
    business_goal: str
    timeline: int
    financial_data: Dict

def detect_financial_query(state):
    """Detect if the user input is related to financial planning or business goals"""
    user_input = state["user_input"].lower()
    
    financial_keywords = [
        'expand', 'hire', 'equipment', 'invest', 'budget', 'capital', 'funding',
        'loan', 'savings', 'cash flow', 'business plan', 'growth', 'scale',
        'new location', 'staff', 'inventory', 'financial plan'
    ]
    
    is_financial = any(keyword in user_input for keyword in financial_keywords)
    
    return {
        **state,
        "is_financial_query": is_financial
    }

def extract_financial_parameters(state):
    """Extract financial planning parameters from user input"""
    user_input = state["user_input"]
    
    # This is a simplified extraction - in production, you'd use NLP
    # to extract structured data from natural language
    
    # Default values - in real implementation, these would be extracted
    # from the user input or requested from the user
    default_params = {
        "goal_description": user_input,
        "timeline_months": 12,  # Default 1 year
        "monthly_inflow": 50000,  # Would be extracted or requested
        "monthly_outflow": 40000,  # Would be extracted or requested
        "current_savings": 10000,  # Would be extracted or requested
        "preferred_funding": "self-funded"
    }
    
    return {
        **state,
        "financial_data": default_params
    }

def generate_financial_plan(state):
    """Generate comprehensive financial plan using the financial advisor"""
    financial_data = state.get("financial_data", {})
    
    try:
        formatted_plan, detailed_plan = analyze_business_goal(
            goal_description=financial_data.get("goal_description", "Business expansion"),
            timeline_months=financial_data.get("timeline_months", 12),
            monthly_inflow=financial_data.get("monthly_inflow", 50000),
            monthly_outflow=financial_data.get("monthly_outflow", 40000),
            current_savings=financial_data.get("current_savings", 10000),
            preferred_funding=financial_data.get("preferred_funding", "self-funded")
        )
        
        return {
            **state,
            "financial_plan": detailed_plan,
            "messages": state["messages"] + [
                {"role": "user", "content": state["user_input"]},
                {"role": "assistant", "content": formatted_plan}
            ]
        }
    except Exception as e:
        error_message = f"I apologize, but I encountered an error while creating your financial plan: {str(e)}. Please provide more specific details about your business goal, timeline, and current financial situation."
        
        return {
            **state,
            "messages": state["messages"] + [
                {"role": "user", "content": state["user_input"]},
                {"role": "assistant", "content": error_message}
            ]
        }

def route_enhanced_conversation(state):
    """Enhanced routing that includes financial planning"""
    if state.get("is_financial_query", False):
        return "extract_financial_parameters"
    elif state.get("needs_web_search", False):
        return "search_web_information"
    else:
        return "handle_chat"

def create_enhanced_workflow():
    """Create enhanced workflow with financial planning capabilities"""
    workflow = StateGraph(ConversationState)
    
    # Add all nodes
    workflow.add_node("classify_input", classify_input)
    workflow.add_node("detect_financial_query", detect_financial_query)
    workflow.add_node("extract_financial_parameters", extract_financial_parameters)
    workflow.add_node("generate_financial_plan", generate_financial_plan)
    workflow.add_node("search_web_information", search_web_information)
    workflow.add_node("generate_search_response", generate_search_response)
    workflow.add_node("handle_chat", handle_chat)

    # Define the flow
    workflow.add_edge(START, "classify_input")
    workflow.add_edge("classify_input", "detect_financial_query")
    
    # Enhanced conditional routing
    workflow.add_conditional_edges("detect_financial_query", route_enhanced_conversation, {
        "extract_financial_parameters": "extract_financial_parameters",
        "search_web_information": "search_web_information",
        "handle_chat": "handle_chat"
    })
    
    # Financial planning flow
    workflow.add_edge("extract_financial_parameters", "generate_financial_plan")
    workflow.add_edge("generate_financial_plan", END)
    
    # Search flow
    workflow.add_edge("search_web_information", "generate_search_response")
    workflow.add_edge("generate_search_response", END)
    
    # Chat flow
    workflow.add_edge("handle_chat", END)

    return workflow.compile()

if __name__ == "__main__":
    # Test the enhanced workflow with financial planning
    wf = create_enhanced_workflow()

    # Test financial planning query
    financial_test_state = {
        "messages": [],
        "user_input": "I want to expand my restaurant business to 2 new locations and hire 5 additional staff members within the next 18 months. My monthly revenue is $75,000 and expenses are $60,000. I have $30,000 in savings.",
        "conversation_type": "",
        "context": {},
        "session_id": "financial-demo-123",
        "needs_web_search": False,
        "search_results": [],
        "search_queries": [],
        "sources": [],
        "is_financial_query": False,
        "financial_plan": {},
        "business_goal": "",
        "timeline": 0,
        "financial_data": {}
    }

    print("🏢 FINANCIAL PLANNING TEST")
    print("=" * 50)
    result = wf.invoke(financial_test_state)
    
    for msg in result["messages"]:
        if isinstance(msg, dict):
            print(f"\n{msg['role'].upper()}:")
            print(msg['content'])
        else:
            print(f"\n{type(msg).__name__}:")
            print(msg.content)
    
    print("\n" + "=" * 50)
    
    # Test regular search query
    search_test_state = {
        "messages": [],
        "user_input": "What are the latest trends in small business financing for 2025?",
        "conversation_type": "",
        "context": {},
        "session_id": "search-demo-123",
        "needs_web_search": True,
        "search_results": [],
        "search_queries": [],
        "sources": [],
        "is_financial_query": False,
        "financial_plan": {},
        "business_goal": "",
        "timeline": 0,
        "financial_data": {}
    }
    
    print("\n🔍 SEARCH TEST")
    print("=" * 50)
    search_result = wf.invoke(search_test_state)
    
    for msg in search_result["messages"]:
        if isinstance(msg, dict):
            print(f"\n{msg['role'].upper()}:")
            print(msg['content'])
        else:
            print(f"\n{type(msg).__name__}:")
            print(msg.content)