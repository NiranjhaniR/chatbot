import os
from langchain_community.utilities import SerpAPIWrapper

def get_search_tool():
    api_key = "****"
    if not api_key:
        raise EnvironmentError("SERPAPI_API_KEY not set in environment variables.")
    return SerpAPIWrapper(serpapi_api_key=api_key)
