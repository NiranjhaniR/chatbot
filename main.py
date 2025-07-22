import os
from typing import TypedDict, Annotated, List, Dict
from langgraph.graph import StateGraph, START, END, add_messages
from logic import classify_input, search_web_information, generate_search_response, handle_chat, route_conversation

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


def create_workflow():
    workflow = StateGraph(ConversationState)
    workflow.add_node("classify_input", classify_input)
    workflow.add_node("search_web_information", search_web_information)
    workflow.add_node("generate_search_response", generate_search_response)
    workflow.add_node("handle_chat", handle_chat)

    workflow.add_edge(START, "classify_input")
    workflow.add_conditional_edges("classify_input", route_conversation, {
        "search_web_information": "search_web_information",
        "handle_chat": "handle_chat"
    })
    workflow.add_edge("search_web_information", "generate_search_response")
    workflow.add_edge("generate_search_response", END)
    workflow.add_edge("handle_chat", END)

    return workflow.compile()


if __name__ == "__main__":
    wf = create_workflow()

    initial_state = {
        "messages": [],
        "user_input": "Should I buy nifty50 or not?",
        "conversation_type": "",
        "context": {},
        "session_id": "demo-123",
        "needs_web_search": True,
        "search_results": [],
        "search_queries": [],
        "sources": []
    }

    result = wf.invoke(initial_state)
    print("💬 Response:\n")
    for msg in result["messages"]:
        print(msg.content)
