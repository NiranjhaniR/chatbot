
from langchain.schema import HumanMessage, AIMessage

from search_tool import get_search_tool
from langchain_groq import ChatGroq

llm = ChatGroq(groq_api_key="******", model_name="compound-beta-mini")

search_tool = get_search_tool()

def classify_input(state):
    user_input = state["user_input"]
    prompt = f"""
    Classify this user input into one of these categories:
    Input: "{user_input}"
    Categories:
    - chat: General conversation, questions, casual talk
    - research: User wants research done on a topic
    - task: User wants help with a specific task or problem
    - help: User needs help understanding something
    Respond with just the category.
    """
    result = llm.invoke([HumanMessage(content=prompt)])
    needs_search = any(kw in user_input.lower() for kw in ["latest", "current", "2025", "now", "finance", "today", "research"])
    return {
        **state,
        "conversation_type": result.content.strip().lower(),
        "needs_web_search": needs_search,
        "search_queries": [user_input]
    }

def classify_user_input(user_input):
    if any(word in user_input for word in ["hello", "hi", "hey"]):
        classification = "greetings"
    else:
        classification = "search"
    return classification


def search_web_information(state):
    queries = state.get("search_queries", [])
    results = []
    for q in queries:
        try:
            res = search_tool.results(q)
            if res:
                results.extend(res.get("organic_results"))
                break
        except Exception as e:
            print(f"Search failed: {e}")
    return {
        **state,
        "search_results": results,
        "sources": [r.get("link", "no links") for r in results]
    }


def generate_search_response(state):
    query = state["user_input"]
    search_snippets = "\n".join(
        [f"{i+1}. {r.get('title')} - {r.get('link')}" for i, r in enumerate(state.get("search_results", []))]
    )
    prompt = f"""
    Answer this query: "{query}"

    Use the following search results and in result provide link to website which are used for research
    {search_snippets}
    """
    reply = llm.invoke([HumanMessage(content=prompt)])
    return {
        **state,
        "messages": state["messages"] + [
            HumanMessage(content=query),
            AIMessage(content=reply.content)
        ]
    }


def handle_chat(state):
    response = llm.invoke([HumanMessage(content=state["user_input"])])
    return {
        **state,
        "messages": state["messages"] + [
            HumanMessage(content=state["user_input"]),
            AIMessage(content=response.content)
        ]
    }


def route_conversation(state):
    return "search_web_information" if state.get("needs_web_search") else "handle_chat"
